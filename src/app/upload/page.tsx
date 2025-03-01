
"use client";

import React, { useState, ChangeEvent } from "react";
import Layout from "../layout"; // Import the Layout component
import Link from "next/link"; // Import the Link component
import styles from "./UploadPage.module.css"; 

// Define the structure of patient data
interface PatientData {
  PatientID: string;
  Name: string;
  Age: string;
  Measurements: string;
  Referral: string;
}

const UploadPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<PatientData[]>([]);
  const [error, setError] = useState<string>("");

  // Handle file input change
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  // Handle CSV file upload and parsing manually
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
      const requiredColumns = ["PatientID", "Name", "Age", "Measurements", "Referral"];

      // Check if all required columns exist
      if (!requiredColumns.every((col) => headers.includes(col))) {
        setError("Missing required columns.");
        return;
      }

      // Convert rows into objects
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
      <h1 className={styles.header}>Upload CSV File</h1>
      <p className="mb-4">
        Please upload a CSV file containing patient data with the following columns:{" "}
        <strong>PatientID, Name, Age, Measurements, Referral</strong>.
      </p>

      <input type="file" accept=".csv" onChange={handleFileChange} className={styles.fileInput} />
      <button onClick={handleUpload} className={styles.uploadButton}>
        Upload CSV
      </button>

      {error && <p className={styles.message}>{error}</p>}

      {data.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-2">Uploaded Data</h2>
          <table className={styles.dataTable}>
            <thead>
              <tr>
                {Object.keys(data[0]).map((key) => (
                  <th key={key} className={styles.dataTable}>
                    {key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, index) => (
                <tr key={index}>
                  {Object.values(row).map((value, i) => (
                    <td key={i} className={styles.dataTable}>{value}</td>
                  ))}
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
