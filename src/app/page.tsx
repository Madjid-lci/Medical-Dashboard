"use client";

import React, { useEffect, useState } from "react";
import styles from "./page.module.css"; // Ensure this file exists for styling

const HomePage: React.FC = () => {
  const [formattedDate, setFormattedDate] = useState("");

  useEffect(() => {
    const today = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    };
    setFormattedDate(today.toLocaleDateString("en-GB", options));
  }, []);

  return (
    <div className={styles.homeContainer}>
      <div className={styles.mainContent}>
        <h1>Welcome to the CCU APP</h1>
        <p className={styles.date}>{formattedDate}</p>

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

export default HomePage;
