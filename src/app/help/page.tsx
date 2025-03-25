import React from "react";
import styles from "./help.model.css"; // Import the CSS module

const HelpPage: React.FC = () => {
  return (
    <div className={styles.helpContainer}>
      <header className={styles.helpHeader}>
        <h1>Help & Support</h1>
        <p>Find answers to common questions and learn how to use the Medical Dashboard efficiently.</p>
      </header>

      {/* Getting Started Section */}
      <section className={styles.guideSection}>
        <h2>🩺 Getting Started</h2>
        <p>
          The <strong>CCU Medical Dashboard</strong> helps healthcare professionals manage patient data and refer 
          individuals to a dietitian based on their medical status.
        </p>
        <ul>
          <li>✔️ <strong>Upload patient data</strong> via the CSV upload page.</li>
          <li>✔️ <strong>Analyze patient vitals</strong> and prioritize those in need of nutritional support.</li>
          <li>✔️ <strong>Generate reports</strong> for dietitian referrals and patient monitoring.</li>
        </ul>
      </section>

      {/* FAQ Section */}
      <section className={styles.faqSection}>
        <h2>❓ Frequently Asked Questions</h2>

        <div className={styles.faqItem}>
          <h3>📌 How do I upload patient data?</h3>
          <p>
            Navigate to the <strong>Upload CSV</strong> page, select your file, and click **Upload**. Ensure your CSV follows 
            the required format for accurate processing.
          </p>
        </div>

        <div className={styles.faqItem}>
          <h3>📊 How does the system prioritize patients for dietitian referral?</h3>
          <p>
            The dashboard uses a machine learning model to assess **BMI, glucose levels, dietary intake, and other vitals** 
            to flag high-risk patients needing dietitian intervention.
          </p>
        </div>

        <div className={styles.faqItem}>
          <h3>📄 How can I generate a dietitian referral report?</h3>
          <p>
            Go to the <strong>Reports</strong> section, select the relevant date range, and download a **detailed report** 
            containing referred patients.
          </p>
        </div>

        <div className={styles.faqItem}>
          <h3>🔄 Can I update patient records after uploading?</h3>
          <p>
            Yes, you can go to the **Patients Referrals** section and edit existing records to reflect updated medical 
            information.
          </p>
        </div>

        <div className={styles.faqItem}>
          <h3>📞 How can I contact support?</h3>
          <p>
            If you encounter issues, please email us at **support@medicaldashboard.com** or call **+44 1234 567890**.
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className={styles.contactSection}>
        <h2>📬 Need More Help?</h2>
        <p>
          If you require further assistance, reach out to our support team. We’re here to help you improve patient care 
          and streamline dietitian referrals.
        </p>
      </section>
    </div>
  );
};

export default HelpPage;
