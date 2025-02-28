"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { FaSearch, FaArrowRight } from "react-icons/fa";
import styles from "./DoctorDashboard.module.css";
import { Link } from "react-router-dom";




const DoctorDashboard: React.FC = () => {
  const router = useRouter(); // Use Next.js router instead of react-router-dom

  return (
    <div className={styles.body}>
      <nav className={styles.navbar}>
        <div className={styles.navLinks}>
          <button onClick={() => router.push("/")} className={styles.navButton}>
            Dashboard
          </button>
          <button onClick={() => router.push("/referred")} className={styles.navButton}>
            Referred
          </button>
          <button onClick={() => router.push("/upload")} className={styles.navButton}>
            Upload CSV
          </button>
          <button onClick={() => router.push("/reports")} className={styles.navButton}>
            Reports
          </button>
        </div>
        <div className={styles.searchBar}>
          <input type="text" placeholder="Search Patients ..." />
          <FaSearch className={styles.searchIcon} />
        </div>
      </nav>

      <div className={styles.container}>
        <h1>Welcome, Dr. James! Your Dashboard is Ready.</h1>
        <p>It's Tuesday, 4th Feb 2025</p>

        <div className={styles.cards}>
          <div className={`${styles.card} ${styles.total}`}>
            <h2>Total Patients</h2>
            <h3>1112</h3>
            <button className={styles.cardButton}>
              View All <FaArrowRight />
            </button>
          </div>

          <div className={`${styles.card} ${styles.referred}`}>
            <h2>Referred</h2>
            <h3>567</h3>
            <button className={styles.cardButton}>
              View All <FaArrowRight />
            </button>
          </div>

          <div className={`${styles.card} ${styles.notReferred}`}>
            <h2>Not Referred</h2>
            <h3>667</h3>
            <button className={styles.cardButton}>
              View All <FaArrowRight />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
