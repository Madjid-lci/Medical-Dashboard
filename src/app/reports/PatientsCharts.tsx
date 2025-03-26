"use client";

import React from "react";
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
import styles from "./charts.module.css";

// Register ChartJS components
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

interface PatientsChartsProps {
  patientsData: any[];
}

const PatientsCharts: React.FC<PatientsChartsProps> = ({ patientsData }) => {
  if (!patientsData || patientsData.length === 0) {
    return <p className={styles.message}>No data available for charts.</p>;
  }

  // ================= Referral Pie Chart Logic =================

  const referralCounts = patientsData.reduce(
    (acc, patient) => {
      if (patient.referral === 1) acc.needReferral++;
      else if (patient.referral === 0) acc.noReferral++;
      return acc;
    },
    { needReferral: 0, noReferral: 0 }
  );

  const referralPieData = {
    labels: ["Need Referral", "No Referral"],
    datasets: [
      {
        data: [referralCounts.needReferral, referralCounts.noReferral],
        backgroundColor: ["#4B89DC", "#F3C13A"],
      },
    ],
  };

  // ================= Missing Data Bar Chart Logic =================

  const fieldsToCheck = [
    "end_tidal_co2",
    "feed_vol",
    "feed_vol_adm",
    "fio2",
    "fio2_ratio",
    "insp_time",
    "oxygen_flow_rate",
    "peep",
    "pip",
    "resp_rate",
    "sip",
    "tidal_vol",
    "tidal_vol_actual",
    "tidal_vol_kg",
    "tidal_vol_spon",
    "bmi",
  ];

  const missingDataCounts = fieldsToCheck.map(
    (field) =>
      patientsData.filter(
        (patient) => patient[field] === null || patient[field] === undefined
      ).length
  );

  const missingDataBarData = {
    labels: fieldsToCheck.map((field) =>
      field.replace(/_/g, " ").toUpperCase()
    ),
    datasets: [
      {
        label: "Missing Data",
        data: missingDataCounts,
        backgroundColor: "#6FC3DF",
      },
    ],
  };

// ================= Mixed Bar + Line Chart (Key Features + Referral Rate) =================

// Combine ALL relevant attributes
const mlFeatures = [
  "feed_vol",
  "oxygen_flow_rate",
  "resp_rate",
  "bmi",
  "end_tidal_co2",
  "feed_vol_adm",
  "fio2",
  "fio2_ratio",
  "insp_time",
  "peep",
  "pip",
  "sip",
  "tidal_vol",
  "tidal_vol_actual",
  "tidal_vol_kg",
  "tidal_vol_spon"
];

// Assign distinct colors (adjust or add more if needed)
const featureColors = [
  "#FF6B6B", "#5FCF80", "#4B89DC", "#F3C13A", 
  "#A569BD", "#48C9B0", "#F1948A", "#73C6B6",
  "#F7DC6F", "#85C1E9", "#BB8FCE", "#E59866",
  "#DC7633", "#58D68D", "#C39BD3", "#F0B27A"
];

const featureAverages = mlFeatures.map((feature) => {
  const validValues = patientsData
    .map((patient) => patient[feature])
    .filter((value) => value !== null && value !== undefined);

  return validValues.length > 0
    ? validValues.reduce((sum, value) => sum + value, 0) / validValues.length
    : 0;
});

const barDatasets = mlFeatures.map((feature, index) => ({
  type: "bar",
  label: feature.replace(/_/g, " ").toUpperCase(),
  data: mlFeatures.map((_, i) => (i === index ? featureAverages[index] : 0)),
  backgroundColor: featureColors[index % featureColors.length], // Cycle colors if needed
  borderRadius: 5,
}));

const totalPatients = patientsData.length;
const referredPatients = patientsData.filter(
  (patient) => patient.referral === 1
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
      grid: {
        drawOnChartArea: false,
      },
    },
  },
  plugins: {
    legend: { position: "top" as const },
    tooltip: { mode: "index" as const, intersect: false },
  },
};


  // ================= Render All Charts =================

  return (
    <div className={styles.chartContainer}>
      {/* Referral Pie Chart */}
      <div className={styles.chartWrapper}>
        <h2 className={styles.chartTitle}>Patients Referral Overview</h2>
        <div className={styles.chartCanvas}>
          <Pie data={referralPieData} />
        </div>
      </div>

      {/* Missing Data Bar Chart */}
      <div className={styles.chartWrapper}>
        <h2 className={styles.chartTitle}>Patients Missing Data Overview</h2>
        <div className={styles.chartCanvas}>
          <Bar data={missingDataBarData} />
        </div>
      </div>

      {/* Key Features Mixed Chart */}
      <div className={styles.chartWrapper}>
        <h2 className={styles.chartTitle}>Key Patient Features & Referral Rate</h2>
        <div style={{ maxWidth: "1000px", height: "700px", width: "100%" }}>
          <Bar data={mlFeatureChartData as any} options={mlFeatureChartOptions} />
        </div>
      </div>
    </div>
  );
};

export default PatientsCharts;
