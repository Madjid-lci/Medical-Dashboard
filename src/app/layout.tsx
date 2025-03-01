import React, { ReactNode } from "react";
import Link from "next/link";
import "./globals.css"; // Import global styles

type LayoutProps = {
  children: ReactNode; // Type for children (React components or elements)
};

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <html>
      <body>
    <div className="layout">
      {/* Header */}
      <header className="header">
      <nav className="navbar">
        <div className="nav-buttons">
        <Link href="/dashboard"><button>Dashboard</button></Link>
        <Link href="/patients-referrals"><button>Patients Referrals</button></Link>
        <Link href="/upload"><button>Upload CSV</button></Link>
        <Link href="/"><button>Reports</button></Link>
        </div>
        <input type="text" placeholder="Search Patients..." className="search-bar" />
        
        </nav>
      </header>

      {/* Main Content */}
      <main className="main-content">{children}</main>

      {/* Footer */}
      <footer className="footer">
      </footer>
    </div></body></html>
  );
};

export default Layout;