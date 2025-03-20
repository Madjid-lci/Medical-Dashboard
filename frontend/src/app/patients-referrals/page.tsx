"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import Layout from "../layout"; // Import Layout
import "./page.lodel.css"; // Import styles

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:5000";
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

const PatientsReferrals: React.FC = () => {
  const [filter, setFilter] = useState<"all" | "needReferral" | "noReferral">("all");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [inputPage, setInputPage] = useState<string>("1");
  const [isEditingPage, setIsEditingPage] = useState(false);
  const [showFilterContainer, setShowFilterContainer] = useState(false); // ✅ New state for filter container
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [exactMatch, setExactMatch] = useState(false);


  // ✅ State for Sorting and Searching
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc"); // Sorting state
  const [searchQuery, setSearchQuery] = useState<string>(""); // Search state

  // ✅ State for Min/Max Filtering
  const [rangeFilters, setRangeFilters] = useState<{ [key in keyof Patient]?: [number | null, number | null] }>({});

  const handleAdvancedFiltering = () => {
    let filteredData = [...patients];
  
    // ✅ Loop through the rangeFilters
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
  
  // ✅ Fetch Patient Data
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

  // ✅ Proper useEffect Dependency
  useEffect(() => {
    fetchPatients();

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [fetchPatients]); // ✅ Added fetchPatients to dependencies

  // ✅ Reset to First Page on Filter Change
  useEffect(() => {
   setCurrentPage(1); // ✅ Reset to first page on filter change
   setInputPage("1"); // ✅ Reset input value to 1
  }, [filter, searchQuery, sortOrder, exactMatch]); // ✅ Added searchQuery to dependencies

  const getFilteredPatients = () => {
    let filteredData = patients;

    // ✅ Referral Filtering
    if (filter === "needReferral") {
      filteredData = filteredData.filter((patient) => patient.referral === 1);
    } else if (filter === "noReferral") {
      filteredData = filteredData.filter((patient) => patient.referral === 0);
    }

    if (searchQuery) {
      filteredData = filteredData.filter((patient) => {
        if (exactMatch) {
          return patient.encounterId.toString() === searchQuery;
        } else {
          return patient.encounterId.toString().startsWith(searchQuery);
        }
      });
    }

    // ✅ Range Filtering
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

    return filteredData;
  }; 

  const filteredPatients = getFilteredPatients();
  const totalPages = Math.ceil(filteredPatients.length / PATIENTS_PER_PAGE);
  const indexOfLastPatient = currentPage * PATIENTS_PER_PAGE;
  const indexOfFirstPatient = indexOfLastPatient - PATIENTS_PER_PAGE;
  const currentPatients = filteredPatients.slice(
    (currentPage - 1) * PATIENTS_PER_PAGE,
    currentPage * PATIENTS_PER_PAGE
  );

    // ✅ Handle Range Filter Changes
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

    // ✅ Handle Input Change and Submission
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
      setInputPage(""); // ✅ Clear input when clicked
    };    

    // ✅ Handle Sorting (Ascending or Descending)
  const handleSort = () => {
  setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
};

  return (
    <Layout>
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
              className="filter-toggle-button"
            >
              {showFilterContainer ? "Hide Filters" : "Show Filters"}
            </button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilterContainer && (
          <div className="advanced-filter-container">
            {Object.keys(rangeFilters).map((key) => (
              <div key={key} className="filter-field">
                <label>{key.replace(/_/g, " ")}</label>
                <input
                  type="number"
                  placeholder="Min"
                  value={rangeFilters[key as keyof Patient]?.[0] ?? ""}
                  onChange={(e) =>
                    handleRangeChange(key as keyof Patient, 0, e.target.value)
                  }
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={rangeFilters[key as keyof Patient]?.[1] ?? ""}
                  onChange={(e) =>
                    handleRangeChange(key as keyof Patient, 1, e.target.value)
                  }
                />
              </div>
            ))}
            <button onClick={handleAdvancedFiltering}>
              Apply Filters
            </button>
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
                      <th>Encounter ID</th>
                      <th>Feed Volume</th>
                      <th>Oxygen Flow Rate</th>
                      <th>Respiratory Rate</th>
                      <th>BMI</th>
                      <th className="sticky-column more-data-column">
                        Display More Data
                      </th>
                      <th className="sticky-column">Referral</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentPatients.map((patient, index) => (
                      <tr key={index} className={index % 2 === 0 ? "even-row" : "odd-row"}>
                        <td>{patient.encounterId}</td>
                        <td>{patient.feed_vol ?? "N/A"}</td>
                        <td>{patient.oxygen_flow_rate ?? "N/A"}</td>
                        <td>{patient.resp_rate ?? "N/A"}</td>
                        <td>{patient.bmi ?? "N/A"}</td>
                        <td className="sticky-column more-data-column">
                          <a href="#" className="more-link">
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
      </div>
    </Layout>
  );
};

export default PatientsReferrals;