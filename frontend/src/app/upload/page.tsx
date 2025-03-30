"use client";

import React, { useState, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import styles from "./UploadPage.module.css";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:4000";

const UploadPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const router = useRouter();

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
      setError("");
      console.log("File Selected:", e.target.files[0].name);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("⚠ Please select a CSV file.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      console.log("📡 Sending request to:", `${BACKEND_URL}/upload-csv`);
      const response = await fetch(`${BACKEND_URL}/upload-csv`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      console.log("🔍 Backend Response:", result);

      if (!response.ok) {
        throw new Error(result.error || "Unknown error occurred.");
      }

      setMessage("CSV uploaded successfully! ✅ Redirecting...");
      setError("");

      setTimeout(() => {
        router.push("/patients-referrals");
      }, 2000);
    } catch (err: any) {
      console.error("⚠ Upload failed:", err);
      setError("⚠ Failed to upload file. Check your network connection.");
      setMessage("");
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.header}>Upload CSV File.</h1>
      <p className={styles.instructions}>
        Please upload a CSV file containing patient data. The CSV should include the following columns:  
        <strong> PatientID, Name, Age, Measurements, and Referral.</strong>
      </p>

      <label className={styles.fileLabel}>Select CSV File:</label>

      <div className={styles.fileInputContainer}>
        <input 
          type="file" 
          accept=".csv" 
          onChange={handleFileChange} 
          className={styles.fileInput} 
        />
      </div>

      <button onClick={handleUpload} className={styles.uploadButton}>
        Upload CSV
      </button>

      {error && <p className={styles.errorMessage}>{error}</p>}
      {message && <p className={styles.successMessage}>{message}</p>}
    </div>
  );
};

export default UploadPage;
