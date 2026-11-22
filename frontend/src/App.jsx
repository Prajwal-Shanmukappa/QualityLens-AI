import React, { useState } from "react";

import AuthPage from "./AuthPage";

import Dashboard from "./Dashboard";
import UploadPage from "./UploadPage";
import Records from "./Records";
import Reports from "./Reports";
import Settings from "./Settings";
import Help from "./Help";
import BatchTrends from "./BatchTrends";
import SupplierIntelligence from "./SupplierIntelligence";
import DocumentIntegrity from "./DocumentIntegrity";
import CrossDocumentVerification from "./CrossDocumentVerification";
import VerificationCenter from "./VerificationCenter";
import RiskPrediction from "./RiskPrediction";

import "./App.css";

export default function App() {

  // ==========================================
  // AUTHENTICATION
  // ==========================================

  const [authenticatedUser, setAuthenticatedUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("certiVerifyAuthUser");

      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const handleAuthenticated = (user) => {
    localStorage.setItem(
      "certiVerifyAuthUser",
      JSON.stringify(user)
    );

    setAuthenticatedUser(user);
  };

  const handleLogout = () => {
    localStorage.removeItem("certiVerifyAuthUser");

    setAuthenticatedUser(null);
  };

  // ==========================================
  // PAGE NAVIGATION
  // ==========================================

  const [activePage, setActivePage] = useState("dashboard");

  // ==========================================
  // NAVIGATION
  // ==========================================

  const handleNavigation = (page) => {
    if (!page) {
      setActivePage("dashboard");
      return;
    }

    const pageName = String(page)
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-");

    const navigationMap = {
      dashboard: "dashboard",
      home: "dashboard",

      upload: "upload",
      "upload-coa": "upload",
      analyze: "upload",
      "ai-analysis": "upload",
      "coa-analysis": "upload",

      records: "records",
      "analysis-records": "records",

      batchtrends: "batch-trends",
      "batch-trends": "batch-trends",
      batches: "batch-trends",
      trends: "batch-trends",

      supplier: "supplier-intelligence",
      suppliers: "supplier-intelligence",
      "supplier-intelligence": "supplier-intelligence",

      integrity: "document-integrity",
      "document-integrity": "document-integrity",

      crossdocument: "cross-document",
      "cross-document": "cross-document",
      "cross-document-verification": "cross-document",
      "cross-document-analysis": "cross-document",

      verification: "verification",
      "verification-center": "verification",

      "risk-prediction": "risk-prediction",
      riskprediction: "risk-prediction",
      risk: "risk-prediction",

      reports: "reports",
      "reports-insights": "reports",
      "reports-and-insights": "reports",

      settings: "settings",

      help: "help",
      guide: "help",
      "help-guide": "help",
      "help-support": "help",
    };

    const destination =
      navigationMap[pageName] || pageName;

    console.log("Navigation:", page);
    console.log("Destination:", destination);

    setActivePage(destination);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ==========================================
  // BACK TO DASHBOARD
  // ==========================================

  const goToDashboard = () => {
    setActivePage("dashboard");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ==========================================
  // COMING SOON PAGE
  // ==========================================

  const ComingSoonPage = ({
    title,
    icon,
    description,
  }) => {
    return (
      <div className="coming-soon-page">

        <button
          className="page-back-button"
          onClick={goToDashboard}
        >
          ← Back to Dashboard
        </button>

        <div className="coming-soon-content">

          <div className="coming-soon-icon">
            {icon}
          </div>

          <h1>{title}</h1>

          <p>{description}</p>

          <button onClick={goToDashboard}>
            Back to Dashboard
          </button>

        </div>
      </div>
    );
  };

  // ==========================================
  // ROUTING
  // ==========================================

  const renderPage = () => {
    switch (activePage) {

      case "dashboard":
        return (
          <Dashboard
            onNavigate={handleNavigation}
          />
        );

      case "upload":
        return (
          <UploadPage
            onNavigate={handleNavigation}
            onBack={goToDashboard}
          />
        );

      case "records":
        return (
          <Records
            onNavigate={handleNavigation}
            onBack={goToDashboard}
          />
        );

      case "batch-trends":
        return (
          <BatchTrends
            onNavigate={handleNavigation}
            onBack={goToDashboard}
          />
        );

      case "supplier-intelligence":
        return (
          <SupplierIntelligence
            onNavigate={handleNavigation}
            onBack={goToDashboard}
          />
        );

      case "document-integrity":
        return (
          <DocumentIntegrity
            onNavigate={handleNavigation}
            onBack={goToDashboard}
          />
        );

      case "cross-document":
        return (
          <CrossDocumentVerification
            onNavigate={handleNavigation}
            onBack={goToDashboard}
          />
        );

      case "verification":
        return (
          <VerificationCenter
            onNavigate={handleNavigation}
            onBack={goToDashboard}
          />
        );

      case "risk-prediction":
        return (
          <RiskPrediction
            onNavigate={handleNavigation}
            onBack={goToDashboard}
          />
        );

      case "reports":
        return (
          <Reports
            onNavigate={handleNavigation}
            onBack={goToDashboard}
          />
        );

      case "settings":
        return (
          <Settings
            onNavigate={handleNavigation}
            onBack={goToDashboard}
          />
        );

      case "help":
        return (
          <Help
            onNavigate={handleNavigation}
            onBack={goToDashboard}
          />
        );

      default:
        return (
          <Dashboard
            onNavigate={handleNavigation}
          />
        );
    }
  };

  // ==========================================
  // AUTHENTICATION CHECK
  // ==========================================

  if (!authenticatedUser) {
    return (
      <AuthPage
        onAuthenticated={handleAuthenticated}
      />
    );
  }

  // ==========================================
  // MAIN APPLICATION
  // ==========================================

  return (
    <div className="app">

      {/* LOGOUT BUTTON */}

      <div
        style={{
          position: "fixed",
          top: "15px",
          right: "20px",
          zIndex: 99999,
          display: "flex",
          alignItems: "center",
          gap: "10px",
          background: "rgba(255,255,255,0.95)",
          padding: "8px 12px",
          borderRadius: "12px",
          boxShadow: "0 4px 15px rgba(0,0,0,0.12)",
          border: "1px solid #e5e7eb",
        }}
      >

        <div
          style={{
            fontSize: "12px",
            color: "#374151",
            fontWeight: "600",
          }}
        >
          {authenticatedUser.name || authenticatedUser.email}
        </div>

        <button
          onClick={handleLogout}
          style={{
            background: "#ef4444",
            color: "white",
            border: "none",
            borderRadius: "8px",
            padding: "8px 12px",
            cursor: "pointer",
            fontSize: "12px",
            fontWeight: "600",
          }}
        >
          Logout
        </button>

      </div>

      {/* EXISTING APPLICATION */}

      {renderPage()}

    </div>
  );
}