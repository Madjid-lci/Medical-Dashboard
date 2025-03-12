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
  referral: number | null;
}

const PatientsReferrals: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // ✅ Fetch Patient Data
  const fetchPatients = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      console.log(`🔍 Fetching patient data from: ${BACKEND_URL}/patients`);

      const response = await fetch(`${BACKEND_URL}/patients`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Server Error: ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ API Response:", data);

      if (Array.isArray(data.patients) && data.patients.length > 0) {
        setPatients(data.patients);
        setError("");

        // ✅ Stop auto-refresh if data is loaded
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current);
          refreshIntervalRef.current = null;
          console.log("⏸️ Auto-refresh stopped since data is loaded.");
        }
      } else {
        setPatients([]);
      }
    } catch (err: any) {
      console.error("❌ Fetch failed:", err);
      setError("⚠️ Failed to fetch data. Check your connection & backend.");
      setPatients([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPatients();

    // ✅ Auto-Refresh **Only if No Data is Found**
    refreshIntervalRef.current = setInterval(() => {
      if (patients.length === 0) {
        console.log("🔄 Auto-refreshing...");
        fetchPatients();
      } else {
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current);
          refreshIntervalRef.current = null;
          console.log("✅ Auto-refresh stopped since data is loaded.");
        }
      }
    }, 5000); // Check every 5 seconds

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, []);

  // ✅ Pagination logic
  const totalPages = Math.ceil(patients.length / PATIENTS_PER_PAGE);
  const indexOfLastPatient = currentPage * PATIENTS_PER_PAGE;
  const indexOfFirstPatient = indexOfLastPatient - PATIENTS_PER_PAGE;
  const currentPatients = patients.slice(indexOfFirstPatient, indexOfLastPatient);

  return (
    <Layout>
      <div className="dashboard">
        <h1 className="dashboard-title">Patients Referred to Dietitian</h1>

        {/* Show Loading Message */}
        {loading && <p className="loading-message">⏳ Loading patient data...</p>}

        {/* Show Error Message */}
        {error && !loading && <p className="error-message">⚠️ {error}</p>}

        {/* Display Data in a Table */}
        {!loading && !error && patients.length > 0 ? (
          <div className="table-container">
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
                  <th>Referral</th>
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
                    <td>
                      <span className={patient.referral === 1 ? "need-referral" : "no-referral"}>
                        {patient.referral === 1 ? "Need Referral" : "No Referral"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination Controls */}
            <div className="pagination">
              <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>
                ⏮ First
              </button>
              <button onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
                ◀ Prev
              </button>
              <span>Page {currentPage} of {totalPages}</span>
              <button onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>
                Next ▶
              </button>
              <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}>
                ⏭ Last
              </button>
            </div>
          </div>
        ) : (
          !loading && <p className="no-data-message">🔍 No referred patients available.</p>
        )}
      </div>
    </Layout>
  );
};

export default PatientsReferrals;
