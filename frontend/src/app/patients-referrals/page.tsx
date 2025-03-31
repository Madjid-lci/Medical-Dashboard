"use client"; // Enable client-side rendering in Next.js

import React, { useEffect, useState, useCallback, useRef } from "react"; // Import React and hooks
import "./page.css"; // Import CSS styles
import Modal from "./modal"; // Import Modal component

// Define backend URL from env variable or fallback to localhost
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:4000";
// Define number of patients to display per page
const PATIENTS_PER_PAGE = 10;

console.log("Using Backend URL:", BACKEND_URL);

// Patient interface defines the structure for each patient record
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

// Default columns to be displayed
const DEFAULT_COLUMNS: (keyof Patient)[] = [
  "encounterId",
  "feed_vol",
  "oxygen_flow_rate",
  "resp_rate",
  "bmi",
];

// Main component for handling patients and referrals
const PatientsReferrals: React.FC = () => {
  // Component states for filtering, pagination, and data handling
  const [filter, setFilter] = useState<"all" | "needReferral" | "noReferral">("all");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [inputPage, setInputPage] = useState<string>("1");
  const [isEditingPage, setIsEditingPage] = useState(false);
  const [showFilterContainer, setShowFilterContainer] = useState(false); // Toggle advanced filter display
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [exactMatch, setExactMatch] = useState(false);
  const [rawInput, setRawInput] = useState<{ [key in keyof Patient]?: [string, string] }>({});

  // Modal state and handlers
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  // Open Modal with selected patient details
  const handleOpenModal = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsModalOpen(true);
  };

  // Close Modal and clear selection
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPatient(null);
  };

  // State for temporary range filter input from the user
  const [pendingRangeFilters, setPendingRangeFilters] = useState<{ [key in keyof Patient]?: [number | null, number | null] }>({});
  // State for applied range filters (used in actual filtering)
  const [appliedFilters, setAppliedFilters] = useState<{ [key in keyof Patient]?: [number | null, number | null] }>({});

  // States for sorting and searching patients
  const [sortOrder] = useState<"asc" | "desc">("asc");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // State to hold minimum and maximum values for each numeric field
  const [minMaxValues, setMinMaxValues] = useState<{ [key in keyof Patient]?: [number | null, number | null] }>({});

  // Calculate min/max values for each field across all patients
  const calculateMinMaxValues = (patients: Patient[]) => {
    const values: { [key in keyof Patient]?: [number | null, number | null] } = {};

    patients.forEach((patient) => {
      for (const key in patient) {
        const typedKey = key as keyof Patient;
        const value = patient[typedKey] as number | null;
        if (value !== null) {
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

  // Recalculate min/max values whenever patients data is updated
  useEffect(() => {
    if (patients.length > 0) {
      calculateMinMaxValues(patients);
    }
  }, [patients]);

  // State for active range filters (min/max for each field)
  const [rangeFilters, setRangeFilters] = useState<{ [key in keyof Patient]?: [number | null, number | null] }>({});

  // Fetch patients data from the backend API
  const fetchPatients = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${BACKEND_URL}/patients`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Server Error: ${response.status}`);
      }

      const data = await response.json();
      // If patients data is returned, update state; otherwise set to empty
      if (Array.isArray(data.patients) && data.patients.length > 0) {
        setPatients(data.patients);
      } else {
        setPatients([]);
      }
    } catch (err: any) {
      setError("Failed to fetch data. Check your connection & backend.");
      setPatients([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch patients on mount and clear refresh interval on unmount
  useEffect(() => {
    fetchPatients();
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [fetchPatients]);

  // Reset pagination when filter/search/sort criteria change
  useEffect(() => {
    setCurrentPage(1);
    setInputPage("1");
  }, [filter, searchQuery, sortOrder, exactMatch]);

  // Function to filter patients based on referral, search query, and range filters
  const getFilteredPatients = () => {
    let filteredData = patients;

    // Filter by referral type
    if (filter === "needReferral") {
      filteredData = filteredData.filter((patient) => patient.referral === 1);
    } else if (filter === "noReferral") {
      filteredData = filteredData.filter((patient) => patient.referral === 0);
    }

    // Filter by search query on encounterId
    if (searchQuery) {
      filteredData = filteredData.filter((patient) => {
        if (exactMatch) {
          return patient.encounterId.toString() === searchQuery;
        } else {
          return patient.encounterId.toString().startsWith(searchQuery);
        }
      });
    }

    // Apply range filters based on appliedFilters state
    for (const key in appliedFilters) {
      const [min, max] = appliedFilters[key as keyof Patient] ?? [null, null];
      if (min !== null || max !== null) {
        filteredData = filteredData.filter((patient) => {
          const value = patient[key as keyof Patient] as number | null;
          if (value === null) return false;
          return (min === null || value >= min) && (max === null || value <= max);
        });
      }
    }

    return filteredData;
  };

  // Determine filtered patients, total pages, and current page slice for pagination
  const filteredPatients = getFilteredPatients();
  const totalPages = Math.ceil(filteredPatients.length / PATIENTS_PER_PAGE);
  const currentPatients = filteredPatients.slice(
    (currentPage - 1) * PATIENTS_PER_PAGE,
    currentPage * PATIENTS_PER_PAGE
  );

  // Update range filter state when user changes filter values
  const handleRangeChange = (key: keyof Patient, index: number, value: string) => {
    setRangeFilters((prev) => {
      const updated = { ...prev };
      const numericValue = value ? parseFloat(value) : null;
      if (!updated[key]) updated[key] = [null, null];
      updated[key]![index] = numericValue;
      return updated;
    });
  };

  // Sync page input field with current page when not editing
  useEffect(() => {
    if (!isEditingPage) {
      setInputPage(currentPage.toString());
    }
  }, [currentPage, isEditingPage]);

  // Handle page input change
  const handlePageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputPage(e.target.value);
  };

  // Submit page change on Enter key press and validate page bounds
  const handlePageSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const targetPage = parseInt(inputPage, 10);
      if (!isNaN(targetPage)) {
        if (targetPage < 1) {
          setCurrentPage(1);
        } else if (targetPage > totalPages) {
          setCurrentPage(totalPages);
        } else {
          setCurrentPage(targetPage);
        }
      } else {
        setInputPage(currentPage.toString());
      }
      setIsEditingPage(false);
    }
  };

  // When page input loses focus, reset editing state and sync input with current page
  const handlePageBlur = () => {
    setIsEditingPage(false);
    setInputPage(currentPage.toString());
  };

  // Enable editing mode for page input and clear the field
  const handlePageClick = () => {
    setIsEditingPage(true);
    setInputPage("");
  };

  // Update temporary raw input and pending range filters for each field
  const handlePendingRangeChange = (key: keyof Patient, index: number, value: string) => {
    // Update raw input (string value for display)
    setRawInput((prev) => {
      const updated = { ...prev };
      if (!updated[key]) updated[key] = ["", ""];
      updated[key][index] = value;
      return updated;
    });

    // Update pending filters (convert to numeric with clamping to min/max)
    setPendingRangeFilters((prev) => {
      const updated = JSON.parse(JSON.stringify(prev)); // Deep copy
      let numericValue = value ? parseFloat(value) : null;
      if (!updated[key]) updated[key] = [null, null];

      if (numericValue !== null) {
        if (index === 0) {
          numericValue = Math.max(numericValue, minMaxValues[key]?.[0] ?? numericValue);
        } else if (index === 1) {
          numericValue = Math.min(numericValue, minMaxValues[key]?.[1] ?? numericValue);
        }
      }
      updated[key][index] = numericValue;
      return updated;
    });
  };

  // Apply the pending range filters to the actual filtering state and reset raw inputs
  const handleApplyFilters = () => {
    setAppliedFilters(pendingRangeFilters);
    setCurrentPage(1); // Reset pagination on filter apply
    setRawInput({}); // Clear raw input values
  };

  // On blur, validate and correct raw input values and update pending filters accordingly
  const handleRawInputBlur = (key: keyof Patient, index: number) => {
    setPendingRangeFilters((prev) => {
      const updated = { ...prev };
      let minValue = updated[key]?.[0] ?? null;
      let maxValue = updated[key]?.[1] ?? null;

      if (rawInput[key]?.[0] !== undefined) {
        minValue = parseFloat(rawInput[key]![0] || "") || null;
      }
      if (rawInput[key]?.[1] !== undefined) {
        maxValue = parseFloat(rawInput[key]![1] || "") || null;
      }
      if (minValue !== null) {
        minValue = Math.max(minValue, minMaxValues[key]?.[0] ?? minValue);
      }
      if (maxValue !== null) {
        maxValue = Math.min(maxValue, minMaxValues[key]?.[1] ?? maxValue);
      }
      // Swap values if min is greater than max
      if (minValue !== null && maxValue !== null && minValue > maxValue) {
        const temp = minValue;
        minValue = maxValue;
        maxValue = temp;
      }
      updated[key] = [minValue, maxValue];

      // Sync corrected values to raw input for display
      setRawInput((prev) => {
        const newRawInput = { ...prev };
        newRawInput[key]![0] = minValue !== null ? minValue.toString() : "";
        newRawInput[key]![1] = maxValue !== null ? maxValue.toString() : "";
        return newRawInput;
      });
      return updated;
    });
  };

  // Determine extra columns to display based on applied filters
  const extraFilterColumns = Object.keys(appliedFilters).filter(
    (key) =>
      !DEFAULT_COLUMNS.includes(key as keyof Patient) &&
      appliedFilters[key as keyof Patient]?.some((val) => val !== null)
  ) as (keyof Patient)[];

  // Insert extra columns after the BMI column in the visible columns list
  const visibleColumns: (keyof Patient)[] = (() => {
    const bmiIndex = DEFAULT_COLUMNS.indexOf("bmi") + 1;
    const copy = [...DEFAULT_COLUMNS];
    copy.splice(bmiIndex, 0, ...extraFilterColumns);
    return copy;
  })();

  // Reset all filters including referral type and search query
  const handleResetFilters = () => {
    setAppliedFilters({});
    setPendingRangeFilters({});
    setRawInput({});
    setFilter("all");
    setSearchQuery("");
    // Optionally reset sort order or other filter states here if needed
  };

  return (
    <div className="dashboard">
      <h1 className="dashboard-title">Patients Referred to Dietitian</h1>

      {/* Show Loading Message */}
      {loading && <p className="loading-message">Loading patient data...</p>}

      {/* Show Error Message */}
      {error && !loading && <p className="error-message">{error}</p>}

      <div className="control-container">
        {/* Filter Buttons */}
        <div className="filter-container">
          <button
            onClick={() => setFilter("all")}
            className={`filter-button ${filter === "all" ? "active" : ""}`}
          >
            All Patients
          </button>
          <button
            onClick={() => setFilter("needReferral")}
            className={`filter-button ${filter === "needReferral" ? "active" : ""}`}
          >
            Needs Referral
          </button>
          <button
            onClick={() => setFilter("noReferral")}
            className={`filter-button ${filter === "noReferral" ? "active" : ""}`}
          >
            No Referral Needed
          </button>
        </div>

        {/* Search + Exact Match + Toggle Filter */}
        <div className="sort-search-container">
          <input
            type="text"
            placeholder="Search by ID"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <label className="exact-match-label">
            <input
              type="checkbox"
              checked={exactMatch}
              onChange={() => setExactMatch((prev) => !prev)}
              className="exact-match-checkbox"
            />
            Exact Match
          </label>
          <button 
            onClick={() => setShowFilterContainer(!showFilterContainer)}
            className="filter-button blue-button"
          >
            {showFilterContainer ? "Hide Filters" : "Show Filters"}
          </button>
        </div>
      </div>

     {/* Advanced Filters */}
     {showFilterContainer && (
        <div className="advanced-filter-container">
          {[
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
            { label: "BMI", key: "bmi" }
          ].map(({ label, key }) => (
            <div key={key} className="filter-field">
              <label>{label}</label>
              <input
                type="number"
                placeholder={`Min (${minMaxValues[key as keyof Patient]?.[0] ?? '-'})`}
                value={rawInput[key as keyof Patient]?.[0] ?? ''}
                onChange={(e) =>
                  handlePendingRangeChange(key as keyof Patient, 0, e.target.value)
                }
                onBlur={() => handleRawInputBlur(key as keyof Patient, 0)}
              />
              <input
                type="number"
                placeholder={`Max (${minMaxValues[key as keyof Patient]?.[1] ?? '-'})`}
                value={rawInput[key as keyof Patient]?.[1] ?? ''}
                onChange={(e) =>
                  handlePendingRangeChange(key as keyof Patient, 1, e.target.value)
                }
                onBlur={() => handleRawInputBlur(key as keyof Patient, 1)}
              />
            </div>
          ))}

          {/* Apply and Reset Filters Buttons */}
          <div className="filter-button-container">
    <button onClick={handleResetFilters} className="reset-filter-button">
        Reset Filters
      </button>
      <button onClick={handleApplyFilters} className="apply-filter-button">
        Apply Filters
      </button>
    </div>
    </div>
      )}

      {/* Display Data in a Table */}
{!loading && !error && currentPatients.length > 0 ? (
  <>
    <div className="table-wrapper">
      <div className="table-scroll-container">
        <table className="patients-table">
          <thead>
            <tr>
              {visibleColumns.map((key) => (
                <th key={key}>
                  {key
                    .replace(/([a-z])([A-Z])/g, "$1 $2") // camelCase → spaced
                    .replace(/_/g, " ")                 // snake_case → spaced
                    .replace(/\b\w/g, (c) => c.toUpperCase())} {/* Capitalize words */}
                </th>
              ))}
              <th className="sticky-column more-data-column">Display More Data</th>
              <th className="sticky-column">Referral</th>
            </tr>
          </thead>
          <tbody>
            {currentPatients.map((patient, index) => (
              <tr key={index} className={index % 2 === 0 ? "even-row" : "odd-row"}>
                {visibleColumns.map((key) => (
                  <td key={key}>{patient[key] ?? "N/A"}</td>
                ))}
                <td className="sticky-column more-data-column">
                  <a
                    href="#"
                    className="more-link"
                    onClick={(e) => {
                      e.preventDefault();
                      handleOpenModal(patient);
                    }}
                  >
                    More
                  </a>
                </td>
                <td className="sticky-column">
                  <span className={patient.referral === 1 ? "need-referral" : "no-referral"}>
                    {patient.referral === 1 ? "Needs Referral" : "No Referral Needed"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
            {/* Pagination */}
            <div className="pagination">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
              >
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
                  className="pagination-input"
                  autoFocus
                  min={1}
                  max={totalPages}
                />
              ) : (
                <span onClick={handlePageClick} className="pagination-text">
                  Page {currentPage} of {totalPages}
                </span>
              )}
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
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
        </>
      ) : (
        !loading && (
          <p className="no-data-message">
            No referred patients available.
          </p>
        )
      )}
      {/* Modal is Now Cleanly Handled in `Modal.tsx` */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        selectedPatient={selectedPatient}
      />
    </div>
  );
};

export default PatientsReferrals;