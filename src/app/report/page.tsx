import React from "react";
import Layout from "../layout"; // Import the Layout component
import "./report.css"; // Import your custom CSS file

const AnalysePatientsData: React.FC = () => {
  return (
    <Layout> {/* Wrap everything in Layout */}
      <div className="dashboard">
        {/* Main Heading */}
        <h1 className="dashboard-title">Analyse Patients Data</h1>
      </div>
    </Layout>
  );
};

export default AnalysePatientsData;
