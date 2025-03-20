import React from "react";
import Layout from "./layout"; // Import Layout from the same folder
import "./globals.css"; // Import global styles

const DashboardPage: React.FC = () => {
  return (
    <Layout> 
      <header>
        <h1>Welcome to CCU</h1>
      </header>
    </Layout>
  );
};

export default DashboardPage;
