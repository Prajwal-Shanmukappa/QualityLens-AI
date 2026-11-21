import React from "react";
import "./Dashboard.css";

const features = [
  {
    id: "upload",
    title: "Upload CoA",
    description: "Upload Certificate of Analysis documents",
    icon: "📄",
    color: "#6366f1",
  },
  {
    id: "analyze",
    title: "AI Analysis",
    description: "Extract and analyze document information",
    icon: "🤖",
    color: "#8b5cf6",
  },
  {
    id: "verification",
    title: "Verification",
    description: "Verify quality parameters and standards",
    icon: "🔍",
    color: "#06b6d4",
  },
  {
    id: "cross-document",
    title: "Cross Document",
    description: "Compare CoA with purchase orders",
    icon: "📑",
    color: "#f59e0b",
  },
  {
    id: "trends",
    title: "Batch Trends",
    description: "Track historical quality performance",
    icon: "📈",
    color: "#10b981",
  },
  {
    id: "supplier",
    title: "Supplier Intelligence",
    description: "Monitor supplier quality performance",
    icon: "🏭",
    color: "#ec4899",
  },
  {
    id: "integrity",
    title: "Document Integrity",
    description: "Detect suspicious document changes",
    icon: "🛡️",
    color: "#ef4444",
  },
  {
    id: "risk",
    title: "Risk Prediction",
    description: "Predict potential quality risks",
    icon: "⚠️",
    color: "#f97316",
  },
  {
    id: "records",
    title: "Analysis Records",
    description: "View previously analyzed documents",
    icon: "📂",
    color: "#64748b",
  },
  {
    id: "reports",
    title: "Reports & Insights",
    description: "Generate intelligent quality reports",
    icon: "📊",
    color: "#14b8a6",
  },
  {
    id: "settings",
    title: "Settings",
    description: "Configure your CertiVerify platform",
    icon: "⚙️",
    color: "#64748b",
  },
  {
    id: "help",
    title: "Help & Guide",
    description: "Learn how to use CertiVerify",
    icon: "❓",
    color: "#3b82f6",
  },
];

export default function Dashboard({ onNavigate }) {
  const records = JSON.parse(
    localStorage.getItem("certiVerifyRecords") || "[]"
  );

  const handleFeatureClick = (id) => {
    if (onNavigate) {
      onNavigate(id);
    }
  };

  return (
    <div className="dashboard">

      {/* HEADER */}
      <header className="dashboard-header">

        <div className="brand-section">

          <div className="brand-logo">
            🧪
          </div>

          <div>
            <h1>CertiVerify</h1>
            <p>AI-Powered Quality Verification</p>
          </div>

        </div>

        <div className="header-right">

          <div className="notification-icon">
            🔔
          </div>

          <div className="profile-section">

            <div className="profile-avatar">
              👨‍💻
            </div>

            <div className="profile-info">
              <strong>Administrator</strong>
              <span>Quality Analyst</span>
            </div>

          </div>

        </div>

      </header>

      {/* MAIN CONTENT */}
      <main className="dashboard-content">

        {/* WELCOME SECTION */}
        <section className="welcome-section">

          <div className="welcome-text">

            <h2>Welcome to CertiVerify 👋</h2>

            <p>
              Your intelligent platform for Certificate of Analysis
              verification and quality assurance.
            </p>

          </div>

          <div className="welcome-date">
            <span>📅</span>
            <span>{new Date().toLocaleDateString()}</span>
          </div>

        </section>

        {/* STATISTICS */}
        <section className="stats-grid">

          <div className="stat-card">

            <div className="stat-icon purple">
              📄
            </div>

            <div>
              <p>Total Documents</p>
              <h2>{records.length}</h2>
            </div>

          </div>

          <div className="stat-card">

            <div className="stat-icon green">
              ✅
            </div>

            <div>
              <p>Analyzed Documents</p>
              <h2>{records.length}</h2>
            </div>

          </div>

          <div className="stat-card">

            <div className="stat-icon blue">
              🤖
            </div>

            <div>
              <p>AI Analysis</p>
              <h2>Active</h2>
            </div>

          </div>

          <div className="stat-card">

            <div className="stat-icon orange">
              🛡️
            </div>

            <div>
              <p>Verification System</p>
              <h2>Ready</h2>
            </div>

          </div>

        </section>

        {/* FEATURES */}
        <section className="features-section">

          <div className="section-header">

            <div>
              <h2>System Modules</h2>
              <p>Access all CertiVerify intelligent features</p>
            </div>

          </div>

          <div className="features-grid">

            {features.map((feature) => (

              <button
                key={feature.id}
                className="feature-card"
                onClick={() => handleFeatureClick(feature.id)}
              >

                <div
                  className="feature-icon"
                  style={{
                    backgroundColor: `${feature.color}15`,
                    color: feature.color,
                  }}
                >
                  {feature.icon}
                </div>

                <div className="feature-info">

                  <h3>{feature.title}</h3>

                  <p>{feature.description}</p>

                </div>

                <div className="feature-arrow">
                  →
                </div>

              </button>

            ))}

          </div>

        </section>

        {/* BOTTOM SECTION */}
        <section className="dashboard-bottom">

          {/* RECENT ANALYSIS */}
          <div className="bottom-card">

            <div className="bottom-card-header">

              <div>
                <h3>Recent Analyses</h3>
                <p>Latest document analysis activity</p>
              </div>

              <button
                className="view-all-button"
                onClick={() => handleFeatureClick("records")}
              >
                View All →
              </button>

            </div>

            {records.length === 0 ? (

              <div className="empty-dashboard">

                <div>📂</div>

                <p>No documents analyzed yet</p>

                <button
                  className="small-action-button"
                  onClick={() => handleFeatureClick("upload")}
                >
                  Upload Your First CoA
                </button>

              </div>

            ) : (

              <div className="recent-records">

                {records.slice(0, 5).map((record) => (

                  <div
                    className="recent-record"
                    key={record.id}
                  >

                    <div className="record-icon">
                      📄
                    </div>

                    <div className="record-info">

                      <strong>{record.filename}</strong>

                      <span>{record.date}</span>

                    </div>

                    <span className="status-badge pass">
                      Analyzed
                    </span>

                  </div>

                ))}

              </div>

            )}

          </div>

          {/* AI INTELLIGENCE */}
          <div className="bottom-card ai-card">

            <div className="ai-card-icon">
              🤖
            </div>

            <h3>AI Intelligence</h3>

            <p>
              CertiVerify uses intelligent document processing
              to extract, analyze and verify quality information
              from your Certificate of Analysis.
            </p>

            <div className="ai-features">

              <div>
                <span>✓</span>
                Document Extraction
              </div>

              <div>
                <span>✓</span>
                Quality Parameter Analysis
              </div>

              <div>
                <span>✓</span>
                AI-Powered Insights
              </div>

            </div>

            <button
              className="ai-button"
              onClick={() => handleFeatureClick("upload")}
            >
              Start AI Analysis →
            </button>

          </div>

        </section>

        {/* FOOTER */}
        <footer className="dashboard-footer">

          <p>
            © 2026 CertiVerify | AI-Powered Quality Assurance Platform
          </p>

          <p>
            Version 1.0.0
          </p>

        </footer>

      </main>

    </div>
  );
}