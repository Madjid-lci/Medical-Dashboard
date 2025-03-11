"use client";

import React, { useState, ChangeEvent } from "react";
import { useRouter } from "next/navigation"; // For redirection
import styles from "./UploadPage.module.css";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:5000"; // Detect backend URL dynamically

const UploadPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const router = useRouter();

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
      setError(""); // Clear errors when a file is selected
      console.log("📂 File Selected:", e.target.files[0].name);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("⚠️ Please select a CSV file.");
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

      setMessage("✅ CSV uploaded successfully! Redirecting...");
      setError("");

      // Redirect to the referrals page after successful upload
      setTimeout(() => {
        router.push("/patients-referrals");
      }, 2000);
    } catch (err: any) {
      console.error("❌ Upload failed:", err);
      setError("⚠️ Failed to upload file. Check your network connection.");
      setMessage("");
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.header}>Upload CSV File</h1>
      <label htmlFor="fileUpload" className={styles.fileLabel}>
        Upload CSV File:
      </label>
      <input
        type="file"
        id="fileUpload"
        accept=".csv"
        onChange={handleFileChange}
        className={styles.fileInput}
        title="Select a CSV file to upload"
      />

      <button onClick={handleUpload} className={styles.uploadButton}>
        Upload CSV
      </button>

      {error && <p className={styles.errorMessage}>{error}</p>}
      {message && <p className={styles.successMessage}>{message}</p>}
    </div>
  );
};

export default UploadPage;
