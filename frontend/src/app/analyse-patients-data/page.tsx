"use client";

import React, { useState } from "react";
import styles from "./apd.module.css";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:5000";

const UploadPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [predictions, setPredictions] = useState<{ encounterId: number; referral: number }[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
      setMessage("");
      setError("");
      setPredictions([]); // Clear previous results
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("⚠️ Please select a CSV file.");
      return;
    }

    setLoading(true);
    setMessage("");
    setError("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`${BACKEND_URL}/upload-csv`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed.");
      }

      const result = await response.json();

      if (result.predictions) {
        setPredictions(
          result.predictions.map((referral: number, index: number) => ({
            encounterId: index + 1, // Fake ID since actual IDs might be missing
            referral,
          }))
        );
        setMessage("✅ Predictions generated successfully!");
      } else {
        throw new Error("No predictions received.");
      }
    } catch (error) {
      setError("⚠️ Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.header}>Analyze Patients Data</h1>
      <h2>With a Machine Learning Model</h2>

      <label htmlFor="fileUpload" className={styles.fileLabel}>
        Upload CSV File:
      </label>
      <input
        type="file"
        id="fileUpload"
        accept=".csv"
        onChange={handleFileChange}
        className={styles.fileInput}
      />

      <button onClick={handleUpload} className={styles.uploadButton} disabled={loading}>
        {loading ? "Uploading..." : "Upload CSV"}
      </button>

      {error && <p className={styles.errorMessage}>{error}</p>}
      {message && <p className={styles.successMessage}>{message}</p>}

      {/* Display Predictions in a Table */}
      {predictions.length > 0 && (
        <div className={styles.results}>
          <h3>Prediction Results</h3>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Encounter ID</th>
                <th>Referral Prediction</th>
              </tr>
            </thead>
            <tbody>
              {predictions.map((row, index) => (
                <tr key={index}>
                  <td>{row.encounterId}</td>
                  <td>{row.referral === 1 ? "🔴 Needs Referral" : "🟢 No Referral Needed"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UploadPage;
