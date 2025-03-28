"use client"; // Mark the file as a Client Component

import React, { ReactNode } from "react";
import Link from "next/link";
import "./globals.css"; // Ensure correct path to global styles

type LayoutProps = {
  children: ReactNode;
};

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <html lang="en">
      <body>
        <div className="layout">
          {/* Header */}
          <header className="header">
            <nav className="navbar">
              <div className="nav-buttons">
                <Link href="/"><button>Home</button></Link>
                <Link href="/patients-referrals"><button>Patients Referrals</button></Link>
                <Link href="/analyse-patients-data"><button>Analyse Patients Data</button></Link>
                <Link href="/upload"><button>Upload CSV</button></Link>
                <Link href="/reports"><button>Reports</button></Link>
                <Link href="/help"><button>Help</button></Link>
              </div>
            </nav>
          </header>

          {/* Main Content */}
          <main className="main-content">{children}</main>

          {/* Footer */}
          <footer className="footer"></footer>
        </div>
      </body>
    </html>
  );
};

export default Layout;