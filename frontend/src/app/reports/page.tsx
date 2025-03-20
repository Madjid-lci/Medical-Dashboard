"use client";

import React, { useEffect, useState } from "react";
import PatientsCharts from "./PatientsCharts";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:5000";

const ReportsPage: React.FC = () => {
  const [patientsData, setPatientsData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/patients`); // Fixed backticks
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to load patients data");
        }

        setPatientsData(data.patients);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  return (
    <div className="reports-container">
      <h1 className="reports-title">Reports & Data Visualization</h1>

      {error && <p className="error-message">⚠ {error}</p>}

      {!loading && patientsData.length > 0 ? (
        <PatientsCharts patientsData={patientsData} />
      ) : (
        <p>Loading charts or no data available...</p>
      )}
    </div>
  );
};

export default ReportsPage;
