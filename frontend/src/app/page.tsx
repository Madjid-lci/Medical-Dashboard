"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "./page.module.css";

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
    <div className={styles.fullPageWrapper}>
      <div className={styles.mainContent}>
        <h1 className={styles.title}>Welcome to the Critical Care Unit Dashboard</h1>
        <p className={styles.date}>{formattedDate}</p>

        {/* Logo */}
        <div className={styles.logo}></div>

        {/* Buttons */}
        <div className={styles.buttonGroup}>
          <Link href="/upload">
            <button className={styles.mainButton}>Upload CSV</button>
          </Link>
          <Link href="/help">
            <button className={styles.mainButton}>Help</button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
