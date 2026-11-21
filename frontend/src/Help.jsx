
import React, { useState } from "react";
import "./Help.css";

function Help({ onBack, onNavigate }) {
  const [activeSection, setActiveSection] = useState("getting-started");
  const [openFAQ, setOpenFAQ] = useState(null);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (onNavigate) {
      onNavigate("dashboard");
    }
  };

  const sections = [
    {
      id: "getting-started",
      icon: "🚀",
      title: "Getting Started",
    },
    {
      id: "coa-analysis",
      icon: "📄",
      title: "CoA Analysis",
    },
    {
      id: "results",
      icon: "📊",
      title: "Understanding Results",
    },
    {
      id: "cross-document",
      icon: "🔍",
      title: "Cross-Document Verification",
    },
    {
      id: "supplier",
      icon: "🏭",
      title: "Supplier Intelligence",
    },
    {
      id: "batch-trends",
      icon: "📈",
      title: "Batch Trends",
    },
    {
      id: "integrity",
      icon: "🛡️",
      title: "Document Integrity",
    },
    {
      id: "risk",
      icon: "🎯",
      title: "Risk Prediction",
    },
    {
      id: "reports",
      icon: "📋",
      title: "Reports & Insights",
    },
    {
      id: "faq",
      icon: "❓",
      title: "FAQ",
    },
  ];

  const faqs = [
    {
      question: "What is QualityLens AI?",
      answer:
        "QualityLens AI is a quality verification platform designed to analyze Certificates of Analysis (CoA), extract document information, evaluate quality parameters, and help identify potential discrepancies in pharmaceutical and manufacturing documents.",
    },
    {
      question: "What file formats can I upload?",
      answer:
        "The current document analysis workflow primarily supports PDF documents. Ensure your PDF is readable and contains the required certificate information.",
    },
    {
      question: "What does PASS mean?",
      answer:
        "PASS indicates that the analyzed document's available quality parameters satisfy the configured verification criteria.",
    },
    {
      question: "What does FAIL mean?",
      answer:
        "FAIL indicates that one or more quality parameters may not satisfy the expected specifications. Review the failed parameters carefully before making a decision.",
    },
    {
      question: "What does REVIEW mean?",
      answer:
        "REVIEW indicates that the document requires additional human inspection. This may happen because of incomplete information, uncertain extraction, missing values, or a result that needs manual verification.",
    },
    {
      question: "Where are my analysis records stored?",
      answer:
        "Depending on your current application implementation, records may be stored in browser local storage or through your backend database. The current frontend uses local storage for saved analysis records.",
    },
    {
      question: "Can AI guarantee that a document is genuine?",
      answer:
        "No. Automated analysis can identify suspicious patterns and inconsistencies, but it cannot independently guarantee document authenticity. Human verification and official supplier confirmation may still be necessary.",
    },
    {
      question: "What should I do if a document fails?",
      answer:
        "Review the failed parameters, verify the original document, compare the batch information with supporting documents, and contact the relevant supplier or quality team if necessary.",
    },
    {
      question: "Why is a result marked REVIEW?",
      answer:
        "A result may be marked REVIEW when information is missing, extraction confidence is insufficient, specifications cannot be confidently compared, or manual verification is required.",
    },
  ];

  const renderContent = () => {
    switch (activeSection) {

      // GETTING STARTED

      case "getting-started":
        return (
          <>
            <div className="help-section-heading">
              <span className="help-section-icon">🚀</span>

              <div>
                <h2>Getting Started</h2>
                <p>
                  Learn the basics of QualityLens AI.
                </p>
              </div>
            </div>

            <div className="help-welcome-card">
              <div className="help-welcome-content">
                <h3>Welcome to QualityLens AI</h3>

                <p>
                  Your intelligent quality verification
                  platform for analyzing Certificates of
                  Analysis, checking document consistency,
                  monitoring batch quality, and identifying
                  potential risks.
                </p>

                <button
                  className="help-primary-button"
                  onClick={() => onNavigate?.("upload")}
                >
                  Start Analyzing Documents →
                </button>
              </div>

              <div className="help-welcome-illustration">
                🧪
              </div>
            </div>

            <h3 className="help-subheading">
              Quick Start Guide
            </h3>

            <div className="help-steps-grid">

              <div className="help-step-card">
                <div className="help-step-number">01</div>
                <div className="help-step-icon">📤</div>
                <h4>Upload Document</h4>
                <p>
                  Upload your Certificate of Analysis
                  PDF through the document analysis page.
                </p>
              </div>

              <div className="help-step-card">
                <div className="help-step-number">02</div>
                <div className="help-step-icon">🤖</div>
                <h4>AI Analysis</h4>
                <p>
                  The system extracts document information
                  and evaluates quality parameters.
                </p>
              </div>

              <div className="help-step-card">
                <div className="help-step-number">03</div>
                <div className="help-step-icon">📊</div>
                <h4>Review Results</h4>
                <p>
                  Check the overall status, quality score,
                  extracted details, and flagged parameters.
                </p>
              </div>

              <div className="help-step-card">
                <div className="help-step-number">04</div>
                <div className="help-step-icon">💾</div>
                <h4>Save & Track</h4>
                <p>
                  View saved records and monitor quality
                  trends across batches and suppliers.
                </p>
              </div>

            </div>

            <h3 className="help-subheading">
              Dashboard Overview
            </h3>

            <div className="help-feature-list">

              <div className="help-feature-item">
                <span>📄</span>
                <div>
                  <strong>Analyze CoA</strong>
                  <p>
                    Upload and analyze Certificates of Analysis.
                  </p>
                </div>
              </div>

              <div className="help-feature-item">
                <span>📚</span>
                <div>
                  <strong>Analysis Records</strong>
                  <p>
                    Access previously analyzed documents.
                  </p>
                </div>
              </div>

              <div className="help-feature-item">
                <span>📈</span>
                <div>
                  <strong>Batch Trends</strong>
                  <p>
                    Track quality trends across different batches.
                  </p>
                </div>
              </div>

              <div className="help-feature-item">
                <span>🏭</span>
                <div>
                  <strong>Supplier Intelligence</strong>
                  <p>
                    Evaluate supplier performance and quality.
                  </p>
                </div>
              </div>

              <div className="help-feature-item">
                <span>🔍</span>
                <div>
                  <strong>Cross-Document Verification</strong>
                  <p>
                    Compare CoA information with supporting
                    documents.
                  </p>
                </div>
              </div>

              <div className="help-feature-item">
                <span>🛡️</span>
                <div>
                  <strong>Document Integrity</strong>
                  <p>
                    Examine documents for potential
                    inconsistencies or integrity concerns.
                  </p>
                </div>
              </div>

            </div>
          </>
        );

      // COA ANALYSIS

      case "coa-analysis":
        return (
          <>
            <div className="help-section-heading">
              <span className="help-section-icon">📄</span>

              <div>
                <h2>CoA Analysis</h2>
                <p>
                  Analyze Certificates of Analysis.
                </p>
              </div>
            </div>

            <div className="help-info-box">
              <strong>What is a CoA?</strong>

              <p>
                A Certificate of Analysis is a document
                containing analytical test results for a
                product, material, or batch. It commonly
                includes specifications, measured values,
                testing methods, batch information, and
                approval details.
              </p>
            </div>

            <h3 className="help-subheading">
              How to Analyze a CoA
            </h3>

            <div className="help-step-list">

              <div className="help-step-list-item">
                <div className="help-step-number">1</div>
                <div>
                  <strong>Open Analyze CoA</strong>
                  <p>
                    Navigate to the document analysis page
                    from your dashboard.
                  </p>
                </div>
              </div>

              <div className="help-step-list-item">
                <div className="help-step-number">2</div>
                <div>
                  <strong>Select your PDF</strong>
                  <p>
                    Choose the Certificate of Analysis
                    you want to analyze.
                  </p>
                </div>
              </div>

              <div className="help-step-list-item">
                <div className="help-step-number">3</div>
                <div>
                  <strong>Start Analysis</strong>
                  <p>
                    Click the Analyze with AI button
                    to process the document.
                  </p>
                </div>
              </div>

              <div className="help-step-list-item">
                <div className="help-step-number">4</div>
                <div>
                  <strong>Review extracted information</strong>
                  <p>
                    Examine supplier details, batch
                    information, quality parameters,
                    specifications, and results.
                  </p>
                </div>
              </div>

              <div className="help-step-list-item">
                <div className="help-step-number">5</div>
                <div>
                  <strong>Review the final status</strong>
                  <p>
                    Check whether the document is PASS,
                    FAIL, or REVIEW.
                  </p>
                </div>
              </div>

            </div>

            <div className="help-warning-box">
              <strong>Important</strong>

              <p>
                Always verify extracted information against
                the original document. Automated extraction
                can occasionally produce errors.
              </p>
            </div>

            <button
              className="help-primary-button"
              onClick={() => onNavigate?.("upload")}
            >
              Go to CoA Analysis →
            </button>
          </>
        );

      // RESULTS

      case "results":
        return (
          <>
            <div className="help-section-heading">
              <span className="help-section-icon">📊</span>

              <div>
                <h2>Understanding Analysis Results</h2>
                <p>
                  Learn how to interpret your verification results.
                </p>
              </div>
            </div>

            <div className="help-result-grid">

              <div className="help-result-card pass">
                <div className="help-result-icon">✓</div>
                <h3>PASS</h3>
                <p>
                  The available parameters meet the configured
                  verification criteria.
                </p>
              </div>

              <div className="help-result-card fail">
                <div className="help-result-icon">✕</div>
                <h3>FAIL</h3>
                <p>
                  One or more parameters have failed or
                  indicate a quality concern.
                </p>
              </div>

              <div className="help-result-card review">
                <div className="help-result-icon">!</div>
                <h3>REVIEW</h3>
                <p>
                  The document requires manual inspection
                  or additional verification.
                </p>
              </div>

            </div>

            <h3 className="help-subheading">
              Common Result Fields
            </h3>

            <div className="help-data-table">
              <div className="help-data-row header">
                <span>Field</span>
                <span>Description</span>
              </div>

              <div className="help-data-row">
                <strong>Supplier</strong>
                <span>
                  Name of the manufacturer or supplier.
                </span>
              </div>

              <div className="help-data-row">
                <strong>Batch Number</strong>
                <span>
                  Unique identifier for the product batch.
                </span>
              </div>

              <div className="help-data-row">
                <strong>Quality Score</strong>
                <span>
                  Numerical indicator representing
                  the overall quality assessment.
                </span>
              </div>

              <div className="help-data-row">
                <strong>Parameters</strong>
                <span>
                  Individual analytical tests and
                  their measured values.
                </span>
              </div>

              <div className="help-data-row">
                <strong>Specification</strong>
                <span>
                  Expected acceptable range or limit
                  for a quality parameter.
                </span>
              </div>

              <div className="help-data-row">
                <strong>Result</strong>
                <span>
                  Indicates whether a parameter
                  satisfies the specification.
                </span>
              </div>
            </div>
          </>
        );

      // CROSS DOCUMENT

      case "cross-document":
        return (
          <>
            <div className="help-section-heading">
              <span className="help-section-icon">🔍</span>

              <div>
                <h2>Cross-Document Verification</h2>
                <p>
                  Compare information across multiple documents.
                </p>
              </div>
            </div>

            <div className="help-info-box">
              <strong>Purpose</strong>

              <p>
                Cross-document verification helps identify
                mismatches between a Certificate of Analysis
                and supporting documents such as purchase
                orders or related records.
              </p>
            </div>

            <h3 className="help-subheading">
              Verification Workflow
            </h3>

            <div className="help-step-list">

              <div className="help-step-list-item">
                <div className="help-step-number">1</div>
                <div>
                  <strong>Upload the CoA</strong>
                  <p>
                    Select the Certificate of Analysis
                    for the material or batch.
                  </p>
                </div>
              </div>

              <div className="help-step-list-item">
                <div className="help-step-number">2</div>
                <div>
                  <strong>Upload the supporting document</strong>
                  <p>
                    Select the purchase order or
                    other document to compare.
                  </p>
                </div>
              </div>

              <div className="help-step-list-item">
                <div className="help-step-number">3</div>
                <div>
                  <strong>Run Verification</strong>
                  <p>
                    The system compares available
                    document fields.
                  </p>
                </div>
              </div>

              <div className="help-step-list-item">
                <div className="help-step-number">4</div>
                <div>
                  <strong>Review mismatches</strong>
                  <p>
                    Carefully review batch numbers,
                    product names, quantities, suppliers,
                    and other compared information.
                  </p>
                </div>
              </div>

            </div>

            <div className="help-warning-box">
              <strong>Verification Tip</strong>

              <p>
                A document mismatch does not automatically
                mean fraud. Differences may result from
                formatting, abbreviations, or data-entry
                errors and should be investigated.
              </p>
            </div>

            <button
              className="help-primary-button"
              onClick={() => onNavigate?.("cross-document")}
            >
              Open Cross-Document Verification →
            </button>
          </>
        );

      // SUPPLIER

      case "supplier":
        return (
          <>
            <div className="help-section-heading">
              <span className="help-section-icon">🏭</span>

              <div>
                <h2>Supplier Intelligence</h2>
                <p>
                  Monitor supplier quality performance.
                </p>
              </div>
            </div>

            <p className="help-intro-text">
              Supplier Intelligence provides an overview
              of supplier performance based on analyzed
              documents and recorded quality results.
            </p>

            <div className="help-feature-list">

              <div className="help-feature-item">
                <span>📊</span>
                <div>
                  <strong>Supplier Performance</strong>
                  <p>
                    Review the overall quality performance
                    of different suppliers.
                  </p>
                </div>
              </div>

              <div className="help-feature-item">
                <span>✓</span>
                <div>
                  <strong>Pass Rate</strong>
                  <p>
                    Understand the percentage of documents
                    that passed verification.
                  </p>
                </div>
              </div>

              <div className="help-feature-item">
                <span>⚠️</span>
                <div>
                  <strong>Quality Issues</strong>
                  <p>
                    Identify suppliers with repeated
                    failures or review cases.
                  </p>
                </div>
              </div>

              <div className="help-feature-item">
                <span>📦</span>
                <div>
                  <strong>Batch History</strong>
                  <p>
                    Track supplier performance across
                    analyzed batches.
                  </p>
                </div>
              </div>

            </div>

            <div className="help-info-box">
              <strong>How to use Supplier Intelligence</strong>

              <p>
                Analyze multiple documents from the same
                supplier to create a meaningful performance
                history. A single document may not be enough
                to evaluate a supplier accurately.
              </p>
            </div>

            <button
              className="help-primary-button"
              onClick={() => onNavigate?.("supplier-intelligence")}
            >
              Open Supplier Intelligence →
            </button>
          </>
        );

      // BATCH TRENDS

      case "batch-trends":
        return (
          <>
            <div className="help-section-heading">
              <span className="help-section-icon">📈</span>

              <div>
                <h2>Batch Trends</h2>
                <p>
                  Analyze quality trends across batches.
                </p>
              </div>
            </div>

            <p className="help-intro-text">
              Batch Trends helps you monitor quality
              results across analyzed batches and identify
              recurring patterns.
            </p>

            <div className="help-feature-list">

              <div className="help-feature-item">
                <span>📊</span>
                <div>
                  <strong>Quality Trend</strong>
                  <p>
                    Track changes in quality performance
                    over time.
                  </p>
                </div>
              </div>

              <div className="help-feature-item">
                <span>✓</span>
                <div>
                  <strong>Pass Rate</strong>
                  <p>
                    Monitor the percentage of batches
                    that pass quality verification.
                  </p>
                </div>
              </div>

              <div className="help-feature-item">
                <span>❌</span>
                <div>
                  <strong>Failed Batches</strong>
                  <p>
                    Identify batches with failed quality
                    assessments.
                  </p>
                </div>
              </div>

              <div className="help-feature-item">
                <span>⚠️</span>
                <div>
                  <strong>Review Batches</strong>
                  <p>
                    Find batches requiring additional
                    quality investigation.
                  </p>
                </div>
              </div>

            </div>

            <div className="help-info-box">
              <strong>Recommended Practice</strong>

              <p>
                Analyze batches consistently and ensure
                batch identifiers are correctly extracted
                to improve trend accuracy.
              </p>
            </div>

            <button
              className="help-primary-button"
              onClick={() => onNavigate?.("batch-trends")}
            >
              Open Batch Trends →
            </button>
          </>
        );

      // INTEGRITY

      case "integrity":
        return (
          <>
            <div className="help-section-heading">
              <span className="help-section-icon">🛡️</span>

              <div>
                <h2>Document Integrity</h2>
                <p>
                  Examine document consistency and integrity.
                </p>
              </div>
            </div>

            <div className="help-info-box">
              <strong>What does Document Integrity do?</strong>

              <p>
                Document Integrity is designed to help
                identify suspicious document characteristics,
                inconsistencies, and potential integrity
                concerns that may require investigation.
              </p>
            </div>

            <h3 className="help-subheading">
              What to Review
            </h3>

            <div className="help-feature-list">

              <div className="help-feature-item">
                <span>🔤</span>
                <div>
                  <strong>Text Consistency</strong>
                  <p>
                    Look for inconsistent values,
                    formatting, or suspicious text.
                  </p>
                </div>
              </div>

              <div className="help-feature-item">
                <span>📋</span>
                <div>
                  <strong>Document Information</strong>
                  <p>
                    Review document numbers,
                    dates, and batch identifiers.
                  </p>
                </div>
              </div>

              <div className="help-feature-item">
                <span>⚠️</span>
                <div>
                  <strong>Potential Issues</strong>
                  <p>
                    Examine detected irregularities
                    and manually verify them.
                  </p>
                </div>
              </div>

            </div>

            <div className="help-warning-box">
              <strong>Important</strong>

              <p>
                Automated integrity checks cannot prove
                that a document is fraudulent or genuine.
                Findings should be treated as indicators
                requiring investigation.
              </p>
            </div>

            <button
              className="help-primary-button"
              onClick={() => onNavigate?.("document-integrity")}
            >
              Open Document Integrity →
            </button>
          </>
        );

      // RISK

      case "risk":
        return (
          <>
            <div className="help-section-heading">
              <span className="help-section-icon">🎯</span>

              <div>
                <h2>Risk Prediction</h2>
                <p>
                  Identify potentially high-risk quality records.
                </p>
              </div>
            </div>

            <div className="help-risk-levels">

              <div className="help-risk-card low">
                <div className="help-risk-indicator" />
                <h3>Low Risk</h3>
                <p>
                  Lower priority for additional investigation.
                </p>
              </div>

              <div className="help-risk-card medium">
                <div className="help-risk-indicator" />
                <h3>Medium Risk</h3>
                <p>
                  Review recommended before final decisions.
                </p>
              </div>

              <div className="help-risk-card high">
                <div className="help-risk-indicator" />
                <h3>High Risk</h3>
                <p>
                  Requires priority review and investigation.
                </p>
              </div>

            </div>

            <h3 className="help-subheading">
              Risk Factors
            </h3>

            <div className="help-feature-list">

              <div className="help-feature-item">
                <span>❌</span>
                <div>
                  <strong>Failed Parameters</strong>
                  <p>
                    Quality parameters that do not
                    meet expected specifications.
                  </p>
                </div>
              </div>

              <div className="help-feature-item">
                <span>⚠️</span>
                <div>
                  <strong>Review Status</strong>
                  <p>
                    Documents requiring additional
                    verification.
                  </p>
                </div>
              </div>

              <div className="help-feature-item">
                <span>📉</span>
                <div>
                  <strong>Low Quality Score</strong>
                  <p>
                    Lower quality scores may indicate
                    greater review priority.
                  </p>
                </div>
              </div>

              <div className="help-feature-item">
                <span>🏭</span>
                <div>
                  <strong>Supplier History</strong>
                  <p>
                    Repeated quality issues can contribute
                    to supplier risk assessment.
                  </p>
                </div>
              </div>

            </div>

            <div className="help-warning-box">
              <strong>Risk Scores Are Indicators</strong>

              <p>
                Risk scores are decision-support indicators.
                They should not replace professional quality
                judgment or regulatory procedures.
              </p>
            </div>

            <button
              className="help-primary-button"
              onClick={() => onNavigate?.("risk-prediction")}
            >
              Open Risk Prediction →
            </button>
          </>
        );

      // REPORTS

      case "reports":
        return (
          <>
            <div className="help-section-heading">
              <span className="help-section-icon">📋</span>

              <div>
                <h2>Reports & Insights</h2>
                <p>
                  Understand your quality analytics.
                </p>
              </div>
            </div>

            <div className="help-feature-list">

              <div className="help-feature-item">
                <span>📊</span>
                <div>
                  <strong>Quality Overview</strong>
                  <p>
                    Review total documents, pass rate,
                    failed records, and quality scores.
                  </p>
                </div>
              </div>

              <div className="help-feature-item">
                <span>📈</span>
                <div>
                  <strong>Quality Distribution</strong>
                  <p>
                    Understand the distribution of
                    PASS, FAIL, and REVIEW results.
                  </p>
                </div>
              </div>

              <div className="help-feature-item">
                <span>🏭</span>
                <div>
                  <strong>Supplier Analytics</strong>
                  <p>
                    Compare suppliers using their
                    recorded quality history.
                  </p>
                </div>
              </div>

              <div className="help-feature-item">
                <span>📑</span>
                <div>
                  <strong>Recent Records</strong>
                  <p>
                    Review recent document analyses
                    and their outcomes.
                  </p>
                </div>
              </div>

              <div className="help-feature-item">
                <span>💡</span>
                <div>
                  <strong>Quality Insights</strong>
                  <p>
                    Review automatically generated
                    observations based on your records.
                  </p>
                </div>
              </div>

            </div>

            <button
              className="help-primary-button"
              onClick={() => onNavigate?.("reports")}
            >
              Open Reports & Insights →
            </button>
          </>
        );

      // FAQ

      case "faq":
        return (
          <>
            <div className="help-section-heading">
              <span className="help-section-icon">❓</span>

              <div>
                <h2>Frequently Asked Questions</h2>
                <p>
                  Find answers to common questions.
                </p>
              </div>
            </div>

            <div className="help-faq-list">

              {faqs.map((faq, index) => (
                <div
                  className={`help-faq-item ${
                    openFAQ === index ? "open" : ""
                  }`}
                  key={index}
                >
                  <button
                    className="help-faq-question"
                    onClick={() =>
                      setOpenFAQ(
                        openFAQ === index ? null : index
                      )
                    }
                  >
                    <span>{faq.question}</span>

                    <span className="help-faq-arrow">
                      {openFAQ === index ? "−" : "+"}
                    </span>
                  </button>

                  {openFAQ === index && (
                    <div className="help-faq-answer">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}

            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="help-page">

      {/* HEADER */}

      <div className="help-header">
        <button
          className="help-back-button"
          onClick={handleBack}
        >
          ← Back to Dashboard
        </button>

        <div className="help-header-content">
          <div className="help-header-icon">
            ❓
          </div>

          <div>
            <h1>Help & Guide</h1>

            <p>
              Learn how to use QualityLens AI
              and get answers to your questions.
            </p>
          </div>
        </div>
      </div>

      {/* LAYOUT */}

      <div className="help-layout">

        {/* SIDEBAR */}

        <aside className="help-sidebar">

          <div className="help-sidebar-title">
            HELP CENTER
          </div>

          {sections.map((section) => (
            <button
              key={section.id}
              className={`help-nav-item ${
                activeSection === section.id ? "active" : ""
              }`}
              onClick={() => {
                setActiveSection(section.id);
                setOpenFAQ(null);
              }}
            >
              <span>{section.icon}</span>
              {section.title}
            </button>
          ))}

          <div className="help-sidebar-support">
            <div>💬</div>

            <strong>Need more help?</strong>

            <p>
              Explore the guides or contact your
              project administrator.
            </p>
          </div>

        </aside>

        {/* MAIN CONTENT */}

        <main className="help-content">
          {renderContent()}
        </main>

      </div>

      {/* FOOTER */}

      <div className="help-footer">
        <span>QualityLens AI Help Center</span>
        <span>Quality Verification Platform</span>
      </div>

    </div>
  );
}

export default Help;
