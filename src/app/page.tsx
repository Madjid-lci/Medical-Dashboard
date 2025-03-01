import React from "react";
import Link from "next/link";
import "./globals.css"; // Import global styles

const DashboardPage: React.FC = () => {
  return (
<header>
    <div className="dashboard">
      <h1>Dietitian Dashboard</h1>
      <div className="nav-buttons">
        {/* Use Link for navigation */}
        <Link href="/patients-referrals">
          <button>Patients Referrals</button>
        </Link>
        <Link href="/upload">
          <button>Upload CSV</button>
        </Link>
        <input
          type="text"
          placeholder="Search Patients..."
          className="search-bar"
        />
      </div>
    </div></header>
  );
};

export default DashboardPage;