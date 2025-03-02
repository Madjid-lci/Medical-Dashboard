import React from "react";
import Layout from "../layout"; // Import the Layout component
import "./page.lodel.css"; // Import your custom CSS file
import Link from "next/link"; // Import the Link component

type ReferralCardProps = {
  title: string;
  description: string;
};

const ReferralCard: React.FC<ReferralCardProps> = ({ title, description }) => {
  return (
    <div className="referral-card">
      <div className="card-content">
        <img
          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS4lTwq_Cb_AwEquAa0B6WNOZCpeZvSiVQq8j7xqw8mJcy-9I4YuIX2lQCPg5w2qaaa42A&usqp=CAU"
          alt="Profile"
          className="avatar"
        />
        <div className="card-text">
          <h3 className="title">{title}</h3>
          <p className="description">{description}</p>
        </div>
      </div>
    </div>
  );
};

const DietitianDashboard: React.FC = () => {
  const urgentReferrals = [
    { title: "John Doe", description: "High-risk patient" },
    { title: "Jane Smith", description: "Requires immediate attention" },
    { title: "Alex Johnson", description: "Critical dietary needs" },
  ];

  const allReferrals = [
    { title: "Emily Brown", description: "Routine check-up" },
    { title: "Michael Lee", description: "Moderate risk patient" },
    { title: "Chris Evans", description: "Diet adjustment needed" },
    { title: "Taylor Swift", description: "Low-risk case" },
  ];

  return (
    <Layout> {/* Wrap everything in Layout */}
      <div className="dashboard">
        {/* Main Heading */}
        <h1 className="dashboard-title">Patients Referred to Dietitian</h1>

        {/* Urgent Referrals Section */}
        <section className="urgent-referrals">
          <h2 className="section-title urgent">Urgent Referrals</h2>
          <div className="referral-list">
            {urgentReferrals.map((referral, index) => (
              <ReferralCard key={index} {...referral} />
            ))}
          </div>
        </section>

        {/* All Referrals Section */}
        <section className="all-referrals">
          <h2 className="section-title">All Referrals</h2>
          <div className="referral-list">
            {allReferrals.map((referral, index) => (
              <ReferralCard key={index} {...referral} />
            ))}
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default DietitianDashboard;
