"use client";

import React, { useRef, useMemo } from "react";
import { Pie, Bar } from "react-chartjs-2";
import {
  Chart,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
} from "chart.js";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";
import styles from "./charts.module.css";

Chart.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
  LineElement,
  PointElement
);

interface PatientData {
  referral: number;
  [key: string]: any;
}

interface PatientsChartsProps {
  patientsData: PatientData[];
}

const PatientsCharts: React.FC<PatientsChartsProps> = ({ patientsData }) => {
  const chartRef = useRef<HTMLDivElement>(null);

  if (!patientsData || patientsData.length === 0) {
    return <p className={styles.message}>No data available for charts.</p>;
  }

  // ===== Referral Pie Chart Logic =====
  const referralCounts = useMemo(() => {
    return patientsData.reduce(
      (acc, patient) => {
        if (patient?.referral === 1) acc.needReferral++;
        else if (patient?.referral === 0) acc.noReferral++;
        return acc;
      },
      { needReferral: 0, noReferral: 0 }
    );
  }, [patientsData]);

  const referralPieData = {
    labels: ["Need Referral", "No Referral"],
    datasets: [
      {
        data: [referralCounts.needReferral, referralCounts.noReferral],
        backgroundColor: ["#d9534f", "#5cb85c"],
      },
    ],
  };

  // ===== Missing Data Bar Chart Logic =====
  const fieldsToCheck = [
    "end_tidal_co2", "feed_vol", "feed_vol_adm", "fio2", "fio2_ratio", "insp_time",
    "oxygen_flow_rate", "peep", "pip", "resp_rate", "sip", "tidal_vol", "tidal_vol_actual",
    "tidal_vol_kg", "tidal_vol_spon", "bmi",
  ];

  const missingDataCounts = useMemo(() => {
    return fieldsToCheck.map(
      (field) =>
        patientsData.filter(
          (patient) =>
            patient &&
            (patient[field] === null || patient[field] === undefined)
        ).length
    );
  }, [patientsData]);

  const missingDataBarData = {
    labels: fieldsToCheck.map((field) =>
      field.replace(/_/g, " ").toUpperCase()
    ),
    datasets: [
      {
        label: "Missing Data",
        data: missingDataCounts,
        backgroundColor: "#169867",
      },
    ],
  };

  // ===== Mixed Chart =====
  const mlFeatures = [
    "feed_vol", "oxygen_flow_rate", "resp_rate", "bmi", "end_tidal_co2", "feed_vol_adm",
    "fio2", "fio2_ratio", "insp_time", "peep", "pip", "sip", "tidal_vol", "tidal_vol_actual",
    "tidal_vol_kg", "tidal_vol_spon",
  ];

  const featureColors = [
    "#FF6B6B", "#5FCF80", "#4B89DC", "#F3C13A", "#A569BD", "#48C9B0", "#F1948A", "#73C6B6",
    "#F7DC6F", "#85C1E9", "#BB8FCE", "#E59866", "#DC7633", "#58D68D", "#C39BD3", "#F0B27A",
  ];

  const featureAverages = useMemo(() => {
    return mlFeatures.map((feature) => {
      const validValues = patientsData
        .map((patient) => patient && patient[feature])
        .filter((value) => value !== null && value !== undefined);

      return validValues.length > 0
        ? validValues.reduce((sum, value) => sum + value, 0) / validValues.length
        : 0;
    });
  }, [patientsData]);

  const barDatasets = mlFeatures.map((feature, index) => ({
    type: "bar",
    label: feature.replace(/_/g, " ").toUpperCase(),
    data: mlFeatures.map((_, i) => (i === index ? featureAverages[index] : 0)),
    backgroundColor: featureColors[index % featureColors.length],
    borderRadius: 5,
  }));

  const totalPatients = patientsData.length;
  const referredPatients = patientsData.filter(
    (patient) => patient?.referral === 1
  ).length;
  const referralRate = (referredPatients / totalPatients) * 100;

  const lineDataset = {
    type: "line",
    label: "Referral Rate (%)",
    data: Array(mlFeatures.length).fill(referralRate),
    borderColor: "#36A2EB",
    backgroundColor: "#36A2EB",
    borderWidth: 2,
    pointRadius: 4,
    yAxisID: "y-axis-referral",
  };

  const mlFeatureChartData = {
    labels: mlFeatures.map((feature) => feature.replace(/_/g, " ").toUpperCase()),
    datasets: [...barDatasets, lineDataset],
  };

  const mlFeatureChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Average Value",
        },
      },
      "y-axis-referral": {
        beginAtZero: true,
        position: "right" as const,
        title: {
          display: true,
          text: "Referral Rate (%)",
        },
        grid: { drawOnChartArea: false },
      },
    },
    plugins: {
      legend: { position: "top" as const },
      tooltip: { mode: "index" as const, intersect: false },
    },
  };

  // ===== Download Handler =====
  const handleDownload = async (format: "png" | "pdf") => {
    if (chartRef.current === null) return;
    try {
      const dataUrl = await toPng(chartRef.current);
      if (format === "png") {
        const link = document.createElement("a");
        link.download = "patients-charts.png";
        link.href = dataUrl;
        link.click();
      } else {
        const pdf = new jsPDF();
        const imgProps = pdf.getImageProperties(dataUrl);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        pdf.addImage(dataUrl, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save("patients-charts.pdf");
      }
    } catch (err) {
      console.error("Error generating image:", err);
    }
  };

  return (
    <div>
      {/* Download Buttons */}
      <div className={styles.topActions}>
        <div className={styles.downloadButtons}>
          <button type="button" onClick={() => handleDownload("png")} className={styles.downloadBtn}>
            Download PNG
          </button>
          <button type="button" onClick={() => handleDownload("pdf")} className={styles.downloadBtn}>
            Download PDF
          </button>
        </div>
      </div>

      {/* Cards Section */}
      <div className={styles.cards}>
        <div className={`${styles.card} ${styles.total}`}>
          <h2>Total Patients</h2>
          <h3>{totalPatients}</h3>
        </div>

        <div className={`${styles.card} ${styles.referred}`}>
          <h2>Referred</h2>
          <h3>{referredPatients}</h3>
        </div>

        <div className={`${styles.card} ${styles.notReferred}`}>
          <h2>Not Referred</h2>
          <h3>{totalPatients - referredPatients}</h3>
        </div>
      </div>

      {/* Charts Section */}
      <div ref={chartRef}>
        {/* Wrap ALL charts */}
        <div className={styles.chartContainer}>
          {/* First Pie Chart */}
          <div className={styles.chartWrapper}>
            <h2 className={styles.chartTitle}>Patients Referral Overview</h2>
            <div className={styles.chartCanvas}>
              <Pie data={referralPieData} />
            </div>
          </div>

          {/* Second Bar Chart */}
          <div className={styles.chartWrapper}>
            <h2 className={styles.chartTitle}>Patients Missing Data Overview</h2>
            <div className={styles.chartCanvas}>
              <Bar data={missingDataBarData} />
            </div>
          </div>
        </div>

        {/* Third Chart */}
        <div className={styles.chartWrapper}>
          <h2 className={styles.chartTitle}>Key Patient Features & Referral Rate</h2>
          <div style={{ maxWidth: "1000px", height: "700px", width: "100%", paddingLeft: "20px" }}>
            <Bar data={mlFeatureChartData as any} options={mlFeatureChartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientsCharts;
