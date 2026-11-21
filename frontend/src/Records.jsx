import React, { useEffect, useState } from "react";
import "./Records.css";

const STORAGE_KEY = "certiVerifyRecords";

const Records = ({ onBack, onNavigate }) => {
  const [records, setRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRecord, setSelectedRecord] = useState(null);

  // Load records from localStorage
  const loadRecords = () => {
    try {
      const savedRecords = localStorage.getItem(STORAGE_KEY);

      if (savedRecords) {
        const parsedRecords = JSON.parse(savedRecords);
        setRecords(Array.isArray(parsedRecords) ? parsedRecords : []);
      } else {
        setRecords([]);
      }
    } catch (error) {
      console.error("Error loading records:", error);
      setRecords([]);
    }
  };

  useEffect(() => {
    loadRecords();
  }, []);

  // Get record information safely
  const getRecordData = (record) => {
    return record?.result || record || {};
  };

  const getFileName = (record) => {
    return (
      record?.fileName ||
      record?.filename ||
      record?.originalFileName ||
      record?.name ||
      "Unknown Document"
    );
  };

  const getSupplier = (record) => {
    const data = getRecordData(record);

    return (
      data?.supplier ||
      data?.supplierName ||
      data?.manufacturer ||
      record?.supplier ||
      "Unknown Supplier"
    );
  };

  const getBatchNumber = (record) => {
    const data = getRecordData(record);

    return (
      data?.batchNumber ||
      data?.batchNo ||
      data?.batch ||
      record?.batchNumber ||
      "N/A"
    );
  };

  const getDate = (record) => {
    const dateValue =
      record?.date ||
      record?.createdAt ||
      record?.timestamp ||
      record?.uploadDate;

    if (!dateValue) return "Unknown Date";

    try {
      return new Date(dateValue).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "Unknown Date";
    }
  };

  const getQualityScore = (record) => {
    const data = getRecordData(record);

    const quality =
      data?.qualityAnalysis ||
      data?.quality ||
      data?.analysis ||
      record?.qualityAnalysis ||
      {};

    return (
      quality?.qualityScore ??
      quality?.score ??
      quality?.overallScore ??
      data?.qualityScore ??
      record?.qualityScore ??
      null
    );
  };

  const getStatus = (record) => {
    const data = getRecordData(record);

    const quality =
      data?.qualityAnalysis ||
      data?.quality ||
      data?.analysis ||
      {};

    const status =
      quality?.status ||
      quality?.result ||
      data?.status ||
      record?.status;

    if (status) {
      return String(status);
    }

    const score = getQualityScore(record);

    if (score !== null && score !== undefined) {
      if (Number(score) >= 80) return "Passed";
      if (Number(score) >= 50) return "Warning";
      return "Failed";
    }

    return "Analyzed";
  };

  // Statistics
  const totalRecords = records.length;

  const passedRecords = records.filter((record) => {
    const status = getStatus(record).toLowerCase();
    return status.includes("pass") || status.includes("approved");
  }).length;

  const warningRecords = records.filter((record) => {
    const status = getStatus(record).toLowerCase();
    return status.includes("warning") || status.includes("review");
  }).length;

  const failedRecords = records.filter((record) => {
    const status = getStatus(record).toLowerCase();
    return (
      status.includes("fail") ||
      status.includes("reject") ||
      status.includes("error")
    );
  }).length;

  // Search
  const filteredRecords = records.filter((record) => {
    const fileName = getFileName(record).toLowerCase();
    const supplier = getSupplier(record).toLowerCase();
    const batchNumber = getBatchNumber(record).toLowerCase();
    const status = getStatus(record).toLowerCase();

    const search = searchTerm.toLowerCase();

    return (
      fileName.includes(search) ||
      supplier.includes(search) ||
      batchNumber.includes(search) ||
      status.includes(search)
    );
  });

  // Delete individual record
  const deleteRecord = (recordToDelete) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${getFileName(recordToDelete)}"?`
    );

    if (!confirmed) return;

    const updatedRecords = records.filter(
      (record) => record !== recordToDelete
    );

    setRecords(updatedRecords);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedRecords));

    if (selectedRecord === recordToDelete) {
      setSelectedRecord(null);
    }
  };

  // Delete all records
  const deleteAllRecords = () => {
    if (records.length === 0) {
      alert("No records available to delete.");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete ALL ${records.length} records? This action cannot be undone.`
    );

    if (!confirmed) return;

    localStorage.removeItem(STORAGE_KEY);
    setRecords([]);
    setSelectedRecord(null);
    setSearchTerm("");
  };

  // View record details
  const viewRecord = (record) => {
    setSelectedRecord(record);
  };

  // Close modal
  const closeModal = () => {
    setSelectedRecord(null);
  };

  return (
    <div className="records-page">

      {/* Header */}
      <div className="records-header">
        <div className="records-header-left">
          <button className="records-back-btn" onClick={onBack}>
            ← Back to Dashboard
          </button>

          <div className="records-title-section">
            <h1>Analysis Records</h1>
            <p>Manage and review your previous CoA document analyses</p>
          </div>
        </div>

        <div className="records-header-actions">
          <button
            className="records-refresh-btn"
            onClick={loadRecords}
          >
            ↻ Refresh
          </button>

          {records.length > 0 && (
            <button
              className="records-delete-all-btn"
              onClick={deleteAllRecords}
            >
              🗑 Delete All
            </button>
          )}
        </div>
      </div>

      {/* Statistics */}
      <div className="records-stats">

        <div className="records-stat-card">
          <div className="records-stat-icon total-icon">📄</div>
          <div>
            <p>Total Records</p>
            <h2>{totalRecords}</h2>
          </div>
        </div>

        <div className="records-stat-card">
          <div className="records-stat-icon passed-icon">✓</div>
          <div>
            <p>Passed</p>
            <h2>{passedRecords}</h2>
          </div>
        </div>

        <div className="records-stat-card">
          <div className="records-stat-icon warning-icon">⚠</div>
          <div>
            <p>Warnings</p>
            <h2>{warningRecords}</h2>
          </div>
        </div>

        <div className="records-stat-card">
          <div className="records-stat-icon failed-icon">✕</div>
          <div>
            <p>Failed</p>
            <h2>{failedRecords}</h2>
          </div>
        </div>

      </div>

      {/* Search */}
      <div className="records-search-container">
        <div className="records-search-box">
          <span className="records-search-icon">🔍</span>

          <input
            type="text"
            placeholder="Search by document name, supplier, batch number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {searchTerm && (
            <button
              className="records-clear-search"
              onClick={() => setSearchTerm("")}
            >
              ✕
            </button>
          )}
        </div>

        <div className="records-result-count">
          Showing <strong>{filteredRecords.length}</strong> of{" "}
          <strong>{records.length}</strong> records
        </div>
      </div>

      {/* Records */}
      <div className="records-table-container">

        {filteredRecords.length === 0 ? (
          <div className="records-empty-state">

            <div className="records-empty-icon">
              📂
            </div>

            <h2>
              {records.length === 0
                ? "No Analysis Records Found"
                : "No Matching Records"}
            </h2>

            <p>
              {records.length === 0
                ? "Upload and analyze a Certificate of Analysis to see your records here."
                : "Try searching with a different keyword."}
            </p>

            {records.length === 0 && (
              <button
                className="records-upload-btn"
                onClick={() => onNavigate && onNavigate("upload")}
              >
                Upload CoA Document
              </button>
            )}

          </div>
        ) : (
          <div className="records-table-wrapper">

            <table className="records-table">

              <thead>
                <tr>
                  <th>DOCUMENT</th>
                  <th>SUPPLIER</th>
                  <th>BATCH NUMBER</th>
                  <th>DATE</th>
                  <th>QUALITY SCORE</th>
                  <th>STATUS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>

              <tbody>
                {filteredRecords.map((record, index) => {
                  const status = getStatus(record);
                  const score = getQualityScore(record);

                  const statusClass = status.toLowerCase().includes("pass")
                    ? "status-passed"
                    : status.toLowerCase().includes("warning")
                    ? "status-warning"
                    : status.toLowerCase().includes("fail")
                    ? "status-failed"
                    : "status-analyzed";

                  return (
                    <tr key={record.id || record._id || index}>

                      {/* Document */}
                      <td>
                        <div className="records-document-cell">
                          <div className="records-file-icon">
                            📄
                          </div>

                          <div className="records-document-info">
                            <span className="records-document-name">
                              {getFileName(record)}
                            </span>

                            <span className="records-document-type">
                              Certificate of Analysis
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Supplier */}
                      <td>
                        <span className="records-supplier">
                          {getSupplier(record)}
                        </span>
                      </td>

                      {/* Batch */}
                      <td>
                        <span className="records-batch-number">
                          {getBatchNumber(record)}
                        </span>
                      </td>

                      {/* Date */}
                      <td>
                        <span className="records-date">
                          {getDate(record)}
                        </span>
                      </td>

                      {/* Score */}
                      <td>
                        {score !== null && score !== undefined ? (
                          <div className="records-score">
                            <div className="records-score-bar">
                              <div
                                className="records-score-fill"
                                style={{
                                  width: `${Math.min(
                                    Math.max(Number(score), 0),
                                    100
                                  )}%`,
                                }}
                              />
                            </div>

                            <span>{score}%</span>
                          </div>
                        ) : (
                          <span className="records-no-score">N/A</span>
                        )}
                      </td>

                      {/* Status */}
                      <td>
                        <span className={`records-status ${statusClass}`}>
                          <span className="records-status-dot"></span>
                          {status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td>
                        <div className="records-actions">

                          <button
                            className="records-view-btn"
                            onClick={() => viewRecord(record)}
                            title="View record"
                          >
                            👁
                          </button>

                          <button
                            className="records-delete-btn"
                            onClick={() => deleteRecord(record)}
                            title="Delete record"
                          >
                            🗑
                          </button>

                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>

            </table>

          </div>
        )}

      </div>

      {/* Record Details Modal */}
      {selectedRecord && (
        <div
          className="records-modal-overlay"
          onClick={closeModal}
        >
          <div
            className="records-modal"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="records-modal-header">
              <div>
                <h2>Record Details</h2>
                <p>Analysis information</p>
              </div>

              <button
                className="records-modal-close"
                onClick={closeModal}
              >
                ✕
              </button>
            </div>

            <div className="records-modal-body">

              <div className="records-detail-item">
                <span>Document Name</span>
                <strong>{getFileName(selectedRecord)}</strong>
              </div>

              <div className="records-detail-item">
                <span>Supplier</span>
                <strong>{getSupplier(selectedRecord)}</strong>
              </div>

              <div className="records-detail-item">
                <span>Batch Number</span>
                <strong>{getBatchNumber(selectedRecord)}</strong>
              </div>

              <div className="records-detail-item">
                <span>Analysis Date</span>
                <strong>{getDate(selectedRecord)}</strong>
              </div>

              <div className="records-detail-item">
                <span>Quality Score</span>
                <strong>
                  {getQualityScore(selectedRecord) !== null
                    ? `${getQualityScore(selectedRecord)}%`
                    : "Not Available"}
                </strong>
              </div>

              <div className="records-detail-item">
                <span>Status</span>
                <strong>{getStatus(selectedRecord)}</strong>
              </div>

            </div>

            <div className="records-modal-footer">
              <button
                className="records-modal-delete"
                onClick={() => {
                  deleteRecord(selectedRecord);
                  closeModal();
                }}
              >
                🗑 Delete Record
              </button>

              <button
                className="records-modal-close-btn"
                onClick={closeModal}
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Records;