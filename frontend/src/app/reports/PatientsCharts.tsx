"use client";

import html2canvas from "html2canvas";
import React, { useRef, useMemo, useState } from "react";
import { Pie, Bar } from "react-chartjs-2";
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
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";
import styles from "./charts.module.css";

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

interface PatientData {
  referral: number;
  [key: string]: any;
}

interface PatientsChartsProps {
  patientsData: PatientData[];
}

const PatientsCharts: React.FC<PatientsChartsProps> = ({ patientsData }) => {
  // Attach the ref to the entire page so we capture everything
  const chartRef = useRef<HTMLDivElement>(null);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);

  // If no data, return a message
  if (!patientsData || patientsData.length === 0) {
    return <p className={styles.message}>No data available for charts.</p>;
  }

  // -----------------------------
  // 1) Referral Pie Chart
  // -----------------------------
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

  const referralPieData: any = {
    labels: ["Need Referral", "No Referral"],
    datasets: [
      {
        data: [referralCounts.needReferral, referralCounts.noReferral],
        backgroundColor: ["#d9534f", "#5cb85c"],
      },
    ],
  };

  const referralPieOptions: any = {
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
  // 2) AI Referral Pie Chart
  // -----------------------------
  const aiReferralCounts = useMemo(() => {
    // Hard-coded example
    return {
      withAI: 2485,
      withoutAI: 1484,
    };
  }, []);

  const aiReferralPieData: any = {
    labels: ["With AI", "Without AI"],
    datasets: [
      {
        data: [aiReferralCounts.withAI, aiReferralCounts.withoutAI],
        backgroundColor: ["#007bff", "#ffc107"],
      },
    ],
  };

  const aiReferralPieOptions: any = {
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
  // 3) Missing Data Bar Chart
  // -----------------------------
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
    return fieldsToCheck.map((field) =>
      patientsData.filter(
        (patient) =>
          patient && (patient[field] === null || patient[field] === undefined)
      ).length
    );
  }, [patientsData]);

  const missingDataBarData: any = {
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

  const missingDataBarOptions: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        ticks: {
          autoSkip: false,
          maxRotation: 45,
          minRotation: 0,
        },
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Number of Patients",
        },
      },
    },
    plugins: {
      legend: { position: "top" },
datalabels: {
  display: (ctx) => ctx.dataset.type === "bar",
  anchor: "end",
  align: "end",
  formatter: (value, context) => {
    if (!value) return "";
    const label = context.chart.data.labels?.[context.dataIndex] ?? "";
    const featureKey = (typeof label === "string" ? label.toLowerCase().replace(/ /g, "_") : "");
    const unit = featureUnits[featureKey] || "";
    return `${value.toFixed(2)} ${unit}`;
  },
  color: "#000",
  font: { weight: "bold" },
}

      
    },
  };

  // -----------------------------
  // Totals for Cards
  // -----------------------------
  const totalPatients = patientsData.length;
  const referredPatients = patientsData.filter(
    (patient) => patient?.referral === 1
  ).length;

  // -----------------------------
  // 4) Key Patient Features Chart
  // -----------------------------
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

  // Feature → Unit mapping
const featureUnits: Record<string, string> = {
  feed_vol: "mL",
  oxygen_flow_rate: "L/min",
  resp_rate: "breaths/min",
  bmi: "kg/m²",
  end_tidal_co2: "mmHg",
  feed_vol_adm: "mL",
  fio2: "%",
  fio2_ratio: "ratio",
  insp_time: "seconds",
  peep: "cmH₂O",
  pip: "cmH₂O",
  sip: "cmH₂O",
  tidal_vol: "mL",
  tidal_vol_actual: "mL",
  tidal_vol_kg: "mL/kg",
  tidal_vol_spon: "mL",
};



  // Map each feature to a specific color
  const featureColorMap: Record<string, string> = mlFeatures.reduce(
    (acc: Record<string, string>, feature, i) => {
      acc[feature] = featureColors[i % featureColors.length];
      return acc;
    },
    {} as Record<string, string>
  );

  // Compute average of each selected feature
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

  // Create one bar dataset per selected feature
  const barDatasets = selectedFeatures.map((feature, index) => ({
    type: "bar",
    label: feature.replace(/_/g, " ").toUpperCase(),
    data: selectedFeatures.map((_, i) =>
      i === index ? featureAverages[index] : 0
    ),
    backgroundColor: featureColorMap[feature],
    borderRadius: 5,
  }));

  // Chart data
  const mlFeatureChartData: any = {
    labels: selectedFeatures.map((f) => f.replace(/_/g, " ").toUpperCase()),
    datasets: barDatasets,
  };

  // Chart options
  const mlFeatureChartOptions: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        left: 20,
        right: 60, // <-- this fixes the cutoff issue
        top: 10,
        bottom: 10,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: "Average Value" },
      },
    },
    plugins: {
      datalabels: {
        display: (ctx) => ctx.dataset.type === "bar",
        anchor: "end",
        align: "end",
        formatter: (value: number, context: any) => {
          const { dataset, dataIndex } = context;
          const label = dataset.label || "";
          const featureKey = label.toLowerCase().replace(/ /g, "_");
          const unit = featureUnits[featureKey] || "";
  
          if (value === 0 || dataset.data[dataIndex] !== value) return "";
          return `${value.toFixed(2)} ${unit}`;
        },
        color: "#000",
        font: { weight: "bold" },
      },
      legend: { position: "top" },
      tooltip: {
        mode: "index",
        intersect: false,
        callbacks: {
          label: function (context: any) {
            const rawValue = typeof context.raw === "number" ? context.raw : 0;
            const label = context.dataset.label || "Unknown";
            const featureKey = label.toLowerCase().replace(/ /g, "_");
            const unit = featureUnits[featureKey] || "";
            return `${label}: ${rawValue.toFixed(2)} ${unit}`;
          },
        },
      },
    },
  };
  
  // -----------------------------
  // Handlers
  // -----------------------------
  const handleFeatureClick = (feature: string) => {
    if (selectedFeatures.includes(feature)) {
      setSelectedFeatures((prev) => prev.filter((f) => f !== feature));
    } else if (selectedFeatures.length < 4) {
      setSelectedFeatures((prev) => [...prev, feature]);
    }
  };
  const handleDownload = async (format: "png" | "pdf") => {
    if (!chartRef.current) return;
  
    try {
      // Hide the download buttons before capturing
      if (downloadRef.current) {
        downloadRef.current.style.display = "none";
      }
  
      // Wait a moment for layout to adjust
      await new Promise((res) => setTimeout(res, 300));
  
      // Scroll to top so all content is visible
      window.scrollTo(0, 0);
  
      // Capture chart area as canvas
      const canvas = await html2canvas(chartRef.current, {
        useCORS: true,
        scrollY: -window.scrollY,
        scale: 2, // High-res
      });
  
      const dataUrl = canvas.toDataURL("image/png");
      const width = canvas.width;
      const height = canvas.height;
  
      if (format === "png") {
        const link = document.createElement("a");
        link.download = "patients-charts.png";
        link.href = dataUrl;
        link.click();
      } else {
        const pdf = new jsPDF({
          orientation: "portrait",
          unit: "px",
          format: [width, height],
        });
        pdf.addImage(dataUrl, "PNG", 0, 0, width, height);
        pdf.save("patients-charts.pdf");
      }
    } catch (err) {
      console.error("Download error:", err);
    } finally {
      // Show the buttons again
      if (downloadRef.current) {
        downloadRef.current.style.display = "flex";
      }
    }
  };
  
  
  const downloadRef = useRef<HTMLDivElement>(null);

  // -----------------------------
  // Render
  // -----------------------------
  return (
    <div ref={chartRef} style={{ overflow: "visible", paddingBottom: "2rem" }}>
      {/* Download Buttons */}
      <div className={styles.topActions}>
      <div className={styles.downloadButtons} ref={downloadRef}>
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
          <h2>Referred</h2>
          <h3>{referredPatients}</h3>
        </div>
        <div className={`${styles.card} ${styles.notReferred}`}>
          <h2>Not Referred</h2>
          <h3>{totalPatients - referredPatients}</h3>
        </div>
      </div>

      {/* Referral & AI Referral Pie Charts */}
      <div className={styles.chartContainer}>
        {/* Referral Pie Chart */}
        <div className={styles.chartWrapper}>
          <h2 className={styles.chartTitle}>Referral Overview</h2>
          <div style={{ maxWidth: "500px", height: "500px", margin: "0 auto" }}>
            <Pie data={referralPieData} options={referralPieOptions} />
          </div>
        </div>

        {/* AI Referral Pie Chart */}
        <div className={styles.chartWrapper}>
          <h2 className={styles.chartTitle}>AI Referral Overview</h2>
          <div style={{ maxWidth: "500px", height: "500px", margin: "0 auto" }}>
            <Pie data={aiReferralPieData} options={aiReferralPieOptions} />
          </div>
        </div>
      </div>

      {/* Missing Data & Key Patient Features */}
      <div
        className={styles.chartContainer}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginTop: "2rem",
        }}
      >
        {/* Missing Data Bar Chart */}
        <div className={styles.chartWrapper} style={{ marginBottom: "3rem" }}>
          <h2 className={styles.chartTitle}>Missing Data</h2>
          <div style={{ width: "800px", height: "600px", margin: "0 auto" }}>
            <Bar data={missingDataBarData} options={missingDataBarOptions} />
          </div>
        </div>

        {/* Key Patient Features */}
        <div className={styles.chartWrapper}>
          <h2 className={styles.chartTitle}>Key Patient Features</h2>
          {/* User Guide Paragraph inside the Key Patient Features container */}
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
            
            <div>
              <p>This interactive bar chart displays the average values of up to four selected patient features, based on the data provided in the CSV file. It allows you to visually compare key clinical measurements side by side, making it easier to spot trends, identify anomalies, and support informed medical decisions.
              </p>
  <p>
  For each selected feature, we calculate the average by first filtering out any missing or null values, then adding the remaining values together, and dividing by the number of valid patients for that feature. That way, the average reflects only patients with actual data.  </p>
</div>

            <p>
              <strong>Instructions for Use:</strong> Click on the attribute buttons
              located above the chart to select or deselect specific patient metrics.
              You may select up to four features simultaneously for comparative analysis.
              Upon feature selection, the chart dynamically updates to display the corresponding
              average values clearly, allowing immediate comparison of patient attributes and helping
              in identifying trends or anomalies.
            </p>
            <p>
              <strong>Example Scenario:</strong> To evaluate metrics such as TIDAL VOL, TIDAL VOL SPON,
              SIP, and PIP concurrently, simply select these attributes. The bar chart will then present
              their average values, enabling efficient analysis and interpretation of your patient cohort's
              respiratory parameters.
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

          {/* Bar Chart */}
          <div
            style={{
              width: "800px",
              height: "600px",
              margin: "0 auto",
              paddingLeft: "20px",
            }}
          >
            <Bar data={mlFeatureChartData} options={mlFeatureChartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientsCharts;
