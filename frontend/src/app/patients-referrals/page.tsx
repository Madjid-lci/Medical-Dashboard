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
  const [inputPage, setInputPage] = useState<string>("1"); // ✅ New input state
  const [isEditingPage, setIsEditingPage] = useState(false); // ✅ New editing state
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [exactMatch, setExactMatch] = useState(false);


  // ✅ State for Sorting and Searching
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc"); // Sorting state
  const [searchQuery, setSearchQuery] = useState<string>(""); // Search state

  // ✅ Fetch Patient Data (fixed dependency issue)
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
        setError("");

        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current);
          refreshIntervalRef.current = null;
        }
      } else {
        setPatients([]);
      }
    } catch (err: any) {
      setError("⚠️ Failed to fetch data. Check your connection & backend.");
      setPatients([]);
    } finally {
      setLoading(false);
    }
  }, []); // ✅ Removed patients from dependencies

  // ✅ Proper useEffect Dependency
  useEffect(() => {
    fetchPatients();

    refreshIntervalRef.current = setInterval(() => {
      if (patients.length === 0) {
        fetchPatients();
      } else {
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current);
          refreshIntervalRef.current = null;
        }
      }
    }, 5000);

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
  
    // ✅ Filter Logic
    if (filter === "needReferral") {
      filteredData = filteredData.filter((patient) => patient.referral === 1);
    } else if (filter === "noReferral") {
      filteredData = filteredData.filter((patient) => patient.referral === 0);
    }
  
    // ✅ Search Logic
    if (searchQuery) {
      filteredData = filteredData.filter((patient) => {
        if (exactMatch) {
          // ✅ Exact Match Search
          return patient.encounterId.toString() === searchQuery;
        } else {
          // ✅ Start Match Only (instead of includes)
          return patient.encounterId.toString().startsWith(searchQuery);
        }
      });
    }
  
    // ✅ Sorting Logic
    filteredData.sort((a, b) =>
      sortOrder === "asc" ? a.encounterId - b.encounterId : b.encounterId - a.encounterId
    );
  
    return filteredData;
  };  

  const filteredPatients = getFilteredPatients();
  const totalPages = Math.ceil(filteredPatients.length / PATIENTS_PER_PAGE);
  const indexOfLastPatient = currentPage * PATIENTS_PER_PAGE;
  const indexOfFirstPatient = indexOfLastPatient - PATIENTS_PER_PAGE;
  const currentPatients = filteredPatients.slice(indexOfFirstPatient, indexOfLastPatient);

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

      {/* Sort & Search Buttons (Right) */}
      <div className="sort-search-container">
        {/* Search Box */}
        <input
          type="text"
          placeholder="Search by ID"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
        {/* Exact Match Checkbox */}
        <label className="exact-match-label">
          <input
            type="checkbox"
            checked={exactMatch}
            onChange={() => setExactMatch((prev) => !prev)}
            className="exact-match-checkbox"
          />
          Exact Match
        </label>
      </div>
    </div>

    {/* Display Data in a Table */}
    {!loading && !error && currentPatients.length > 0 ? (
      <>
        {/* Table Container */}
        <div className="table-wrapper">
          <div className="table-scroll-container">
            <table className="patients-table">
              <thead>
                <tr>
                  <th>Encounter ID</th>
                  <th>End Tidal CO2</th>
                  <th>Feed Volume</th>
                  <th>Feed Volume Admin</th>
                  <th>FIO2</th>
                  <th>FIO2 Ratio</th>
                  <th>Inspiratory Time</th>
                  <th>Oxygen Flow Rate</th>
                  <th>PEEP</th>
                  <th>PIP</th>
                  <th>Respiratory Rate</th>
                  <th>SIP</th>
                  <th>Tidal Volume</th>
                  <th>Tidal Volume Actual</th>
                  <th>Tidal Vol/Kg</th>
                  <th>Tidal Vol Spon</th>
                  <th>BMI</th>
                  {/* Sticky referral column */}
                  <th className="sticky-column">Referral</th>
                  {/* NEW Sticky Display More Data column */}
                  <th className="sticky-column more-data-column">Display More Data</th>
                </tr>
              </thead>
              <tbody>
                {currentPatients.map((patient, index) => (
                  <tr key={index} className={index % 2 === 0 ? "even-row" : "odd-row"}>
                    <td>{patient.encounterId}</td>
                    <td>{patient.end_tidal_co2 ?? "N/A"}</td>
                    <td>{patient.feed_vol ?? "N/A"}</td>
                    <td>{patient.feed_vol_adm ?? "N/A"}</td>
                    <td>{patient.fio2 ?? "N/A"}</td>
                    <td>{patient.fio2_ratio ?? "N/A"}</td>
                    <td>{patient.insp_time ?? "N/A"}</td>
                    <td>{patient.oxygen_flow_rate ?? "N/A"}</td>
                    <td>{patient.peep ?? "N/A"}</td>
                    <td>{patient.pip ?? "N/A"}</td>
                    <td>{patient.resp_rate ?? "N/A"}</td>
                    <td>{patient.sip ?? "N/A"}</td>
                    <td>{patient.tidal_vol ?? "N/A"}</td>
                    <td>{patient.tidal_vol_actual ?? "N/A"}</td>
                    <td>{patient.tidal_vol_kg ?? "N/A"}</td>
                    <td>{patient.tidal_vol_spon ?? "N/A"}</td>
                    <td>{patient.bmi ?? "N/A"}</td>
                    {/* Sticky referral column */}
                    <td className="sticky-column">
                      <span className={patient.referral === 1 ? "need-referral" : "no-referral"}>
                        {patient.referral === 1 ? "Needs Referral" : "No Referral Needed"}
                      </span>
                    </td>
                    {/* NEW Sticky "More" column */}
                    <td className="sticky-column more-data-column">
                      <a href="#" className="more-link">
                        More
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        {/* Pagination */}
        <div className="pagination">
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
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next ▶
          </button>
          <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}>
            ⏭ Last
          </button>
        </div>
      </div>
      </>
    ) : (
      !loading && <p className="no-data-message">🔍 No referred patients available.</p>
    )}
</div>
</Layout>
  ); 
}; 

export default PatientsReferrals;