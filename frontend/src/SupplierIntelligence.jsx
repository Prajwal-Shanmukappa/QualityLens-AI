import React, { useMemo, useState } from "react";
import "./SupplierIntelligence.css";

const getRecords = () => {
  try {
    return JSON.parse(
      localStorage.getItem("certiVerifyRecords") || "[]"
    );
  } catch {
    return [];
  }
};

const getAnalysis = (record) =>
  record?.result?.qualityAnalysis ||
  record?.qualityAnalysis ||
  record?.result?.analysis ||
  {};

const getSupplier = (record) => {
  const result = record?.result || record;

  return (
    result?.supplier ||
    record?.supplier ||
    result?.supplierName ||
    record?.supplierName ||
    "Unknown Supplier"
  );
};

const getStatus = (record) => {
  const analysis = getAnalysis(record);
  const result = record?.result || record;

  return (
    analysis?.overallStatus ||
    result?.overallStatus ||
    result?.status ||
    "REVIEW"
  ).toUpperCase();
};

const getCount = (record, key) => {
  const analysis = getAnalysis(record);
  const result = record?.result || record;

  const value =
    analysis?.[key] ??
    result?.[key] ??
    0;

  return Number(value) || 0;
};

const getSupplierStats = (records) => {
  const suppliers = {};

  records.forEach((record) => {
    const supplier = getSupplier(record);

    if (!suppliers[supplier]) {
      suppliers[supplier] = {
        name: supplier,
        documents: 0,
        pass: 0,
        fail: 0,
        review: 0,
        totalParameters: 0,
        passedParameters: 0,
        failedParameters: 0,
        reviewParameters: 0,
        records: [],
      };
    }

    const stats = suppliers[supplier];

    stats.documents++;

    const status = getStatus(record);

    if (status === "PASS") stats.pass++;
    else if (status === "FAIL") stats.fail++;
    else stats.review++;

    stats.totalParameters += getCount(
      record,
      "totalParameters"
    );

    stats.passedParameters += getCount(
      record,
      "passCount"
    );

    stats.failedParameters += getCount(
      record,
      "failCount"
    );

    stats.reviewParameters += getCount(
      record,
      "reviewCount"
    );

    stats.records.push(record);
  });

  return Object.values(suppliers).map((supplier) => {
    const passRate =
      supplier.totalParameters > 0
        ? Math.round(
            (supplier.passedParameters /
              supplier.totalParameters) *
              100
          )
        : supplier.documents > 0
        ? Math.round(
            (supplier.pass / supplier.documents) * 100
          )
        : 0;

    let risk = "LOW";

    if (
      supplier.fail > 0 ||
      supplier.failedParameters > 0 ||
      passRate < 70
    ) {
      risk = "HIGH";
    } else if (
      supplier.review > 0 ||
      supplier.reviewParameters > 0 ||
      passRate < 90
    ) {
      risk = "MEDIUM";
    }

    return {
      ...supplier,
      passRate,
      risk,
    };
  });
};

export default function SupplierIntelligence({
  onBack,
  onNavigate,
}) {
  const [records, setRecords] = useState(getRecords);
  const [search, setSearch] = useState("");
  const [selectedSupplier, setSelectedSupplier] =
    useState(null);

  // ==========================================
  // BACK TO DASHBOARD
  // ==========================================

  const handleBack = () => {
    if (typeof onBack === "function") {
      onBack();
      return;
    }

    if (typeof onNavigate === "function") {
      onNavigate("dashboard");
      return;
    }

    window.location.reload();
  };

  // ==========================================
  // SUPPLIER DATA
  // ==========================================

  const suppliers = useMemo(
    () => getSupplierStats(records),
    [records]
  );

  const filteredSuppliers = suppliers.filter((supplier) =>
    supplier.name
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const totalSuppliers = suppliers.length;

  const totalDocuments = suppliers.reduce(
    (sum, supplier) => sum + supplier.documents,
    0
  );

  const highRiskSuppliers = suppliers.filter(
    (supplier) => supplier.risk === "HIGH"
  ).length;

  const averagePassRate =
    suppliers.length > 0
      ? Math.round(
          suppliers.reduce(
            (sum, supplier) => sum + supplier.passRate,
            0
          ) / suppliers.length
        )
      : 0;

  // ==========================================
  // REFRESH DATA
  // ==========================================

  const refreshData = () => {
    setRecords(getRecords());
  };

  // ==========================================
  // EXPORT CSV
  // ==========================================

  const exportCSV = () => {
    const rows = [
      [
        "Supplier",
        "Documents",
        "Pass",
        "Fail",
        "Review",
        "Pass Rate",
        "Risk Level",
      ],
      ...filteredSuppliers.map((supplier) => [
        supplier.name,
        supplier.documents,
        supplier.pass,
        supplier.fail,
        supplier.review,
        `${supplier.passRate}%`,
        supplier.risk,
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
    link.download = "supplier-intelligence.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  // ==========================================
  // RISK CLASS
  // ==========================================

  const getRiskClass = (risk) => {
    if (risk === "HIGH") return "risk-high";
    if (risk === "MEDIUM") return "risk-medium";
    return "risk-low";
  };

  // ==========================================
  // MAIN UI
  // ==========================================

  return (
    <div className="supplier-intelligence">

      {/* HEADER */}

      <div className="supplier-header">

        <div>

          {/* BACK TO DASHBOARD BUTTON */}

          <button
            type="button"
            onClick={handleBack}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 16px",
              marginBottom: "20px",
              border: "1px solid #dbe2ea",
              borderRadius: "10px",
              background: "#ffffff",
              color: "#334155",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#f1f5f9";
              e.currentTarget.style.borderColor = "#94a3b8";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#ffffff";
              e.currentTarget.style.borderColor = "#dbe2ea";
            }}
          >
            ← Back to Dashboard
          </button>

          <div className="supplier-eyebrow">
            QUALITY ANALYTICS
          </div>

          <h1>
            Supplier Intelligence
          </h1>

          <p>
            Monitor supplier quality performance,
            identify risks, and make data-driven
            supplier decisions.
          </p>

        </div>

        <div className="supplier-header-actions">

          <button
            className="supplier-refresh-btn"
            onClick={refreshData}
          >
            ↻ Refresh
          </button>

          <button
            className="supplier-export-btn"
            onClick={exportCSV}
          >
            ↓ Export CSV
          </button>

        </div>

      </div>

      {/* KPI CARDS */}

      <div className="supplier-kpi-grid">

        <div className="supplier-kpi-card">

          <div className="supplier-kpi-top">
            <span>Total Suppliers</span>

            <div className="supplier-kpi-icon blue">
              🏭
            </div>
          </div>

          <h2>
            {totalSuppliers}
          </h2>

          <p>
            Identified from analyzed documents
          </p>

        </div>

        <div className="supplier-kpi-card">

          <div className="supplier-kpi-top">
            <span>Documents Analyzed</span>

            <div className="supplier-kpi-icon purple">
              📄
            </div>
          </div>

          <h2>
            {totalDocuments}
          </h2>

          <p>
            Total CoA documents processed
          </p>

        </div>

        <div className="supplier-kpi-card">

          <div className="supplier-kpi-top">
            <span>Average Pass Rate</span>

            <div className="supplier-kpi-icon green">
              ✓
            </div>
          </div>

          <h2>
            {averagePassRate}%
          </h2>

          <p>
            Across all detected suppliers
          </p>

        </div>

        <div className="supplier-kpi-card">

          <div className="supplier-kpi-top">
            <span>High Risk Suppliers</span>

            <div className="supplier-kpi-icon red">
              ⚠
            </div>
          </div>

          <h2>
            {highRiskSuppliers}
          </h2>

          <p>
            Suppliers requiring attention
          </p>

        </div>

      </div>

      {/* MAIN CONTENT */}

      <div className="supplier-main-grid">

        {/* SUPPLIER TABLE */}

        <div className="supplier-panel">

          <div className="supplier-panel-header">

            <div>
              <h2>
                Supplier Performance
              </h2>

              <p>
                Quality performance based on CoA analysis
              </p>
            </div>

          </div>

          <div className="supplier-search-row">

            <div className="supplier-search">

              <span>
                🔍
              </span>

              <input
                type="text"
                placeholder="Search supplier..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
              />

            </div>

            <span className="supplier-count">
              {filteredSuppliers.length} suppliers
            </span>

          </div>

          {filteredSuppliers.length === 0 ? (

            <div className="supplier-empty">

              <div>
                🏭
              </div>

              <h3>
                No suppliers found
              </h3>

              <p>
                Upload and analyze CoA documents to
                generate supplier intelligence.
              </p>

            </div>

          ) : (

            <div className="supplier-table-container">

              <table className="supplier-table">

                <thead>

                  <tr>
                    <th>Supplier</th>
                    <th>Documents</th>
                    <th>Pass Rate</th>
                    <th>Quality Status</th>
                    <th>Risk</th>
                    <th>Action</th>
                  </tr>

                </thead>

                <tbody>

                  {filteredSuppliers.map(
                    (supplier, index) => (

                      <tr key={index}>

                        <td>

                          <div className="supplier-name-cell">

                            <div className="supplier-avatar">
                              {supplier.name
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <div>

                              <strong>
                                {supplier.name}
                              </strong>

                              <small>
                                {supplier.documents} CoA document
                                {supplier.documents !== 1
                                  ? "s"
                                  : ""}
                              </small>

                            </div>

                          </div>

                        </td>

                        <td>
                          <strong>
                            {supplier.documents}
                          </strong>
                        </td>

                        <td>

                          <div className="supplier-passrate-cell">

                            <div className="supplier-progress">

                              <div
                                className="supplier-progress-fill"
                                style={{
                                  width: `${supplier.passRate}%`,
                                }}
                              />

                            </div>

                            <span>
                              {supplier.passRate}%
                            </span>

                          </div>

                        </td>

                        <td>

                          <div className="supplier-status-counts">

                            <span className="status-pass">
                              ✓ {supplier.pass}
                            </span>

                            <span className="status-fail">
                              ✕ {supplier.fail}
                            </span>

                            <span className="status-review">
                              ⚠ {supplier.review}
                            </span>

                          </div>

                        </td>

                        <td>

                          <span
                            className={`supplier-risk-badge ${getRiskClass(
                              supplier.risk
                            )}`}
                          >
                            {supplier.risk}
                          </span>

                        </td>

                        <td>

                          <button
                            className="supplier-view-btn"
                            onClick={() =>
                              setSelectedSupplier(supplier)
                            }
                          >
                            View Details →
                          </button>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

        </div>

        {/* RISK OVERVIEW */}

        <div className="supplier-risk-panel">

          <div className="supplier-panel-header">

            <div>

              <h2>
                Risk Overview
              </h2>

              <p>
                Supplier risk distribution
              </p>

            </div>

          </div>

          <div className="supplier-risk-list">

            <div className="supplier-risk-item">

              <div className="supplier-risk-item-left">

                <span className="risk-dot high"></span>

                <div>

                  <strong>
                    High Risk
                  </strong>

                  <small>
                    Failed quality parameters
                  </small>

                </div>

              </div>

              <strong className="risk-number high-text">
                {
                  suppliers.filter(
                    (s) => s.risk === "HIGH"
                  ).length
                }
              </strong>

            </div>

            <div className="supplier-risk-item">

              <div className="supplier-risk-item-left">

                <span className="risk-dot medium"></span>

                <div>

                  <strong>
                    Medium Risk
                  </strong>

                  <small>
                    Requires monitoring
                  </small>

                </div>

              </div>

              <strong className="risk-number medium-text">
                {
                  suppliers.filter(
                    (s) => s.risk === "MEDIUM"
                  ).length
                }
              </strong>

            </div>

            <div className="supplier-risk-item">

              <div className="supplier-risk-item-left">

                <span className="risk-dot low"></span>

                <div>

                  <strong>
                    Low Risk
                  </strong>

                  <small>
                    Consistent quality
                  </small>

                </div>

              </div>

              <strong className="risk-number low-text">
                {
                  suppliers.filter(
                    (s) => s.risk === "LOW"
                  ).length
                }
              </strong>

            </div>

          </div>

          <div className="supplier-risk-note">

            <span>
              💡
            </span>

            <div>

              <strong>
                Risk Assessment
              </strong>

              <p>
                Supplier risk is calculated from
                CoA pass rates, failed parameters,
                and documents requiring review.
              </p>

            </div>

          </div>

        </div>

      </div>

      {/* SUPPLIER DETAIL MODAL */}

      {selectedSupplier && (

        <div
          className="supplier-modal-overlay"
          onClick={() =>
            setSelectedSupplier(null)
          }
        >

          <div
            className="supplier-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="supplier-modal-header">

              <div>

                <div className="supplier-eyebrow">
                  SUPPLIER PROFILE
                </div>

                <h2>
                  {selectedSupplier.name}
                </h2>

              </div>

              <button
                className="supplier-modal-close"
                onClick={() =>
                  setSelectedSupplier(null)
                }
              >
                ×
              </button>

            </div>

            <div className="supplier-modal-stats">

              <div>

                <span>
                  Documents
                </span>

                <strong>
                  {selectedSupplier.documents}
                </strong>

              </div>

              <div>

                <span>
                  Pass Rate
                </span>

                <strong>
                  {selectedSupplier.passRate}%
                </strong>

              </div>

              <div>

                <span>
                  Risk Level
                </span>

                <strong
                  className={getRiskClass(
                    selectedSupplier.risk
                  )}
                >
                  {selectedSupplier.risk}
                </strong>

              </div>

            </div>

            <div className="supplier-modal-section">

              <h3>
                Quality Summary
              </h3>

              <div className="supplier-summary-grid">

                <div className="supplier-summary-item pass">

                  <span>
                    Passed
                  </span>

                  <strong>
                    {selectedSupplier.passedParameters}
                  </strong>

                </div>

                <div className="supplier-summary-item fail">

                  <span>
                    Failed
                  </span>

                  <strong>
                    {selectedSupplier.failedParameters}
                  </strong>

                </div>

                <div className="supplier-summary-item review">

                  <span>
                    Review
                  </span>

                  <strong>
                    {selectedSupplier.reviewParameters}
                  </strong>

                </div>

              </div>

            </div>

            <div className="supplier-modal-section">

              <h3>
                Analyzed Documents
              </h3>

              <div className="supplier-document-list">

                {selectedSupplier.records.map(
                  (record, index) => {

                    const result =
                      record?.result || record;

                    const fileName =
                      result?.fileName ||
                      record?.fileName ||
                      "CoA Document";

                    const status = getStatus(record);

                    return (

                      <div
                        className="supplier-document-row"
                        key={index}
                      >

                        <div className="supplier-document-icon">
                          📄
                        </div>

                        <div className="supplier-document-info">

                          <strong>
                            {fileName}
                          </strong>

                          <small>
                            {status}
                          </small>

                        </div>

                        <span
                          className={`supplier-risk-badge ${
                            status === "PASS"
                              ? "risk-low"
                              : status === "FAIL"
                              ? "risk-high"
                              : "risk-medium"
                          }`}
                        >
                          {status}
                        </span>

                      </div>

                    );
                  }
                )}

              </div>

            </div>

            <button
              className="supplier-modal-done"
              onClick={() =>
                setSelectedSupplier(null)
              }
            >
              Close
            </button>

          </div>

        </div>

      )}

    </div>
  );
}