import React from "react";
import Layout from "../layout"; // Import the Layout component
import "./page.lodel.css"; // Import your custom CSS file

const DietitianDashboard: React.FC = () => {
  return (
    <Layout> {/* Wrap everything in Layout */}
      <div className="dashboard">
        {/* Main Heading */}
        <h1 className="dashboard-title">Patients Referred to Dietitian</h1>
      </div>
    </Layout>
  );
};

export default DietitianDashboard;
