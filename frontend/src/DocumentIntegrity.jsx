import React, { useMemo, useState } from "react";
import "./DocumentIntegrity.css";

const getRecords = () => {
  try {
    return JSON.parse(localStorage.getItem("certiVerifyRecords") || "[]");
  } catch {
    return [];
  }
};

const getResult = (record) => record?.result || record;

const getAnalysis = (record) => {
  const result = getResult(record);

  return result?.qualityAnalysis || result?.analysis || {};
};

const getFileName = (record) => {
  const result = getResult(record);

  return (
    result?.fileName ||
    record?.fileName ||
    "Unknown Document"
  );
};

const getSupplier = (record) => {
  const result = getResult(record);

  return (
    result?.supplier ||
    record?.supplier ||
    "Not detected"
  );
};

const getBatchNumber = (record) => {
  const result = getResult(record);

  return (
    result?.batchNumber ||
    record?.batchNumber ||
    "Not detected"
  );
};

const getExtractedText = (record) => {
  const result = getResult(record);

  return (
    result?.extractedText ||
    record?.extractedText ||
    ""
  );
};

/* ============================================
   DOCUMENT INTEGRITY ANALYSIS
============================================ */

const analyzeIntegrity = (record) => {
  const text = getExtractedText(record);
  const supplier = getSupplier(record);
  const batchNumber = getBatchNumber(record);
  const analysis = getAnalysis(record);

  const checks = [];

  checks.push({
    name: "Text Extraction",
    description: "PDF text extraction availability",
    status:
      text && text.trim().length > 50
        ? "PASS"
        : "REVIEW",
    details:
      text && text.trim().length > 50
        ? "Document text successfully extracted"
        : "Insufficient extracted text",
  });

  checks.push({
    name: "Supplier Identification",
    description: "Supplier information availability",
    status:
      supplier &&
      supplier !== "Not detected" &&
      supplier !== "Unknown Supplier"
        ? "PASS"
        : "REVIEW",
    details:
      supplier &&
      supplier !== "Not detected" &&
      supplier !== "Unknown Supplier"
        ? `Supplier detected: ${supplier}`
        : "Supplier information could not be clearly identified",
  });

  checks.push({
    name: "Batch Identification",
    description: "Batch or lot number availability",
    status:
      batchNumber &&
      batchNumber !== "Not detected"
        ? "PASS"
        : "REVIEW",
    details:
      batchNumber &&
      batchNumber !== "Not detected"
        ? `Batch information detected: ${batchNumber}`
        : "Batch number could not be identified",
  });

  checks.push({
    name: "Quality Analysis",
    description: "Document quality parameter analysis",
    status:
      analysis?.totalParameters > 0
        ? "PASS"
        : "REVIEW",
    details:
      analysis?.totalParameters > 0
        ? `${analysis.totalParameters} parameters analyzed`
        : "No quality parameters detected",
  });

  checks.push({
    name: "Document Content",
    description: "Extracted content completeness",
    status:
      text && text.trim().length > 100
        ? "PASS"
        : "REVIEW",
    details:
      text && text.trim().length > 100
        ? "Sufficient document content detected"
        : "Document contains limited extracted information",
  });

  const suspiciousTerms = [
    "altered",
    "modified",
    "fake",
    "fraud",
    "tampered",
    "duplicate",
    "invalid",
    "correction",
    "amended",
  ];

  const foundTerms = suspiciousTerms.filter((term =>
    text.toLowerCase().includes(term)
  ));

  checks.push({
    name: "Suspicious Content Screening",
    description: "Text-based suspicious terminology screening",
    status:
      foundTerms.length > 0
        ? "REVIEW"
        : "PASS",
    details:
      foundTerms.length > 0
        ? `Potentially relevant terms detected: ${foundTerms.join(", ")}`
        : "No suspicious terminology detected",
  });

  checks.push({
    name: "Document Content Availability",
    description: "Document content available for comparison",
    status:
      text && text.trim().length > 0
        ? "PASS"
        : "REVIEW",
    details:
      text && text.trim().length > 0
        ? "Document content is available"
        : "No document content available",
  });

  const passedChecks = checks.filter(
    (check) => check.status === "PASS"
  ).length;

  const reviewChecks = checks.filter(
    (check) => check.status === "REVIEW"
  ).length;

  const integrityScore = Math.round(
    (passedChecks / checks.length) * 100
  );

  let integrityStatus = "SECURE";

  if (integrityScore < 50) {
    integrityStatus = "SUSPICIOUS";
  } else if (
    reviewChecks > 0 ||
    integrityScore < 85
  ) {
    integrityStatus = "REVIEW";
  }

  return {
    checks,
    passedChecks,
    reviewChecks,
    integrityScore,
    integrityStatus,
  };
};

/* ============================================
   MAIN COMPONENT
============================================ */

export default function DocumentIntegrity({ onNavigate }) {
  const [records, setRecords] = useState(getRecords);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [selectedDocument, setSelectedDocument] = useState(null);

  const documents = useMemo(() => {
    return records.map((record, index) => ({
      id: index,
      record,
      fileName: getFileName(record),
      supplier: getSupplier(record),
      batchNumber: getBatchNumber(record),
      integrity: analyzeIntegrity(record),
    }));
  }, [records]);

  const filteredDocuments = documents.filter((document) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      document.fileName.toLowerCase().includes(searchText) ||
      document.supplier.toLowerCase().includes(searchText) ||
      document.batchNumber.toLowerCase().includes(searchText);

    const matchesFilter =
      filter === "ALL" ||
      document.integrity.integrityStatus === filter;

    return matchesSearch && matchesFilter;
  });

  const totalDocuments = documents.length;

  const secureDocuments = documents.filter(
    (document) =>
      document.integrity.integrityStatus === "SECURE"
  ).length;

  const reviewDocuments = documents.filter(
    (document) =>
      document.integrity.integrityStatus === "REVIEW"
  ).length;

  const suspiciousDocuments = documents.filter(
    (document) =>
      document.integrity.integrityStatus === "SUSPICIOUS"
  ).length;

  const averageScore =
    documents.length > 0
      ? Math.round(
          documents.reduce(
            (sum, document) =>
              sum + document.integrity.integrityScore,
            0
          ) / documents.length
        )
      : 0;

  const refreshRecords = () => {
    setRecords(getRecords());
  };

  const getStatusClass = (status) => {
    if (status === "SECURE") {
      return "integrity-secure";
    }

    if (status === "SUSPICIOUS") {
      return "integrity-suspicious";
    }

    return "integrity-review";
  };

  const exportCSV = () => {
    const rows = [
      [
        "Document",
        "Supplier",
        "Batch Number",
        "Integrity Score",
        "Status",
        "Passed Checks",
        "Review Checks",
      ],
      ...filteredDocuments.map((document) => [
        document.fileName,
        document.supplier,
        document.batchNumber,
        `${document.integrity.integrityScore}%`,
        document.integrity.integrityStatus,
        document.integrity.passedChecks,
        document.integrity.reviewChecks,
      ]),
    ];

    const csv = rows
      .map((row) =>
        row
          .map((cell) =>
            `"${String(cell).replace(/"/g, '""')}"`
          )
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "document-integrity-report.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  return (
    <div className="document-integrity-page">

      {/* HEADER */}

      <div className="integrity-header">

        <div className="integrity-header-content">

          <div className="integrity-eyebrow">
            DOCUMENT SECURITY
          </div>

          <h1>Document Integrity</h1>

          <p>
            Screen analyzed CoA documents for missing
            information, content issues, and potential
            integrity concerns.
          </p>

        </div>

        <div className="integrity-header-actions">

          <button
            className="integrity-back-btn"
            onClick={() => onNavigate?.("dashboard")}
          >
            ← Back to Dashboard
          </button>

          <button
            className="integrity-refresh-btn"
            onClick={refreshRecords}
          >
            ↻ Refresh
          </button>

          <button
            className="integrity-export-btn"
            onClick={exportCSV}
          >
            ↓ Export Report
          </button>

        </div>

      </div>

      {/* KPI CARDS */}

      <div className="integrity-kpi-grid">

        <div className="integrity-kpi-card">

          <div className="integrity-kpi-top">
            <span>Documents Scanned</span>

            <div className="integrity-kpi-icon blue">
              📄
            </div>
          </div>

          <h2>{totalDocuments}</h2>

          <p>Total analyzed documents</p>

        </div>

        <div className="integrity-kpi-card">

          <div className="integrity-kpi-top">
            <span>Secure Documents</span>

            <div className="integrity-kpi-icon green">
              🔐
            </div>
          </div>

          <h2>{secureDocuments}</h2>

          <p>Passed integrity screening</p>

        </div>

        <div className="integrity-kpi-card">

          <div className="integrity-kpi-top">
            <span>Requires Review</span>

            <div className="integrity-kpi-icon yellow">
              ⚠️
            </div>
          </div>

          <h2>{reviewDocuments}</h2>

          <p>Documents requiring attention</p>

        </div>

        <div className="integrity-kpi-card">

          <div className="integrity-kpi-top">
            <span>Average Integrity Score</span>

            <div className="integrity-kpi-icon purple">
              🛡️
            </div>
          </div>

          <h2>{averageScore}%</h2>

          <p>Based on screening checks</p>

        </div>

      </div>

      {/* OVERVIEW */}

      <div className="integrity-overview-grid">

        <div className="integrity-overview-card">

          <div className="integrity-overview-header">
            <h2>Integrity Overview</h2>
            <span>Document Screening</span>
          </div>

          <div className="integrity-overview-content">

            <div
              className="integrity-score-circle"
              style={{
                background: `conic-gradient(
                  #22c55e ${averageScore * 3.6}deg,
                  #263449 ${averageScore * 3.6}deg
                )`,
              }}
            >

              <div className="integrity-score-inner">
                <strong>{averageScore}%</strong>
                <span>Average Score</span>
              </div>

            </div>

            <div className="integrity-status-list">

              <div className="integrity-status-item">

                <div className="integrity-status-left">
                  <span className="integrity-dot secure"></span>
                  <span>Secure</span>
                </div>

                <strong>{secureDocuments}</strong>

              </div>

              <div className="integrity-status-item">

                <div className="integrity-status-left">
                  <span className="integrity-dot review"></span>
                  <span>Review</span>
                </div>

                <strong>{reviewDocuments}</strong>

              </div>

              <div className="integrity-status-item">

                <div className="integrity-status-left">
                  <span className="integrity-dot suspicious"></span>
                  <span>Suspicious</span>
                </div>

                <strong>{suspiciousDocuments}</strong>

              </div>

            </div>

          </div>

        </div>

        {/* CHECKS */}

        <div className="integrity-checks-card">

          <div className="integrity-overview-header">
            <h2>Integrity Checks</h2>
            <span>Screening Criteria</span>
          </div>

          <div className="integrity-checks-list">

            <div className="integrity-check-item">
              <div className="integrity-check-icon">
                ✓
              </div>

              <div>
                <strong>Text Extraction</strong>
                <small>PDF content availability</small>
              </div>
            </div>

            <div className="integrity-check-item">
              <div className="integrity-check-icon">
                ✓
              </div>

              <div>
                <strong>Supplier Identification</strong>
                <small>Supplier information detection</small>
              </div>
            </div>

            <div className="integrity-check-item">
              <div className="integrity-check-icon">
                ✓
              </div>

              <div>
                <strong>Batch Identification</strong>
                <small>Batch or lot number detection</small>
              </div>
            </div>

            <div className="integrity-check-item">
              <div className="integrity-check-icon">
                ✓
              </div>

              <div>
                <strong>Content Screening</strong>
                <small>Suspicious terminology check</small>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* DOCUMENT RESULTS */}

      <div className="integrity-documents-panel">

        <div className="integrity-panel-header">

          <div>
            <h2>Document Integrity Results</h2>

            <p>
              Review integrity screening results
              for analyzed documents.
            </p>
          </div>

        </div>

        {/* SEARCH AND FILTER */}

        <div className="integrity-toolbar">

          <div className="integrity-search">

            <span>🔍</span>

            <input
              type="text"
              placeholder="Search document, supplier or batch..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />

          </div>

          <div className="integrity-filter-buttons">

            {["ALL", "SECURE", "REVIEW", "SUSPICIOUS"].map(
              (status) => (
                <button
                  key={status}
                  className={
                    filter === status
                      ? "integrity-filter-active"
                      : ""
                  }
                  onClick={() => setFilter(status)}
                >
                  {status}
                </button>
              )
            )}

          </div>

        </div>

        {/* TABLE */}

        {filteredDocuments.length === 0 ? (

          <div className="integrity-empty">

            <div>🔐</div>

            <h3>No Documents Found</h3>

            <p>
              Upload and analyze CoA documents to
              perform document integrity screening.
            </p>

          </div>

        ) : (

          <div className="integrity-table-container">

            <table className="integrity-table">

              <thead>
                <tr>
                  <th>Document</th>
                  <th>Supplier</th>
                  <th>Batch Number</th>
                  <th>Integrity Score</th>
                  <th>Status</th>
                  <th>Checks</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>

                {filteredDocuments.map((document) => (

                  <tr key={document.id}>

                    <td>
                      <div className="integrity-document-cell">

                        <div className="integrity-file-icon">
                          📄
                        </div>

                        <strong>
                          {document.fileName}
                        </strong>

                      </div>
                    </td>

                    <td>{document.supplier}</td>

                    <td>{document.batchNumber}</td>

                    <td>

                      <div className="integrity-score-cell">

                        <div className="integrity-progress">
                          <div
                            className="integrity-progress-fill"
                            style={{
                              width: `${document.integrity.integrityScore}%`,
                            }}
                          />
                        </div>

                        <strong>
                          {document.integrity.integrityScore}%
                        </strong>

                      </div>

                    </td>

                    <td>

                      <span
                        className={`integrity-status-badge ${getStatusClass(
                          document.integrity.integrityStatus
                        )}`}
                      >
                        {document.integrity.integrityStatus}
                      </span>

                    </td>

                    <td>
                      <span className="integrity-check-count">
                        {document.integrity.passedChecks}
                        /
                        {document.integrity.checks.length}
                      </span>
                    </td>

                    <td>

                      <button
                        className="integrity-view-btn"
                        onClick={() =>
                          setSelectedDocument(document)
                        }
                      >
                        View Details →
                      </button>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </div>

      {/* DETAIL MODAL */}

      {selectedDocument && (

        <div
          className="integrity-modal-overlay"
          onClick={() => setSelectedDocument(null)}
        >

          <div
            className="integrity-modal"
            onClick={(event) => event.stopPropagation()}
          >

            <div className="integrity-modal-header">

              <div>

                <div className="integrity-eyebrow">
                  DOCUMENT SCREENING REPORT
                </div>

                <h2>
                  {selectedDocument.fileName}
                </h2>

              </div>

              <button
                className="integrity-close-btn"
                onClick={() => setSelectedDocument(null)}
              >
                ×
              </button>

            </div>

            {/* SCORE */}

            <div className="integrity-modal-score">

              <div>
                <span>Integrity Score</span>

                <strong>
                  {selectedDocument.integrity.integrityScore}%
                </strong>
              </div>

              <span
                className={`integrity-status-badge ${getStatusClass(
                  selectedDocument.integrity.integrityStatus
                )}`}
              >
                {selectedDocument.integrity.integrityStatus}
              </span>

            </div>

            {/* DOCUMENT INFORMATION */}

            <div className="integrity-document-info-grid">

              <div>
                <span>Supplier</span>
                <strong>
                  {selectedDocument.supplier}
                </strong>
              </div>

              <div>
                <span>Batch Number</span>
                <strong>
                  {selectedDocument.batchNumber}
                </strong>
              </div>

              <div>
                <span>Checks Passed</span>
                <strong>
                  {selectedDocument.integrity.passedChecks}
                </strong>
              </div>

              <div>
                <span>Checks Requiring Review</span>
                <strong>
                  {selectedDocument.integrity.reviewChecks}
                </strong>
              </div>

            </div>

            {/* DETAILED CHECKS */}

            <div className="integrity-modal-section">

              <h3>Detailed Integrity Checks</h3>

              <div className="integrity-detail-checks">

                {selectedDocument.integrity.checks.map(
                  (check, index) => (

                    <div
                      className="integrity-detail-check"
                      key={index}
                    >

                      <div
                        className={`integrity-detail-icon ${
                          check.status === "PASS"
                            ? "pass"
                            : "review"
                        }`}
                      >
                        {check.status === "PASS"
                          ? "✓"
                          : "⚠"}
                      </div>

                      <div className="integrity-detail-content">

                        <div className="integrity-detail-title">

                          <strong>
                            {check.name}
                          </strong>

                          <span
                            className={
                              check.status === "PASS"
                                ? "check-pass"
                                : "check-review"
                            }
                          >
                            {check.status}
                          </span>

                        </div>

                        <p>{check.description}</p>

                        <small>{check.details}</small>

                      </div>

                    </div>

                  )
                )}

              </div>

            </div>

            {/* DISCLAIMER */}

            <div className="integrity-disclaimer">

              <span>ℹ️</span>

              <p>
                This report represents automated screening
                based on extracted PDF text and available
                document information. It does not constitute
                cryptographic signature verification or
                forensic proof of document authenticity.
              </p>

            </div>

            <button
              className="integrity-modal-done"
              onClick={() => setSelectedDocument(null)}
            >
              Close Report
            </button>

          </div>

        </div>

      )}

    </div>
  );
}

function getStatusClass(status) {
  if (status === "SECURE") {
    return "integrity-secure";
  }

  if (status === "SUSPICIOUS") {
    return "integrity-suspicious";
  }

  return "integrity-review";
}