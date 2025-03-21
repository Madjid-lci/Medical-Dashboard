import React from "react";
import Layout from "../layout";
import "./help.css";

const HelpPage: React.FC = () => {
  return (
    <Layout>
      <div className="dashboard">
        <h1 className="dashboard-title">Help</h1>

        <section className="help-section">
          <h2>How to Navigate the CCU App</h2>
          <ul>
            <li><strong>Home:</strong> Your starting point with key actions and welcome screen.</li>
            <li><strong>Patients Referrals:</strong> View patients referred to a dietitian and manage them.</li>
            <li><strong>Analyse Patients Data:</strong> Run analytics on uploaded patient information.</li>
            <li><strong>Upload CSV:</strong> Upload a spreadsheet (.csv) to add multiple patient entries.</li>
            <li><strong>Report:</strong> Generate summary reports of patient referral data.</li>
            <li><strong>Help:</strong> You're here! This page gives an overview of how to use each section.</li>
          </ul>

          <h2>Need Further Assistance?</h2>
          <p>
            If something isn’t working or you need more help, please reach out to our support team:<br />
            📧 <strong>support@ccuapp.example</strong><br />
            Or contact your site administrator.
          </p>
        </section>
      </div>
    </Layout>
  );
};

export default HelpPage;
