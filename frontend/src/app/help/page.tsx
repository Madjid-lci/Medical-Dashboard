import React from "react";
import styles from "./help.model.css"; 

const HelpPage: React.FC = () => {
  return (
    <div className={styles.helpContainer}>
      <header className={styles.helpHeader}>
        <h1>Help & Support</h1>
        <p>
          Welcome to the Critical Care Unit Dashboard Help Center. Here you'll find step-by-step guidance,
          feature highlights, and troubleshooting tips to make the most out of your experience.
        </p>
      </header>

      {/* Getting Started Section */}
      <section className={styles.guideSection}>
        <h2>Getting Started 🩺</h2>
        <p>
          The <strong>CCU Medical Dashboard</strong> streamlines patient data management and dietitian referral
          processes using real-time analytics and interactive visualizations. Follow these steps to begin:
        </p>
        <ol>
          <li>
            <strong>Upload Patient Data:</strong> Go to the <em>Upload CSV</em> page, select your file, and click the 
            <strong> Upload</strong> button. Ensure your CSV follows the required format.
          </li>
          <li>
            <strong>Data Analysis:</strong> Once uploaded, the system processes patient vitals and automatically flags 
            high-risk cases based on key indicators.
          </li>
          <li>
            <strong>Generate Reports:</strong> Visit the <em>Reports</em> section to view interactive charts and download 
            detailed referral reports in png or PDF format.
          </li>
        </ol>
      </section>

      {/* Dashboard Features Section */}
      <section className={styles.featuresSection}>
        <h2>Dashboard Features</h2>
        <ul>
          <li>
            <strong>Real-Time Data Processing:</strong> Automatic flagging of patients using a machine learning model 
            that analyzes vital metrics such as BMI, oxygen flow, and feed volume.
          </li>
          <li>
            <strong>Interactive Visualizations:</strong> Dynamic charts and graphs help you quickly interpret patient data.
          </li>
          <li>
            <strong>Advanced Search & Filtering:</strong> Easily locate patient records with intuitive search and filter tools.
          </li>
          <li>
            <strong>Cross-Platform Support:</strong> Use the dashboard seamlessly on Windows, macOS, and Linux devices.
          </li>
          <li>
            <strong>Offline Functionality:</strong> Continue working with previously uploaded data even without an internet 
            connection.
          </li>
        </ul>
      </section>

      {/* FAQ Section */}
      <section className={styles.faqSection}>
        <h2>Frequently Asked Questions</h2>

        <div className={styles.faqItem}>
          <h3>How do I upload patient data?</h3>
          <p>
            Navigate to the <strong>Upload CSV</strong> page, select your file, and click <strong>Upload</strong>.
            If the CSV file format is incorrect, you will see an error message with guidance on how to correct it.
          </p>
        </div>

        <div className={styles.faqItem}>
          <h3>How does the system prioritize patients for dietitian referral?</h3>
          <p>
            The dashboard leverages a machine learning model to assess vital indicators including BMI, oxygen flow rate,
            respiratory rate, and feed volume to flag high-risk patients automatically.
          </p>
        </div>

        <div className={styles.faqItem}>
          <h3>How can I generate and export a referral report?</h3>
          <p>
            Go to the <strong>Reports</strong> section, select your desired date range, and click <strong>Generate Report</strong>.
            You can export the report as either a CSV or PDF file.
          </p>
        </div>

        <div className={styles.faqItem}>
          <h3>Can I update patient records after uploading?</h3>
          <p>
            Yes. Visit the <strong>Patients Referrals</strong> section to edit or update patient records as new information
            becomes available.
          </p>
        </div>

        <div className={styles.faqItem}>
          <h3>What should I do if I encounter an error?</h3>
          <p>
            Check the on-screen error message for guidance. Common issues include CSV format errors or network connectivity
            problems. If the issue persists, contact support for further assistance.
          </p>
        </div>

        <div className={styles.faqItem}>
          <h3>How can I contact support?</h3>
          <p>
            You can reach our support team by emailing <strong>support@medicaldashboard.com</strong> or calling 
            <strong> +44 1234 567890</strong>.
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className={styles.contactSection}>
        <h2>Need More Help?</h2>
        <p>
          If you need additional assistance or have any questions, please do not hesitate to contact our support team. We’re 
          committed to helping you improve patient care and streamline dietitian referrals.
        </p>
      </section>
    </div>
  );
};

export default HelpPage;
