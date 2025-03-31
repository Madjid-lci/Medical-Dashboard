"use client"; // Enable client-side rendering in Next.js

import React, { useRef, useMemo, useState } from "react"; // Import React and necessary hooks
import { Pie, Bar } from "react-chartjs-2"; // Import Pie and Bar chart components
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  ChartOptions,
} from "chart.js"; // Import Chart.js components and types
import ChartDataLabels from "chartjs-plugin-datalabels"; // Plugin to display data labels on charts
import { toPng } from "html-to-image"; // Convert HTML elements to PNG images
import jsPDF from "jspdf"; // Generate PDF files from images
import styles from "./charts.module.css"; // Import CSS module for styling

// Register Chart.js components and the datalabels plugin
ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  ChartDataLabels
);

// Define interface for patient data objects
interface PatientData {
  referral: number;
  [key: string]: any;
}

// Define component props interface
interface PatientsChartsProps {
  patientsData: PatientData[];
}

// PatientsCharts component renders various charts based on patients data
const PatientsCharts: React.FC<PatientsChartsProps> = ({ patientsData }) => {
  const chartRef = useRef<HTMLDivElement>(null); // Ref for the chart container (used for downloads)
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]); // Track ML feature selections

  // If no patients data is available, display a message
  if (!patientsData || patientsData.length === 0) {
    return <p className={styles.message}>No data available for charts.</p>;
  }

  // -----------------------------
  // 1) Referral Pie Chart Data & Options
  // -----------------------------
  const referralCounts = useMemo(() => {
    // Count referrals in the patients data
    return patientsData.reduce(
      (acc, patient) => {
        if (patient?.referral === 1) acc.needReferral++;
        else if (patient?.referral === 0) acc.noReferral++;
        return acc;
      },
      { needReferral: 0, noReferral: 0 }
    );
  }, [patientsData]);

  // Define data for the referral pie chart using referral counts
  const referralPieData = {
    labels: ["Need Referral", "No Referral"], // Labels for each segment
    datasets: [
      {
        data: [referralCounts.needReferral, referralCounts.noReferral], // Data values for each label
        backgroundColor: ["#d9534f", "#5cb85c"], // Colors for each segment
      },
    ],
  };

  // Configure options for the referral pie chart
  const referralPieOptions = {
    plugins: {
      datalabels: { display: false }, // Disable data labels on the chart
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const value = context.parsed; // Get the current value
            // Calculate the total for percentage calculation
            const total = context.dataset.data.reduce(
              (sum: number, current: number) => sum + current,
              0
            );
            const percentage = ((value / total) * 100).toFixed(1); // Format percentage to one decimal
            return `${value} (${percentage}%)`; // Display value with percentage in tooltip
          },
        },
      },
    },
  };

  // -----------------------------
  // 2) AI Referral Pie Chart Data & Options (Hard-coded example)
  // -----------------------------
  const aiReferralCounts = useMemo(() => {
    // Example hard-coded values for AI referral data
    return {
      withAI: 2485,
      withoutAI: 1484,
    };
  }, []);

  const aiReferralPieData = {
    labels: ["With AI", "Without AI"],
    datasets: [
      {
        data: [aiReferralCounts.withAI, aiReferralCounts.withoutAI],
        backgroundColor: ["#007bff", "#ffc107"],
      },
    ],
  };

  const aiReferralPieOptions = {
    plugins: {
      datalabels: { display: false },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const value = context.parsed;
            const total = context.dataset.data.reduce(
              (sum: number, current: number) => sum + current,
              0
            );
            const percentage = ((value / total) * 100).toFixed(1);
            return `${value} (${percentage}%)`;
          },
        },
      },
    },
  };

  // -----------------------------
  // 3) Missing Data Bar Chart Data & Options
  // -----------------------------
  // Fields to check for missing values
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

  const missingDataCounts = useMemo(() => {
    // Count missing values for each field in patients data
    return fieldsToCheck.map((field) =>
      patientsData.filter(
        (patient) =>
          patient && (patient[field] === null || patient[field] === undefined)
      ).length
    );
  }, [patientsData]);

  // Define data for the missing data bar chart
  const missingDataBarData = {
    // Format field names for labels (replace underscores and convert to uppercase)
    labels: fieldsToCheck.map((field) =>
      field.replace(/_/g, " ").toUpperCase()
    ),
    datasets: [
      {
        label: "Missing Data", // Dataset label
        data: missingDataCounts, // Missing value counts for each field
        backgroundColor: "#169867", // Bar color
      },
    ],
  };

  // Configure options for the missing data bar chart
  const missingDataBarOptions: ChartOptions<"bar"> = {
    responsive: true, // Make chart responsive
    maintainAspectRatio: false, // Allow flexible aspect ratio
    scales: {
      x: {
        ticks: {
          autoSkip: false, // Show all x-axis labels
          maxRotation: 45, // Maximum label rotation angle
          minRotation: 0,  // Minimum label rotation angle
        },
      },
      y: {
        beginAtZero: true, // Y-axis starts at zero
        title: {
          display: true,
          text: "Number of Patients", // Y-axis title
        },
      },
    },
    plugins: {
      legend: { position: "top" }, // Position legend at the top
      datalabels: { display: false }, // Disable data labels
    },
  };

  // Totals for Cards: total and referred patients count
  const totalPatients = patientsData.length;
  const referredPatients = patientsData.filter(
    (patient) => patient?.referral === 1
  ).length;

  // -----------------------------
  // 4) Key Patient Features Chart Data & Options
  // -----------------------------
  // List of features for ML analysis
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
    "tidal_vol_spon",
  ];

  // Predefined colors for each feature
  const featureColors = [
    "#FF6B6B",
    "#5FCF80",
    "#4B89DC",
    "#F3C13A",
    "#A569BD",
    "#48C9B0",
    "#F1948A",
    "#73C6B6",
    "#F7DC6F",
    "#85C1E9",
    "#BB8FCE",
    "#E59866",
    "#DC7633",
    "#58D68D",
    "#C39BD3",
    "#F0B27A",
  ];

  // Map each feature to a color from the list
  const featureColorMap: Record<string, string> = mlFeatures.reduce(
    (acc: Record<string, string>, feature, i) => {
      acc[feature] = featureColors[i % featureColors.length];
      return acc;
    },
    {}
  );

  // Calculate average values for each selected feature
  const featureAverages = useMemo(() => {
    return selectedFeatures.map((feature) => {
      const validValues = patientsData
        .map((patient) => patient && patient[feature])
        .filter((value) => value !== null && value !== undefined);
      if (validValues.length === 0) return 0;
      const sum = validValues.reduce((acc: number, val: number) => acc + val, 0);
      return sum / validValues.length;
    });
  }, [patientsData, selectedFeatures]);

  // Create a bar dataset for each selected feature
  const barDatasets = selectedFeatures.map((feature, index) => ({
    type: "bar",
    label: feature.replace(/_/g, " ").toUpperCase(),
    data: selectedFeatures.map((_, i) =>
      i === index ? featureAverages[index] : 0
    ),
    backgroundColor: featureColorMap[feature],
    borderRadius: 5,
  }));

  // Prepare chart data for selected ML features
  const mlFeatureChartData = {
    // Use selected features as labels (formatting with uppercase and spaces)
    labels: selectedFeatures.map((f) => f.replace(/_/g, " ").toUpperCase()),
    datasets: barDatasets, // Bar datasets built from feature averages
  };

  // Chart display options for ML feature bar chart
  const mlFeatureChartOptions: ChartOptions<"bar"> = {
    responsive: true, // Chart resizes with the container
    maintainAspectRatio: false, // Allow flexible height/width
    scales: {
      y: {
        beginAtZero: true, // Y-axis starts from 0
        title: { display: true, text: "Average Value" }, // Y-axis title
      },
    },
    plugins: {
      datalabels: {
        // Show labels only for bar datasets
        display: (ctx) => ctx.dataset.type === "bar",
        anchor: "end",
        align: "end",
        formatter: (value) => (value ? value.toFixed(2) : ""), // Format to 2 decimal places
        color: "#000",
        font: { weight: "bold" },
      },
      legend: { position: "top" }, // Show legend at top
      tooltip: { mode: "index", intersect: false }, // Show tooltip for all bars on hover
    },
  };

  // -----------------------------
  // Handlers
  // -----------------------------
  // Toggle feature selection for the ML chart (max 4 features)
  const handleFeatureClick = (feature: string) => {
    if (selectedFeatures.includes(feature)) {
      setSelectedFeatures((prev) => prev.filter((f) => f !== feature));
    } else if (selectedFeatures.length < 4) {
      setSelectedFeatures((prev) => [...prev, feature]);
    }
  };

  // Handle downloading charts as PNG or PDF
  const handleDownload = async (format: "png" | "pdf") => {
    if (!chartRef.current) return;
    try {
      // Get container dimensions
      const containerWidth = chartRef.current.scrollWidth;
      const containerHeight = chartRef.current.scrollHeight;
      // Convert chart container to PNG
      const dataUrl = await toPng(chartRef.current, {
        width: containerWidth,
        height: containerHeight,
      });
      if (format === "png") {
        // Create and trigger a PNG download link
        const link = document.createElement("a");
        link.download = "patients-charts.png";
        link.href = dataUrl;
        link.click();
      } else {
        // Generate a PDF from the image and trigger download
        const pdf = new jsPDF({
          orientation: "p",
          unit: "px",
          format: [containerWidth, containerHeight],
        });
        pdf.addImage(dataUrl, "PNG", 0, 0, containerWidth, containerHeight);
        pdf.save("patients-charts.pdf");
      }
    } catch (err) {
      console.error("Error generating image:", err);
    }
  };

  // -----------------------------
  // Render
  // -----------------------------
  return (
    <div ref={chartRef}>
      {/* Download Buttons */}
      <div className={styles.topActions}>
        <div className={styles.downloadButtons}>
          <button
            type="button"
            onClick={() => handleDownload("png")}
            className={styles.downloadBtn}
          >
            Download PNG
          </button>
          <button
            type="button"
            onClick={() => handleDownload("pdf")}
            className={styles.downloadBtn}
          >
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
          <h2>Needs Referral</h2>
          <h3>{referredPatients}</h3>
        </div>
        <div className={`${styles.card} ${styles.notReferred}`}>
          <h2>No Referral Needed</h2>
          <h3>{totalPatients - referredPatients}</h3>
        </div>
      </div>

      {/* Referral & AI Referral Pie Charts */}
      <div className={styles.chartContainer}>
        <div className={styles.chartWrapper}>
          <h2 className={styles.chartTitle}>Referral Overview</h2>
          <div style={{ maxWidth: "500px", height: "500px", margin: "0 auto" }}>
            <Pie data={referralPieData} options={referralPieOptions} />
          </div>
        </div>

        <div className={styles.chartWrapper}>
          <h2 className={styles.chartTitle}>AI Referral Overview</h2>
          <div style={{ maxWidth: "500px", height: "500px", margin: "0 auto" }}>
            <Pie data={aiReferralPieData} options={aiReferralPieOptions} />
          </div>
        </div>
      </div>

      {/* Missing Data & Key Patient Features Charts */}
      <div
        className={styles.chartContainer}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginTop: "2rem",
        }}
      >
        <div className={styles.chartWrapper} style={{ marginBottom: "3rem" }}>
          <h2 className={styles.chartTitle}>Missing Data</h2>
          <div style={{ width: "800px", height: "600px", margin: "0 auto" }}>
            <Bar data={missingDataBarData} options={missingDataBarOptions} />
          </div>
        </div>

        <div className={styles.chartWrapper}>
          <h2 className={styles.chartTitle}>Key Patient Features</h2>
          {/* User Guide Paragraph */}
          <div
            style={{
              margin: "1rem 0",
              padding: "1rem",
              border: "1px solid #ccc",
              borderRadius: "8px",
              backgroundColor: "#f9f9f9",
              fontFamily: "Arial, sans-serif",
              lineHeight: "1.6",
              fontSize: "14px",
            }}
          >
            <p>
              The interactive bar chart presents the average values of selected patient attributes,
              utilizing data from your feeding dashboard. This visualization facilitates quick assessment
              and comparison of critical patient metrics, supporting informed clinical decisions.
            </p>
            <p>
              <strong>Instructions for Use:</strong> Click on the attribute buttons located above the chart to
              select or deselect specific patient metrics. You may select up to four features simultaneously for
              comparative analysis. Upon feature selection, the chart dynamically updates to display the
              corresponding average values.
            </p>
            <p>
              <strong>Example Scenario:</strong> To evaluate metrics such as TIDAL VOL, TIDAL VOL SPON, SIP, and PIP,
              simply select these attributes. The bar chart will then present their average values,
              enabling efficient analysis and interpretation of your patient cohort's respiratory parameters.
            </p>
          </div>

          {/* Feature Selection */}
          <div className={styles.featureSelection}>
            <h3>Select Features (Max 4)</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {mlFeatures.map((feature) => {
                const isSelected = selectedFeatures.includes(feature);
                return (
                  <button
                    key={feature}
                    onClick={() => handleFeatureClick(feature)}
                    disabled={selectedFeatures.length >= 4 && !isSelected}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      border: "1px solid #ccc",
                      padding: "8px 12px",
                      borderRadius: "8px",
                      cursor: "pointer",
                      userSelect: "none",
                      textDecoration: isSelected ? "none" : "line-through",
                      backgroundColor: "#fff",
                      gap: "6px",
                    }}
                  >
                    {/* Color Swatch */}
                    <div
                      style={{
                        width: "14px",
                        height: "14px",
                        borderRadius: "3px",
                        backgroundColor: featureColorMap[feature],
                        opacity: isSelected ? 1 : 0.4,
                      }}
                    />
                    {feature.replace(/_/g, " ").toUpperCase()}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Key Patient Features Bar Chart */}
          <div style={{ width: "800px", height: "600px", margin: "0 auto", paddingLeft: "20px" }}>
            <Bar data={mlFeatureChartData} options={mlFeatureChartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientsCharts;