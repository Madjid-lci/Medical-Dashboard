"use client";

import React, { useEffect, useState } from "react";
import styles from "./DoctorDashboard.module.css";

const DoctorDashboard: React.FC = () => {
  const [formattedDate, setFormattedDate] = useState<string | null>(null);

  useEffect(() => {
    if (!formattedDate) {  // Only update if the state is empty
      const today = new Date();
      const options: Intl.DateTimeFormatOptions = {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      };
      setFormattedDate(today.toLocaleDateString("en-GB", options));
    }
  }, [formattedDate]); // Only runs once if date is null

  return (
    <div className={styles.homeContainer}>
      {/* Main Content */}
      <div className={styles.mainContent}>
        <h1 className={styles.title}>Welcome to the CCU APP</h1>

        {/* Display Date Only If It Exists (No Initial Render Mismatch) */}
        {formattedDate ? <p className={styles.date}>{formattedDate}</p> : <p>Loading...</p>}

        {/* Logo Placeholder */}
        <div className={styles.logoPlaceholder}>Logo Here</div>

        {/* Buttons */}
        <div className={styles.buttonGroup}>
          <button className={styles.mainButton}>Upload CSV</button>
          <button className={styles.mainButton}>Help</button>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
