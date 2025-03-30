"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import "./page.lodel.css"; // Import styles
import Modal from "./modal"; // Import Modal

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:4000";
const PATIENTS_PER_PAGE = 10; // Number of patients per page

console.log("📡 Using Backend URL:", BACKEND_URL);

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

const DEFAULT_COLUMNS: (keyof Patient)[] = [
  "encounterId",
  "feed_vol",
  "oxygen_flow_rate",
  "resp_rate",
  "bmi",
];

const PatientsReferrals: React.FC = () => {
  const [filter, setFilter] = useState<"all" | "needReferral" | "noReferral">("all");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [inputPage, setInputPage] = useState<string>("1");
  const [isEditingPage, setIsEditingPage] = useState(false);
  const [showFilterContainer, setShowFilterContainer] = useState(false); // New state for filter container
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [exactMatch, setExactMatch] = useState(false);
  const [rawInput, setRawInput] = useState<{ [key in keyof Patient]?: [string, string] }>({});

  // Open Modal with patient data
  const handleOpenModal = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsModalOpen(true);
  };

  // Close Modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPatient(null);
  };

  // State to control the modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  // Temporary state for user input
  const [pendingRangeFilters, setPendingRangeFilters] = useState<{ [key in keyof Patient]?: [number | null, number | null] }>({});

  // Applied state used for actual filtering
  const [appliedFilters, setAppliedFilters] = useState<{ [key in keyof Patient]?: [number | null, number | null] }>({});

  // State for Sorting and Searching
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc"); // Sorting state
  const [searchQuery, setSearchQuery] = useState<string>(""); // Search state

  const [minMaxValues, setMinMaxValues] = useState<{ [key in keyof Patient]?: [number | null, number | null] }>({});

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
  
  useEffect(() => {
    if (patients.length > 0) {
      calculateMinMaxValues(patients);
    }
  }, [patients]);  

  const adjustRangeValues = (key: keyof Patient, index: number, value: string) => {
    setRangeFilters((prev) => {
      const updated = { ...prev };
      const numericValue = value ? parseFloat(value) : null;
  
      if (!updated[key]) updated[key] = [null, null];
  
      // Adjust according to min/max values
      if (numericValue !== null) {
        if (index === 0) {
          // Min value
          updated[key]![0] = Math.max(
            numericValue,
            minMaxValues[key]?.[0] ?? numericValue
          );
        } else if (index === 1) {
          // Max value
          updated[key]![1] = Math.min(
            numericValue,
            minMaxValues[key]?.[1] ?? numericValue
          );
        }
      } else {
        updated[key]![index] = null;
      }
  
      return updated;
    });
  };  

  // State for Min/Max Filtering
  const [rangeFilters, setRangeFilters] = useState<{ [key in keyof Patient]?: [number | null, number | null] }>({});

  const handleAdvancedFiltering = () => {
    let filteredData = [...patients];
  
    // Loop through the rangeFilters
    for (const key in rangeFilters) {
      const [min, max] = rangeFilters[key as keyof Patient] ?? [null, null];
      
      if (min !== null || max !== null) {
        filteredData = filteredData.filter((patient) => {
          const value = patient[key as keyof Patient] as number | null;
          if (value === null) return false;
          return (min === null || value >= min) && (max === null || value <= max);
        });
      }
    }
  
    setPatients(filteredData);
    setCurrentPage(1); // Reset to first page after applying filters
  };
  
  // Fetch Patient Data
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

      if (Array.isArray(data.patients) && data.patients.length > 0) {
        setPatients(data.patients);
      } else {
        setPatients([]);
      }
    } catch (err: any) {
      setError("⚠️ Failed to fetch data. Check your connection & backend.");
      setPatients([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Proper useEffect Dependency
  useEffect(() => {
    fetchPatients();

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [fetchPatients]); // Added fetchPatients to dependencies

  // Reset to First Page on Filter Change
  useEffect(() => {
    setCurrentPage(1); // Reset to first page on filter change
    setInputPage("1"); // Reset input value to 1
  }, [filter, searchQuery, sortOrder, exactMatch]); // Added searchQuery to dependencies

  const getFilteredPatients = () => {
    let filteredData = patients;
  
    // Referral Filter Logic
    if (filter === "needReferral") {
      filteredData = filteredData.filter((patient) => patient.referral === 1);
    } else if (filter === "noReferral") {
      filteredData = filteredData.filter((patient) => patient.referral === 0);
    }

    // Search Filter Logic
    if (searchQuery) {
      filteredData = filteredData.filter((patient) => {
        if (exactMatch) {
          return patient.encounterId.toString() === searchQuery;
        } else {
          return patient.encounterId.toString().startsWith(searchQuery);
        }
      });
    }

    // Range Filtering Using `appliedFilters`
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

  const filteredPatients = getFilteredPatients();
  const totalPages = Math.ceil(filteredPatients.length / PATIENTS_PER_PAGE);
  const currentPatients = filteredPatients.slice(
    (currentPage - 1) * PATIENTS_PER_PAGE,
    currentPage * PATIENTS_PER_PAGE
  );

  // Handle Range Filter Changes
  const handleRangeChange = (key: keyof Patient, index: number, value: string) => {
    setRangeFilters((prev) => {
      const updated = { ...prev };
      const numericValue = value ? parseFloat(value) : null;
      if (!updated[key]) updated[key] = [null, null];
      updated[key]![index] = numericValue;
      return updated;
    });
  };   

  useEffect(() => {
    if (!isEditingPage) {
      setInputPage(currentPage.toString());
    }
  }, [currentPage, isEditingPage]);  

  // Handle Input Change and Submission
  const handlePageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputPage(e.target.value);
  };
  
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
  
  const handlePageBlur = () => {
    setIsEditingPage(false);
    setInputPage(currentPage.toString());
  };

  const handlePageClick = () => {
    setIsEditingPage(true);
    setInputPage(""); // Clear input when clicked
  };    

  // Update the temporary state only (without triggering actual filtering)
  const handlePendingRangeChange = (key: keyof Patient, index: number, value: string) => {
    // Update raw input (display value)
    setRawInput((prev) => {
      const updated = { ...prev };
      if (!updated[key]) updated[key] = ["", ""];
      updated[key][index] = value;
      return updated;
    });

    // Update pending state (for backend use)
    setPendingRangeFilters((prev) => {
      const updated = JSON.parse(JSON.stringify(prev)); // Deep copy to avoid reference issues
      let numericValue = value ? parseFloat(value) : null;

      if (!updated[key]) updated[key] = [null, null];

      if (numericValue !== null) {
        if (index === 0) {
          // Min value — Clamp to allowed minimum
          numericValue = Math.max(numericValue, minMaxValues[key]?.[0] ?? numericValue);
        } else if (index === 1) {
          // Max value — Clamp to allowed maximum
          numericValue = Math.min(numericValue, minMaxValues[key]?.[1] ?? numericValue);
        }
      }

      updated[key][index] = numericValue;

      return updated;
    });
  };

  const handleApplyFilters = () => {
    setAppliedFilters(pendingRangeFilters); // Confirm and apply filters
    setCurrentPage(1); // Reset to the first page after filtering

    // Clear the input values WITHOUT resetting applied filters
    setRawInput({});
  };

  const handleRawInputBlur = (key: keyof Patient, index: number) => {
    setPendingRangeFilters((prev) => {
      const updated = { ...prev };

      // Get existing values
      let minValue = updated[key]?.[0] ?? null;
      let maxValue = updated[key]?.[1] ?? null;

      if (rawInput[key]?.[0] !== undefined) {
        minValue = parseFloat(rawInput[key]![0] || "") || null;
      }
      if (rawInput[key]?.[1] !== undefined) {
        maxValue = parseFloat(rawInput[key]![1] || "") || null;
      }

      // Adjust based on allowed range
      if (minValue !== null) {
        minValue = Math.max(minValue, minMaxValues[key]?.[0] ?? minValue);
      }
      if (maxValue !== null) {
        maxValue = Math.min(maxValue, minMaxValues[key]?.[1] ?? maxValue);
      }

      // If min > max → swap them
      if (minValue !== null && maxValue !== null && minValue > maxValue) {
        const temp = minValue;
        minValue = maxValue;
        maxValue = temp;
      }

      // Update state with corrected values
      updated[key] = [minValue, maxValue];

      // Sync corrected value to `rawInput`
      setRawInput((prev) => {
        const newRawInput = { ...prev };
        newRawInput[key]![0] = minValue !== null ? minValue.toString() : "";
        newRawInput[key]![1] = maxValue !== null ? maxValue.toString() : "";
        return newRawInput;
      });

      return updated;
    });
  };

// Extract visible columns from filters
const extraFilterColumns = Object.keys(appliedFilters).filter(
  (key) => !DEFAULT_COLUMNS.includes(key as keyof Patient) &&
    appliedFilters[key as keyof Patient]?.some((val) => val !== null)
) as (keyof Patient)[];

// Insert extra columns after BMI
const visibleColumns: (keyof Patient)[] = (() => {
  const bmiIndex = DEFAULT_COLUMNS.indexOf("bmi") + 1;
  const copy = [...DEFAULT_COLUMNS];
  copy.splice(bmiIndex, 0, ...extraFilterColumns);
  return copy;
})();

const handleResetFilters = () => {
  // Reset advanced filters and also referral type and search query if needed.
  setAppliedFilters({});
  setPendingRangeFilters({});
  setRawInput({});
  setFilter("all");
  setSearchQuery("");
  // Optionally, reset sortOrder or any other filter states if desired.
};

  return (
    <div className="dashboard">
      <h1 className="dashboard-title">Patients Referred to Dietitian</h1>

      {/* Show Loading Message */}
      {loading && <p className="loading-message">⏳ Loading patient data...</p>}

      {/* Show Error Message */}
      {error && !loading && <p className="error-message">⚠️ {error}</p>}

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
            🔍 No referred patients available.
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

