"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FaSearch, FaArrowRight } from "react-icons/fa";
import styles from "./DoctorDashboard.module.css";

const DoctorDashboard: React.FC = () => {
  const router = useRouter();
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
    <div className={styles.body}>
      <div className={styles.container}>
        <h1>Welcome, Your Dashboard is Ready.</h1>
        <p>It's {formattedDate}</p>

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
