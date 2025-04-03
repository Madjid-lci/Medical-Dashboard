"use client"; // Enable client-side rendering in Next.js

import React, { useState, useEffect } from "react"; // Import React and hooks
import styles from "./apd.module.css"; // Import component-specific CSS module
import Modal from "./apd.modal"; // Import the Modal component

// Define backend URL from environment variable or default to localhost
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:5000";
// Define number of patients to display per page
const PATIENTS_PER_PAGE = 10;

// Patient interface to type-check patient data
interface Patient {
  encounterId: number;
  end_tidal_co2: number | null;
  feed_vol: number | null;
  feed_vol_adm: number | null;
  fio2: number | null;
  fio2_ratio: number | null;
  insp_time: number | null;
  oxygen_flow_rate: number | null;
  peep: number | null;
  pip: number | null;
  resp_rate: number | null;
  sip: number | null;
  tidal_vol: number | null;
  tidal_vol_actual: number | null;
  tidal_vol_kg: number | null;
  tidal_vol_spon: number | null;
  bmi: number | null;
  referral: number;
}

// Default columns for display in the table
const DEFAULT_COLUMNS: (keyof Patient)[] = [
  "encounterId",
  "feed_vol",
  "oxygen_flow_rate",
  "resp_rate",
  "bmi",
];

export default function UploadPage() {
  // File upload state
  const [file, setFile] = useState<File | null>(null);
  // Message and error states for upload feedback
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");
  // Patients data state and loading indicator
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Filter & pagination states
  const [filter, setFilter] = useState<"all" | "needReferral" | "noReferral">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [inputPage, setInputPage] = useState<string>("1");
  const [isEditingPage, setIsEditingPage] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [exactMatch, setExactMatch] = useState(false);

  // Toggle to show/hide advanced filter container
  const [showFilterContainer, setShowFilterContainer] = useState(false);

  // Range filtering states for advanced filtering inputs
  const [rawInput, setRawInput] = useState<{ [key in keyof Patient]?: [string, string] }>({});
  const [pendingRangeFilters, setPendingRangeFilters] = useState<{
    [key in keyof Patient]?: [number | null, number | null];
  }>({});
  const [appliedFilters, setAppliedFilters] = useState<{
    [key in keyof Patient]?: [number | null, number | null];
  }>({});

  // Modal state and selected patient for displaying details
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  // Store min and max values for each numeric patient column for filtering purposes
  const [minMaxValues, setMinMaxValues] = useState<{
    [key in keyof Patient]?: [number | null, number | null];
  }>({});

  // Referral summary returned from the backend
  const [referralSummary, setReferralSummary] = useState<{
    referred: number;
    not_referred: number;
  } | null>(null);

  // Recalculate min/max values when patients data changes
  useEffect(() => {
    if (patients.length > 0) {
      calculateMinMaxValues(patients);
    }
  }, [patients]);

  // Function to calculate min and max for each numeric column across patients data
  const calculateMinMaxValues = (patientsData: Patient[]) => {
    const values: { [key in keyof Patient]?: [number | null, number | null] } = {};

    patientsData.forEach((patient) => {
      for (const key in patient) {
        const typedKey = key as keyof Patient;
        const value = patient[typedKey] as number | null;
        if (typeof value === "number") {
          if (!values[typedKey]) {
            values[typedKey] = [value, value];
          } else {
            values[typedKey] = [
              Math.min(values[typedKey]![0]!, value),
              Math.max(values[typedKey]![1]!, value),
            ];
          }
        }
      }
    });
    setMinMaxValues(values);
  };

  // Handle file input change event
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
      setMessage("");
      setError("");
    }
  };

  // Handle CSV upload to backend
  const handleUpload = async () => {
    if (!file) {
      setError("Please select a CSV file.");
      return;
    }

    setLoading(true);
    setMessage("");
    setError("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`${BACKEND_URL}/upload-csv`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server error:", errorText);
        throw new Error("Upload failed.");
      }

      const result = await response.json();

      // If sample_data is returned, update patients and referral summary
      if (Array.isArray(result.sample_data)) {
        setPatients(result.sample_data);
        setReferralSummary(result.referral_summary || null);
        setMessage(result.message || "Predictions generated successfully!");
      } else {
        throw new Error("No predictions (sample_data) received from server.");
      }
    } catch (err) {
      console.error(err);
      setError("Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Apply pending range filters and reset pagination
  const handleApplyFilters = () => {
    setAppliedFilters(pendingRangeFilters);
    setCurrentPage(1);
    setRawInput({});
  };

  // Validate and update pending filters when raw input loses focus
  const handleRawInputBlur = (key: keyof Patient, index: number) => {
    setPendingRangeFilters((prev) => {
      const updated = { ...prev };
      let newMin = parseFloat(rawInput[key]?.[0] || "") || null;
      let newMax = parseFloat(rawInput[key]?.[1] || "") || null;

      // Clamp newMin and newMax to allowed min/max values
      if (newMin !== null && minMaxValues[key]?.[0] !== undefined) {
        newMin = Math.max(newMin, minMaxValues[key]![0]!);
      }
      if (newMax !== null && minMaxValues[key]?.[1] !== undefined) {
        newMax = Math.min(newMax, minMaxValues[key]![1]!);
      }
      // Swap if min is greater than max
      if (newMin !== null && newMax !== null && newMin > newMax) {
        [newMin, newMax] = [newMax, newMin];
      }

      updated[key] = [newMin, newMax];
      // Update raw input state with clamped values for display
      setRawInput((prevRaw) => ({
        ...prevRaw,
        [key]: [newMin?.toString() || "", newMax?.toString() || ""],
      }));
      return updated;
    });
  };

  // Update raw input state for pending range filters on change
  const handlePendingRangeChange = (key: keyof Patient, index: number, value: string) => {
    setRawInput((prev) => ({
      ...prev,
      [key]: index === 0
        ? [value, prev[key]?.[1] || ""]
        : [prev[key]?.[0] || "", value],
    }));
  };

  // Filter patients based on referral, search query, and applied range filters
  const filteredPatients = patients.filter((patient) => {
    const matchesFilter =
      filter === "all" ||
      (filter === "needReferral" && patient.referral === 1) ||
      (filter === "noReferral" && patient.referral === 0);

    const matchesSearch = searchQuery
      ? exactMatch
        ? patient.encounterId.toString() === searchQuery
        : patient.encounterId.toString().includes(searchQuery)
      : true;

    const matchesRange = Object.entries(appliedFilters).every(([key, range]) => {
      const value = patient[key as keyof Patient];
      if (value === null || range === undefined) return true;
      const [min, max] = range;
      return (min === null || value >= min) && (max === null || value <= max);
    });

    return matchesFilter && matchesSearch && matchesRange;
  });

  // Calculate total pages and slice current patients based on current page
  const totalPages = Math.ceil(filteredPatients.length / PATIENTS_PER_PAGE);
  const indexOfLastPatient = currentPage * PATIENTS_PER_PAGE;
  const indexOfFirstPatient = indexOfLastPatient - PATIENTS_PER_PAGE;
  const currentPatients = filteredPatients.slice(indexOfFirstPatient, indexOfLastPatient);

  // Handle page input change
  const handlePageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputPage(e.target.value);
  };

  // Submit page change on Enter key, ensuring page number is within bounds
  const handlePageSubmit = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      const newPage = Math.min(Math.max(1, parseInt(inputPage) || 1), totalPages);
      setCurrentPage(newPage);
      setIsEditingPage(false);
    }
  };

  // Update current page when page input loses focus
  const handlePageBlur = () => {
    const newPage = Math.min(Math.max(1, parseInt(inputPage) || 1), totalPages);
    setCurrentPage(newPage);
    setIsEditingPage(false);
  };

  // Enable editing mode for page input
  const handlePageClick = () => {
    setIsEditingPage(true);
  };

  // Reset all filters, referral type, and search query to default
  const handleResetFilters = () => {
    setAppliedFilters({});
    setPendingRangeFilters({});
    setRawInput({});
    setFilter("all");
    setSearchQuery("");
    // Optionally, reset sort order or other filter states if needed
  };

  // Extract extra columns to display based on applied range filters (excluding default columns)
  const extraFilterColumns = Object.keys(appliedFilters).filter(
    (key) =>
      !DEFAULT_COLUMNS.includes(key as keyof Patient) &&
      appliedFilters[key as keyof Patient]?.some((val) => val !== null)
  ) as (keyof Patient)[];

  // Insert extra columns after the BMI column into the visible columns list
  const visibleColumns: (keyof Patient)[] = (() => {
    const bmiIndex = DEFAULT_COLUMNS.indexOf("bmi") + 1;
    const copy = [...DEFAULT_COLUMNS];
    copy.splice(bmiIndex, 0, ...extraFilterColumns);
    return copy;
  })();

  return (
    <div className={styles.container}>
      <h1 className={styles.header}>Analyze Patients Data</h1>
      <h2>With a Machine Learning Model</h2>

      {/* File Upload Section */}
      <label htmlFor="fileUpload" className={styles.fileLabel}>
        Select CSV File:
      </label>
      <input
        type="file"
        id="fileUpload"
        accept=".csv"
        onChange={handleFileChange}
        className={styles.fileInput}
      />
      <button onClick={handleUpload} className={styles.uploadButton} disabled={loading}>
        {loading ? "Uploading..." : "Upload CSV"}
      </button>
      {error && <p className={styles.errorMessage}>{error}</p>}
      {message && <p className={styles.successMessage}>{message}</p>}

      {/* Render separator and summary only if referralSummary exists */}
      {referralSummary && (
        <>
          <hr className={styles.separator} />
          <div className={styles.summaryContainer}>
            <h3 className={styles.summaryHeading}>Referral Summary</h3>
            <div className={styles.summaryItems}>
              <p>🟢 Not Referred: {referralSummary.not_referred}</p>
              <p>🔴 Needs Referral: {referralSummary.referred}</p>
            </div>
          </div>
        </>
      )}

      {/* Patient Data Controls */}
      <div className={styles.controlContainer}>
        <div className={styles.filterContainer}>
          <button
            onClick={() => setFilter("all")}
            className={`${styles.filterButton} ${filter === "all" ? styles.active : ""}`}
          >
            All Patients
          </button>
          <button
            onClick={() => setFilter("needReferral")}
            className={`${styles.filterButton} ${filter === "needReferral" ? styles.active : ""}`}
          >
            Needs Referral
          </button>
          <button
            onClick={() => setFilter("noReferral")}
            className={`${styles.filterButton} ${filter === "noReferral" ? styles.active : ""}`}
          >
            No Referral Needed
          </button>
        </div>

        <div className={styles.sortSearchContainer}>
          <input
            type="text"
            placeholder="Search by ID"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
          <label className={styles.exactMatchLabel}>
            <input
              type="checkbox"
              checked={exactMatch}
              onChange={() => setExactMatch((prev) => !prev)}
              className={styles.exactMatchCheckbox}
            />
            Exact Match
          </label>
          <button
            onClick={() => setShowFilterContainer((prev) => !prev)}
            className={styles.filterToggleButton}
          >
            {showFilterContainer ? "Hide Filters" : "Show Filters"}
          </button>
        </div>
      </div>

      {/* Range Filter Container */}
      {showFilterContainer && (
        <div className={styles.advancedFilterContainer}>
          {([
            { label: "End Tidal CO2", key: "end_tidal_co2" },
            { label: "Feed Volume", key: "feed_vol" },
            { label: "Feed Volume Administered", key: "feed_vol_adm" },
            { label: "FIO2", key: "fio2" },
            { label: "FIO2 Ratio", key: "fio2_ratio" },
            { label: "Inspiratory Time", key: "insp_time" },
            { label: "Oxygen Flow Rate", key: "oxygen_flow_rate" },
            { label: "PEEP", key: "peep" },
            { label: "PIP", key: "pip" },
            { label: "Respiratory Rate", key: "resp_rate" },
            { label: "SIP", key: "sip" },
            { label: "Tidal Volume", key: "tidal_vol" },
            { label: "Tidal Volume Actual", key: "tidal_vol_actual" },
            { label: "Tidal Volume Kg", key: "tidal_vol_kg" },
            { label: "Tidal Volume Spon", key: "tidal_vol_spon" },
            { label: "BMI", key: "bmi" },
          ] as { label: string; key: keyof Patient }[]).map(({ label, key }) => (
            <div key={key} className={styles.filterField}>
              <label>{label}</label>
              <input
                type="number"
                placeholder={`Min (${minMaxValues[key]?.[0] ?? "-"})`}
                value={rawInput[key]?.[0] ?? ""}
                onChange={(e) => handlePendingRangeChange(key, 0, e.target.value)}
                onBlur={() => handleRawInputBlur(key, 0)}
              />
              <input
                type="number"
                placeholder={`Max (${minMaxValues[key]?.[1] ?? "-"})`}
                value={rawInput[key]?.[1] ?? ""}
                onChange={(e) => handlePendingRangeChange(key, 1, e.target.value)}
                onBlur={() => handleRawInputBlur(key, 1)}
              />
            </div>
          ))}
          {/* Apply and Reset Filters Buttons */}
<div className={styles.filterButtonContainer}>
  <button 
    onClick={handleResetFilters} 
    className={styles.resetFilterButton}
  >
    Reset Filters
  </button>
  <button 
    onClick={handleApplyFilters} 
    className={styles.applyFilterButton}
  >
    Apply Filters
  </button>
</div>
        </div>
      )}

      {/* Patient Table */}
      {!loading && !error && currentPatients.length > 0 ? (
        <div className={styles.tableWrapper}>
          <div className={styles.tableScrollContainer}>
            <table className={styles.patientsTable}>
              <thead>
                <tr>
                  {visibleColumns.map((key) => (
                    <th
                      key={key}
                      className={key === "encounterId" ? styles.encounterIdColumn : ""}
                    >
                      {key
                        .replace(/([a-z])([A-Z])/g, "$1 $2")
                        .replace(/_/g, " ")
                        .replace(/\b\w/g, (c) => c.toUpperCase())}
                    </th>
                  ))}
                  <th className={`${styles.stickyColumn} ${styles.moreDataColumn}`}>
                    More Data
                  </th>
                  <th className={styles.stickyColumn}>Referral Prediction</th>
                </tr>
              </thead>
              <tbody>
                {currentPatients.map((patient, index) => (
                  <tr
                    key={index}
                    className={index % 2 === 0 ? styles.evenRow : styles.oddRow}
                  >
                    {visibleColumns.map((colKey) => (
                      <td
                        key={colKey}
                        className={colKey === "encounterId" ? styles.encounterIdColumn : ""}
                      >
                        {patient[colKey] ?? "N/A"}
                      </td>
                    ))}
                    <td className={`${styles.stickyColumn} ${styles.moreDataColumn}`}>
                      <a
                        href="#"
                        className={styles.moreLink}
                        onClick={(e) => {
                          e.preventDefault();
                          setSelectedPatient(patient);
                          setIsModalOpen(true);
                        }}
                      >
                        More
                      </a>
                    </td>
                    <td className={styles.stickyColumn}>
                      <span
                        className={
                          patient.referral === 1 ? styles.needReferral : styles.noReferral
                        }
                      >
                        {patient.referral === 1
                          ? "Needs Referral"
                          : "No Referral Needed"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className={styles.pagination}>
            <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>
              ⏮ First
            </button>
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              ◀ Prev
            </button>
            {isEditingPage ? (
              <input
                type="number"
                value={inputPage}
                onChange={handlePageChange}
                onKeyDown={handlePageSubmit}
                onBlur={handlePageBlur}
                className={styles.paginationInput}
                autoFocus
                min={1}
                max={totalPages}
              />
            ) : (
              <span onClick={handlePageClick} className={styles.paginationText}>
                Page {currentPage} of {totalPages}
              </span>
            )}
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next ▶
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
            >
              ⏭ Last
            </button>
          </div>
        </div>
      ) : (
        !loading && (
          <p className={styles.noDataMessage}>
            {patients.length === 0
              ? "No data available. Upload a CSV to see results."
              : "No patients match the current filters."}
          </p>
        )
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedPatient={selectedPatient}
      />
    </div>
  );
}