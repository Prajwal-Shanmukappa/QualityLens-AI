
import React, { useMemo, useState } from "react";
import "./Reports.css";

const readRecords = () => {
  try {
    return JSON.parse(localStorage.getItem("certiVerifyRecords") || "[]");
  } catch {
    return [];
  }
};

const getResult = (record) =>
  record?.result ||
  record?.analysis ||
  record?.qualityAnalysis ||
  record ||
  {};

const getAnalysis = (record) => {
  const result = getResult(record);
  return result.qualityAnalysis || result;
};

const getStatus = (record) => {
  const result = getResult(record);
  const analysis = getAnalysis(record);

  return String(
    analysis.overallStatus ||
      analysis.status ||
      result.status ||
      record.status ||
      "REVIEW"
  ).toUpperCase();
};

const getScore = (record) => {
  const result = getResult(record);
  const analysis = getAnalysis(record);

  return Number(
    analysis.qualityScore ??
      analysis.score ??
      result.qualityScore ??
      result.score ??
      record.qualityScore ??
      0
  );
};

const getSupplier = (record) => {
  const result = getResult(record);

  return (
    result.supplierName ||
    result.supplier ||
    record.supplierName ||
    record.supplier ||
    "Unknown Supplier"
  );
};

const getBatch = (record) => {
  const result = getResult(record);

  return (
    result.batchNumber ||
    result.batchNo ||
    result.batch ||
    record.batchNumber ||
    "N/A"
  );
};

const getFileName = (record, index) =>
  record.fileName ||
  record.filename ||
  record.documentName ||
  record.name ||
  `Document ${index + 1}`;

const getDate = (record) =>
  record.date ||
  record.analysisDate ||
  record.createdAt ||
  record.timestamp ||
  new Date().toISOString();

function Reports({ onBack, onNavigate }) {
  const [records, setRecords] = useState(readRecords);
  const [period, setPeriod] = useState("ALL");

  const refreshData = () => {
    setRecords(readRecords());
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (onNavigate) {
      onNavigate("dashboard");
    }
  };

  const filteredRecords = useMemo(() => {
    if (period === "ALL") return records;

    const now = new Date();
    const days = Number(period);
    const cutoff = new Date(now);
    cutoff.setDate(now.getDate() - days);

    return records.filter((record) => {
      const date = new Date(getDate(record));
      return !isNaN(date) && date >= cutoff;
    });
  }, [records, period]);

  const total = filteredRecords.length;

  const passed = filteredRecords.filter((record) =>
    getStatus(record).includes("PASS")
  ).length;

  const failed = filteredRecords.filter((record) =>
    getStatus(record).includes("FAIL")
  ).length;

  const review = filteredRecords.filter((record) =>
    getStatus(record).includes("REVIEW")
  ).length;

  const passRate = total > 0 ? Math.round((passed / total) * 100) : 0;

  const averageScore =
    total > 0
      ? Math.round(
          filteredRecords.reduce(
            (sum, record) => sum + getScore(record),
            0
          ) / total
        )
      : 0;

  const supplierStats = useMemo(() => {
    const map = {};

    filteredRecords.forEach((record) => {
      const supplier = getSupplier(record);
      const status = getStatus(record);
      const score = getScore(record);

      if (!map[supplier]) {
        map[supplier] = {
          name: supplier,
          total: 0,
          passed: 0,
          failed: 0,
          review: 0,
          scores: [],
        };
      }

      map[supplier].total++;
      map[supplier].scores.push(score);

      if (status.includes("PASS")) map[supplier].passed++;
      else if (status.includes("FAIL")) map[supplier].failed++;
      else map[supplier].review++;
    });

    return Object.values(map)
      .map((supplier) => ({
        ...supplier,
        averageScore:
          supplier.scores.length > 0
            ? Math.round(
                supplier.scores.reduce((a, b) => a + b, 0) /
                  supplier.scores.length
              )
            : 0,
        passRate:
          supplier.total > 0
            ? Math.round((supplier.passed / supplier.total) * 100)
            : 0,
      }))
      .sort((a, b) => b.total - a.total);
  }, [filteredRecords]);

  const scoreDistribution = [
    {
      label: "Excellent",
      range: "90–100",
      count: filteredRecords.filter((r) => getScore(r) >= 90).length,
      color: "#16a34a",
    },
    {
      label: "Good",
      range: "75–89",
      count: filteredRecords.filter(
        (r) => getScore(r) >= 75 && getScore(r) < 90
      ).length,
      color: "#2563eb",
    },
    {
      label: "Average",
      range: "60–74",
      count: filteredRecords.filter(
        (r) => getScore(r) >= 60 && getScore(r) < 75
      ).length,
      color: "#f59e0b",
    },
    {
      label: "Poor",
      range: "Below 60",
      count: filteredRecords.filter((r) => getScore(r) < 60).length,
      color: "#dc2626",
    },
  ];

  const maxDistribution = Math.max(
    ...scoreDistribution.map((item) => item.count),
    1
  );

  const recommendations = [];

  if (failed > 0) {
    recommendations.push({
      icon: "⚠️",
      title: "Review Failed Documents",
      description: `${failed} document(s) failed quality analysis. Investigate failed parameters before approving material.`,
      type: "danger",
    });
  }

  if (review > 0) {
    recommendations.push({
      icon: "🔍",
      title: "Manual Review Required",
      description: `${review} document(s) require additional verification or manual review.`,
      type: "warning",
    });
  }

  if (passRate >= 90 && total > 0) {
    recommendations.push({
      icon: "✓",
      title: "Strong Quality Performance",
      description: `Your current pass rate is ${passRate}%. Continue monitoring suppliers and maintaining quality standards.`,
      type: "success",
    });
  } else if (total > 0 && passRate < 70) {
    recommendations.push({
      icon: "📈",
      title: "Improve Quality Performance",
      description: `Your pass rate is ${passRate}%. Focus on identifying recurring failures and improving supplier quality controls.`,
      type: "warning",
    });
  }

  if (supplierStats.length > 0) {
    const worstSupplier = [...supplierStats].sort(
      (a, b) => a.passRate - b.passRate
    )[0];

    if (worstSupplier && worstSupplier.total >= 2) {
      recommendations.push({
        icon: "🏭",
        title: "Supplier Performance Monitoring",
        description: `${worstSupplier.name} has a ${worstSupplier.passRate}% pass rate across ${worstSupplier.total} documents. Consider additional supplier quality monitoring.`,
        type: "info",
      });
    }
  }

  if (total === 0) {
    recommendations.push({
      icon: "📄",
      title: "Start Your Quality Analytics",
      description:
        "Analyze your first Certificate of Analysis to generate quality trends, supplier performance insights, and reports.",
      type: "info",
    });
  }

  const exportCSV = () => {
    const rows = [
      [
        "Document",
        "Supplier",
        "Batch Number",
        "Quality Score",
        "Status",
        "Analysis Date",
      ],
      ...filteredRecords.map((record, index) => [
        getFileName(record, index),
        getSupplier(record),
        getBatch(record),
        getScore(record),
        getStatus(record),
        new Date(getDate(record)).toLocaleDateString(),
      ]),
    ];

    const csv = rows
      .map((row) =>
        row
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "QualityLens_Analytics_Report.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="reports-page">

      {/* HEADER */}

      <div className="reports-header">
        <div>
          <button
            className="reports-back-button"
            onClick={handleBack}
          >
            ← Back to Dashboard
          </button>

          <h1>Reports & Insights</h1>

          <p>
            Quality analytics, supplier performance, and
            document verification insights.
          </p>
        </div>

        <div className="reports-header-actions">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          >
            <option value="ALL">All Time</option>
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last 90 Days</option>
          </select>

          <button
            className="reports-refresh-button"
            onClick={refreshData}
          >
            ↻ Refresh
          </button>

          <button
            className="reports-export-button"
            onClick={exportCSV}
          >
            ↓ Export Report
          </button>
        </div>
      </div>

      {/* OVERVIEW CARDS */}

      <div className="reports-overview">

        <div className="reports-card">
          <div className="reports-card-top">
            <span>Total Documents</span>
            <div className="reports-icon blue">📄</div>
          </div>

          <h2>{total}</h2>

          <p>Documents analyzed</p>
        </div>

        <div className="reports-card">
          <div className="reports-card-top">
            <span>Pass Rate</span>
            <div className="reports-icon green">✓</div>
          </div>

          <h2>{passRate}%</h2>

          <p>{passed} documents passed</p>
        </div>

        <div className="reports-card">
          <div className="reports-card-top">
            <span>Average Quality</span>
            <div className="reports-icon purple">📊</div>
          </div>

          <h2>{averageScore}%</h2>

          <p>Average quality score</p>
        </div>

        <div className="reports-card">
          <div className="reports-card-top">
            <span>Failed Documents</span>
            <div className="reports-icon red">✕</div>
          </div>

          <h2>{failed}</h2>

          <p>Requires investigation</p>
        </div>
      </div>

      {/* STATUS OVERVIEW */}

      <div className="reports-section-grid">

        <div className="reports-panel">
          <div className="reports-panel-header">
            <div>
              <h3>Verification Overview</h3>
              <p>Document status distribution</p>
            </div>
          </div>

          <div className="reports-status-overview">

            <div className="reports-status-row">
              <div className="reports-status-label">
                <span className="status-dot green-dot"></span>
                <span>Passed</span>
              </div>

              <strong>{passed}</strong>

              <div className="reports-status-progress">
                <div
                  className="green-progress"
                  style={{
                    width: `${total ? (passed / total) * 100 : 0}%`,
                  }}
                />
              </div>

              <span>
                {total ? Math.round((passed / total) * 100) : 0}%
              </span>
            </div>

            <div className="reports-status-row">
              <div className="reports-status-label">
                <span className="status-dot red-dot"></span>
                <span>Failed</span>
              </div>

              <strong>{failed}</strong>

              <div className="reports-status-progress">
                <div
                  className="red-progress"
                  style={{
                    width: `${total ? (failed / total) * 100 : 0}%`,
                  }}
                />
              </div>

              <span>
                {total ? Math.round((failed / total) * 100) : 0}%
              </span>
            </div>

            <div className="reports-status-row">
              <div className="reports-status-label">
                <span className="status-dot yellow-dot"></span>
                <span>Review</span>
              </div>

              <strong>{review}</strong>

              <div className="reports-status-progress">
                <div
                  className="yellow-progress"
                  style={{
                    width: `${total ? (review / total) * 100 : 0}%`,
                  }}
                />
              </div>

              <span>
                {total ? Math.round((review / total) * 100) : 0}%
              </span>
            </div>

          </div>

          <div className="reports-total-summary">
            <div>
              <span>Overall Pass Rate</span>
              <strong>{passRate}%</strong>
            </div>

            <div className="reports-pass-rate-circle">
              <div
                style={{
                  background: `conic-gradient(#16a34a ${passRate * 3.6}deg, #e5e7eb 0deg)`,
                }}
              >
                <span>{passRate}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* QUALITY DISTRIBUTION */}

        <div className="reports-panel">
          <div className="reports-panel-header">
            <div>
              <h3>Quality Score Distribution</h3>
              <p>Documents grouped by quality score</p>
            </div>
          </div>

          <div className="reports-distribution">
            {scoreDistribution.map((item) => (
              <div
                className="reports-distribution-item"
                key={item.label}
              >
                <div className="reports-distribution-info">
                  <span>{item.label}</span>
                  <span>{item.range}</span>
                </div>

                <div className="reports-distribution-bar">
                  <div
                    style={{
                      width: `${(item.count / maxDistribution) * 100}%`,
                      background: item.color,
                    }}
                  />
                </div>

                <strong>{item.count}</strong>
              </div>
            ))}
          </div>

          <div className="reports-quality-footer">
            <span>Average Quality Score</span>
            <strong>{averageScore}%</strong>
          </div>
        </div>
      </div>

      {/* SUPPLIER ANALYTICS */}

      <div className="reports-panel reports-supplier-panel">

        <div className="reports-panel-header">
          <div>
            <h3>Supplier Performance</h3>
            <p>Quality performance based on analyzed documents</p>
          </div>

          <span className="reports-count-badge">
            {supplierStats.length} Suppliers
          </span>
        </div>

        {supplierStats.length === 0 ? (
          <div className="reports-empty">
            <div>🏭</div>
            <h3>No Supplier Data</h3>
            <p>Analyze documents to view supplier analytics.</p>
          </div>
        ) : (
          <div className="reports-table-wrapper">
            <table className="reports-table">
              <thead>
                <tr>
                  <th>SUPPLIER</th>
                  <th>DOCUMENTS</th>
                  <th>PASS</th>
                  <th>FAIL</th>
                  <th>REVIEW</th>
                  <th>PASS RATE</th>
                  <th>AVG QUALITY</th>
                </tr>
              </thead>

              <tbody>
                {supplierStats.map((supplier) => (
                  <tr key={supplier.name}>
                    <td>
                      <strong>{supplier.name}</strong>
                    </td>

                    <td>{supplier.total}</td>

                    <td className="report-green">
                      {supplier.passed}
                    </td>

                    <td className="report-red">
                      {supplier.failed}
                    </td>

                    <td className="report-yellow">
                      {supplier.review}
                    </td>

                    <td>
                      <div className="reports-table-progress">
                        <div className="reports-table-progress-bar">
                          <div
                            style={{
                              width: `${supplier.passRate}%`,
                            }}
                          />
                        </div>

                        <strong>{supplier.passRate}%</strong>
                      </div>
                    </td>

                    <td>
                      <strong>{supplier.averageScore}%</strong>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* RECENT DOCUMENTS */}

      <div className="reports-panel reports-recent-panel">

        <div className="reports-panel-header">
          <div>
            <h3>Recent Analysis</h3>
            <p>Latest analyzed documents</p>
          </div>

          <button
            className="reports-view-records"
            onClick={() => onNavigate?.("records")}
          >
            View All Records →
          </button>
        </div>

        {filteredRecords.length === 0 ? (
          <div className="reports-empty">
            <div>📄</div>
            <h3>No Analysis Data</h3>
            <p>
              Your analytics will appear here after analyzing
              Certificate of Analysis documents.
            </p>

            <button
              onClick={() => onNavigate?.("upload")}
            >
              Analyze Document
            </button>
          </div>
        ) : (
          <div className="reports-recent-list">
            {filteredRecords
              .slice()
              .reverse()
              .slice(0, 5)
              .map((record, index) => {
                const status = getStatus(record);
                const score = getScore(record);

                return (
                  <div
                    className="reports-recent-item"
                    key={record.id || index}
                  >
                    <div className="reports-recent-file">
                      <div className="reports-pdf-icon">
                        PDF
                      </div>

                      <div>
                        <strong>
                          {getFileName(record, index)}
                        </strong>

                        <span>
                          {getSupplier(record)} · Batch {getBatch(record)}
                        </span>
                      </div>
                    </div>

                    <div className="reports-recent-score">
                      <span>Quality</span>
                      <strong>{score}%</strong>
                    </div>

                    <span
                      className={`reports-status-badge ${
                        status.includes("PASS")
                          ? "pass"
                          : status.includes("FAIL")
                          ? "fail"
                          : "review"
                      }`}
                    >
                      {status.includes("PASS")
                        ? "✓ PASS"
                        : status.includes("FAIL")
                        ? "✕ FAIL"
                        : "⚠ REVIEW"}
                    </span>

                    <span className="reports-recent-date">
                      {new Date(getDate(record)).toLocaleDateString()}
                    </span>
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {/* INSIGHTS */}

      <div className="reports-insights-section">

        <div className="reports-insights-heading">
          <div>
            <h3>Quality Insights & Recommendations</h3>
            <p>Actionable insights based on your analysis data</p>
          </div>
        </div>

        <div className="reports-insights-grid">
          {recommendations.map((item, index) => (
            <div
              className={`reports-insight-card ${item.type}`}
              key={index}
            >
              <div className="reports-insight-icon">
                {item.icon}
              </div>

              <div>
                <h4>{item.title}</h4>
                <p>{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FOOTER */}

      <div className="reports-footer">
        <span>
          QualityLens AI Analytics
        </span>

        <span>
          Based on locally stored analysis records
        </span>
      </div>

    </div>
  );
}

export default Reports;
