"use client";

import React, { useState, ChangeEvent } from "react";
import styles from "./UploadPage.module.css";

interface PatientData {
  encounterId: string;
  end_tidal_co2: string;
  feed_vol: string;
  feed_vol_adm: string;
  fio2: string;
  fio2_ratio: string;
  insp_time: string;
  oxygen_flow_rate: string;
  peep: string;
  pip: string;
  resp_rate: string;
  sip: string;
  tidal_vol: string;
  tidal_vol_actual: string;
  tidal_vol_kg: string;
  tidal_vol_spon: string;
  bmi: string;
  referral: string;
}

const UploadPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<PatientData[]>([]);
  const [error, setError] = useState<string>("");

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
      setError(""); // Clear error when file is selected
    }
  };

  const handleUpload = () => {
    if (!file) {
      setError("Please select a CSV file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split("\n").map((line) => line.trim()).filter(Boolean);

      if (lines.length < 2) {
        setError("CSV file is empty or missing data.");
        return;
      }

      const headers = lines[0].split(",").map((header) => header.trim());
      const requiredColumns = [
        "encounterId", "end_tidal_co2", "feed_vol", "feed_vol_adm", "fio2", 
        "fio2_ratio", "insp_time", "oxygen_flow_rate", "peep", "pip", 
        "resp_rate", "sip", "tidal_vol", "tidal_vol_actual", "tidal_vol_kg", 
        "tidal_vol_spon", "bmi", "referral"
      ];

      if (!requiredColumns.every((col) => headers.includes(col))) {
        setError("Missing required columns.");
        return;
      }

      const parsedData: PatientData[] = lines.slice(1).map((line) => {
        const values = line.split(",").map((value) => value.trim());
        const obj: any = {};
        headers.forEach((header, index) => {
          obj[header] = values[index] || "";
        });
        return obj as PatientData;
      });

      setData(parsedData);
      setError("");
    };

    reader.readAsText(file);
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
        <span className={styles.fileIcon}>📄</span>
      </div>

      <button onClick={handleUpload} className={styles.uploadButton}>
        Upload CSV
      </button>

      {error && <p className={styles.errorMessage}>{error}</p>}
    </div>
  );
};

export default UploadPage;
