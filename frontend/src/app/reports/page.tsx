"use client"; // Enable client-side rendering in Next.js

import React, { useEffect, useState } from "react"; // Import React and necessary hooks
import PatientsCharts from "./PatientsCharts"; // Import component for visualizing patient charts

// Set backend URL from environment variable or default to localhost
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:4000";

// Define the ReportsPage functional component
const ReportsPage: React.FC = () => {
  // State to hold patients data, loading status, and error messages
  const [patientsData, setPatientsData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  // useEffect to fetch patients data when the component mounts
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        // Fetch patients data from the backend
        const response = await fetch(`${BACKEND_URL}/patients`); // Use template literal for URL
        const data = await response.json(); // Parse the JSON response

        // Check if the response is not OK, then throw an error
        if (!response.ok) {
          throw new Error(data.error || "Failed to load patients data");
        }

        // Update state with the retrieved patients data
        setPatientsData(data.patients);
      } catch (err: any) {
        // Update error state if fetching fails
        setError(err.message);
      } finally {
        // Set loading state to false after fetching is complete
        setLoading(false);
      }
    };

    fetchPatients(); // Call the async function to fetch data
  }, []); // Empty dependency array ensures this runs only once on mount

  return (
    <div className="reports-container"> {/* Container for reports page */}
      <h1 className="reports-title">Reports & Data Visualization</h1> {/* Page title */}

      {/* Display error message if one exists */}
      {error && <p className="error-message">⚠ {error}</p>}

      {/* Conditionally render the PatientsCharts component if data is loaded */}
      {!loading && patientsData.length > 0 ? (
        <PatientsCharts patientsData={patientsData} />
      ) : (
        <p>Loading charts or no data available...</p>
      )}
    </div>
  );
};

export default ReportsPage; // Export the component as default