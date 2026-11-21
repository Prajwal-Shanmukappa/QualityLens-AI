import React, { useState, useEffect } from "react";
import "./BatchTrends.css";

export default function BatchTrends({ onNavigate }) {
  const [records, setRecords] = useState([]);

  // LOAD RECORDS
  const loadRecords = () => {
    try {
      const savedRecords =
        JSON.parse(localStorage.getItem("certiVerifyRecords")) || [];

      setRecords(savedRecords);
    } catch (error) {
      console.error("Unable to load records:", error);
      setRecords([]);
    }
  };

  useEffect(() => {
    loadRecords();
  }, []);

  // GET RESULT OBJECT
  const getResult = (record) => {
    return record?.result || record || {};
  };

  // GET QUALITY ANALYSIS
  const getAnalysis = (record) => {
    const result = getResult(record);

    return (
      result.qualityAnalysis ||
      record.qualityAnalysis ||
      {}
    );
  };

  // FILE NAME
  const getFileName = (record) => {
    const result = getResult(record);

    return (
      record.fileName ||
      result.fileName ||
      record.name ||
      "Unknown Document"
    );
  };

  // EXTRACT CLEAN INFORMATION
  const findValue = (text, labels) => {
    if (!text) return "Not detected";

    const lines = String(text).split(/\r?\n/);

    for (const line of lines) {
      for (const label of labels) {
        const regex = new RegExp(
          `${label}\\s*[:\\-]?\\s*(.+)`,
          "i"
        );

        const match = line.match(regex);

        if (match && match[1]) {
          const value = match[1].trim();

          if (value.length > 100) {
            return value.substring(0, 100) + "...";
          }

          return value;
        }
      }
    }

    return "Not detected";
  };

  // BATCH NUMBER
  const getBatchNumber = (record) => {
    const result = getResult(record);

    const directValue =
      record.batchNumber ||
      result.batchNumber ||
      record.batch ||
      result.batch;

    if (directValue) {
      return String(directValue).substring(0, 100);
    }

    const extractedText =
      result.extractedText ||
      record.extractedText ||
      "";

    return findValue(extractedText, [
      "Batch Number",
      "Batch No",
      "Batch",
      "Lot Number",
      "Lot No",
    ]);
  };

  // SUPPLIER
  const getSupplier = (record) => {
    const result = getResult(record);

    const directValue =
      record.supplier ||
      result.supplier ||
      record.manufacturer ||
      result.manufacturer;

    if (directValue) {
      return String(directValue).substring(0, 100);
    }

    const extractedText =
      result.extractedText ||
      record.extractedText ||
      "";

    return findValue(extractedText, [
      "Supplier",
      "Manufacturer",
      "Company Name",
    ]);
  };

  // STATUS
  const getStatus = (record) => {
    const analysis = getAnalysis(record);

    const status =
      analysis.overallStatus ||
      record.overallStatus ||
      record.status ||
      "REVIEW";

    return String(status).toUpperCase();
  };

  // DATE
  const getDate = (record) => {
    const value =
      record.date ||
      record.timestamp ||
      record.createdAt ||
      record.uploadDate;

    if (!value) return "N/A";

    try {
      return new Date(value).toLocaleString();
    } catch {
      return String(value);
    }
  };

  // STATISTICS
  const total = records.length;

  const passed = records.filter(
    (record) => getStatus(record) === "PASS"
  ).length;

  const failed = records.filter(
    (record) => getStatus(record) === "FAIL"
  ).length;

  const review = records.filter(
    (record) =>
      getStatus(record) === "REVIEW" ||
      getStatus(record) === "WARNING"
  ).length;

  const passRate =
    total === 0
      ? 0
      : Math.round((passed / total) * 100);

  // REFRESH
  const handleRefresh = () => {
    loadRecords();
  };

  // EXPORT CSV
  const handleExport = () => {
    if (records.length === 0) {
      alert("No records available to export.");
      return;
    }

    const headers = [
      "Document",
      "Batch Number",
      "Supplier",
      "Status",
      "Date",
    ];

    const rows = records.map((record) => [
      getFileName(record),
      getBatchNumber(record),
      getSupplier(record),
      getStatus(record),
      getDate(record),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row
          .map((value) => {
            return `"${String(value).replace(/"/g, '""')}"`;
          })
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = "Batch_Trends_Report.csv";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  // NAVIGATION
  const handleBack = () => {
    console.log("Batch Trends: Returning to Dashboard");

    if (typeof onNavigate === "function") {
      onNavigate("dashboard");
    } else {
      window.location.href = "/";
    }
  };

  const handleUpload = () => {
    if (typeof onNavigate === "function") {
      onNavigate("upload");
    }
  };

  return (
    <div className="batch-trends-page">

      {/* PAGE HEADER */}

      <div className="batch-header">

        <button
          type="button"
          className="batch-back-button"
          onClick={handleBack}
        >
          ← Back to Dashboard
        </button>

        <div className="batch-title-section">
          <h1>📈 Batch Trends</h1>

          <p>
            Monitor batch quality performance and identify
            trends across analyzed Certificates of Analysis.
          </p>
        </div>
      </div>

      {/* ACTION BUTTONS */}

      <div className="batch-actions">

        <button
          type="button"
          className="batch-refresh-button"
          onClick={handleRefresh}
        >
          🔄 Refresh
        </button>

        <button
          type="button"
          className="batch-export-button"
          onClick={handleExport}
        >
          📥 Export CSV
        </button>

      </div>

      {/* STATISTICS */}

      <div className="batch-stats-grid">

        <div className="batch-stat-card">
          <div className="batch-stat-icon">📦</div>

          <div className="batch-stat-content">
            <p>Total Batches</p>
            <h2>{total}</h2>
            <span>Analyzed documents</span>
          </div>
        </div>

        <div className="batch-stat-card">
          <div className="batch-stat-icon success-icon">✅</div>

          <div className="batch-stat-content">
            <p>Passed Batches</p>
            <h2>{passed}</h2>
            <span>Quality compliant</span>
          </div>
        </div>

        <div className="batch-stat-card">
          <div className="batch-stat-icon danger-icon">❌</div>

          <div className="batch-stat-content">
            <p>Failed Batches</p>
            <h2>{failed}</h2>
            <span>Quality failures</span>
          </div>
        </div>

        <div className="batch-stat-card">
          <div className="batch-stat-icon warning-icon">⚠️</div>

          <div className="batch-stat-content">
            <p>Review Required</p>
            <h2>{review}</h2>
            <span>Needs investigation</span>
          </div>
        </div>

      </div>

      {/* PASS RATE */}

      <div className="batch-pass-rate-card">

        <div className="batch-pass-rate-header">
          <div>
            <h2>Overall Quality Pass Rate</h2>

            <p>
              Percentage of batches meeting quality requirements
            </p>
          </div>

          <h1>{passRate}%</h1>
        </div>

        <div className="batch-progress-container">
          <div
            className="batch-progress-bar"
            style={{ width: `${passRate}%` }}
          />
        </div>

      </div>

      {/* QUALITY CHART */}

      <div className="batch-chart-card">

        <div className="batch-chart-header">
          <h2>Batch Quality Overview</h2>
          <p>Distribution of analyzed batch results</p>
        </div>

        <div className="batch-chart-bars">

          <div className="batch-chart-column">
            <div
              className="batch-chart-bar pass-bar"
              style={{
                height: `${total > 0 ? (passed / total) * 100 : 0}%`,
              }}
            >
              {passed}
            </div>

            <span>PASS</span>
          </div>

          <div className="batch-chart-column">
            <div
              className="batch-chart-bar fail-bar"
              style={{
                height: `${total > 0 ? (failed / total) * 100 : 0}%`,
              }}
            >
              {failed}
            </div>

            <span>FAIL</span>
          </div>

          <div className="batch-chart-column">
            <div
              className="batch-chart-bar review-bar"
              style={{
                height: `${total > 0 ? (review / total) * 100 : 0}%`,
              }}
            >
              {review}
            </div>

            <span>REVIEW</span>
          </div>

        </div>

      </div>

      {/* RECORDS TABLE */}

      <div className="batch-records-card">

        <div className="batch-records-header">
          <div>
            <h2>Analyzed Batch Records</h2>
            <p>All previously analyzed documents</p>
          </div>

          <span className="batch-record-count">
            {records.length} records
          </span>
        </div>

        {records.length === 0 ? (
          <div className="batch-empty-state">

            <div className="batch-empty-icon">📄</div>

            <h3>No batch records found</h3>

            <p>
              Analyze Certificate of Analysis documents
              to view batch trends here.
            </p>

            <button
              type="button"
              className="batch-upload-button"
              onClick={handleUpload}
            >
              Upload CoA
            </button>

          </div>
        ) : (
          <div className="batch-table-wrapper">

            <table className="batch-table">

              <thead>
                <tr>
                  <th>Document</th>
                  <th>Batch Number</th>
                  <th>Supplier</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>

              <tbody>
                {records.map((record, index) => {
                  const status = getStatus(record);

                  return (
                    <tr key={index}>

                      <td className="batch-document-cell">
                        {getFileName(record)}
                      </td>

                      <td>
                        {getBatchNumber(record)}
                      </td>

                      <td>
                        {getSupplier(record)}
                      </td>

                      <td>
                        <span
                          className={`batch-status ${status.toLowerCase()}`}
                        >
                          {status}
                        </span>
                      </td>

                      <td>
                        {getDate(record)}
                      </td>

                    </tr>
                  );
                })}
              </tbody>

            </table>

          </div>
        )}

      </div>

    </div>
  );
}