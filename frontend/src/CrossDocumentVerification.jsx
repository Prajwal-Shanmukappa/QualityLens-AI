import React, { useState } from "react";
import { crossVerifyDocuments } from "./api";
import "./CrossDocumentVerification.css";

function CrossDocumentVerification({ onBack, onNavigate }) {
  const [coaFile, setCoaFile] = useState(null);
  const [purchaseOrderFile, setPurchaseOrderFile] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  // BACK TO DASHBOARD
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

  // FILE VALIDATION
  const handleFileChange = (event, type) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const isPDF =
      file.type === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf");

    if (!isPDF) {
      setError("Please upload PDF files only.");
      event.target.value = "";
      return;
    }

    if (type === "coa") {
      setCoaFile(file);
    } else {
      setPurchaseOrderFile(file);
    }

    setError("");
    setResult(null);
  };

  // REMOVE FILE
  const removeFile = (type) => {
    if (type === "coa") {
      setCoaFile(null);
    } else {
      setPurchaseOrderFile(null);
    }

    setResult(null);
    setError("");
  };

  // VERIFY DOCUMENTS
  const handleVerify = async () => {
    if (!coaFile || !purchaseOrderFile) {
      setError(
        "Please upload both the CoA and Purchase Order PDF files."
      );
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      // API CALL THROUGH api.js
      const data = await crossVerifyDocuments(
        coaFile,
        purchaseOrderFile
      );

      if (data.success === false) {
        throw new Error(
          data.message || "Document verification failed."
        );
      }

      setResult(data);

    } catch (err) {
      console.error(
        "Cross-document verification error:",
        err
      );

      setError(
        err.message ||
        "Failed to connect to the backend."
      );

    } finally {
      setLoading(false);
    }
  };

  // RESET
  const handleReset = () => {
    setCoaFile(null);
    setPurchaseOrderFile(null);
    setResult(null);
    setError("");
  };

  // STATUS COLORS
  const getStatusColor = (status) => {
    const normalized = String(status || "").toUpperCase();

    if (
      ["MATCH", "PASS", "VERIFIED", "SUCCESS"].includes(normalized)
    ) {
      return "#16a34a";
    }

    if (
      ["MISMATCH", "FAIL", "FAILED"].includes(normalized)
    ) {
      return "#dc2626";
    }

    return "#d97706";
  };

  const getStatusBackground = (status) => {
    const normalized = String(status || "").toUpperCase();

    if (
      ["MATCH", "PASS", "VERIFIED", "SUCCESS"].includes(normalized)
    ) {
      return "#dcfce7";
    }

    if (
      ["MISMATCH", "FAIL", "FAILED"].includes(normalized)
    ) {
      return "#fee2e2";
    }

    return "#fef3c7";
  };

  // RESULT HELPERS
  const getOverallStatus = () => {
    return (
      result?.overallStatus ||
      result?.status ||
      result?.verificationStatus ||
      "REVIEW"
    );
  };

  const getComparisons = () => {
    return (
      result?.comparisons ||
      result?.comparisonResults ||
      result?.results ||
      result?.fields ||
      result?.details ||
      []
    );
  };

  const getMatchCount = () => {
    return (
      result?.matchCount ??
      result?.matchedFields ??
      result?.matches ??
      0
    );
  };

  const getMismatchCount = () => {
    return (
      result?.mismatchCount ??
      result?.mismatchedFields ??
      result?.mismatches ??
      0
    );
  };

  const getReviewCount = () => {
    return (
      result?.reviewCount ??
      result?.reviewFields ??
      result?.reviews ??
      0
    );
  };

  const getMatchPercentage = () => {
    if (result?.matchPercentage !== undefined) {
      return Number(result.matchPercentage);
    }

    const comparisons = getComparisons();

    if (!Array.isArray(comparisons) || comparisons.length === 0) {
      return 0;
    }

    const matches = comparisons.filter((item) => {
      const status = String(item.status || "").toUpperCase();

      return ["MATCH", "PASS", "VERIFIED"].includes(status);
    }).length;

    return Math.round(
      (matches / comparisons.length) * 100
    );
  };

  const getFieldName = (item) => {
    return (
      item.field ||
      item.parameter ||
      item.name ||
      item.label ||
      item.key ||
      "Unknown Field"
    );
  };

  const getCoaValue = (item) => {
    return (
      item.coaValue ??
      item.coaResult ??
      item.coa ??
      item.firstDocumentValue ??
      item.value1 ??
      item.document1Value ??
      "Not available"
    );
  };

  const getPoValue = (item) => {
    return (
      item.purchaseOrderValue ??
      item.poValue ??
      item.purchaseOrder ??
      item.secondDocumentValue ??
      item.value2 ??
      item.document2Value ??
      "Not available"
    );
  };

  const getFieldStatus = (item) => {
    return (
      item.status ||
      item.result ||
      item.matchStatus ||
      item.verificationStatus ||
      "REVIEW"
    );
  };

  // FILE SIZE
  const formatFileSize = (size) => {
    if (!size) return "0 KB";

    if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(1)} KB`;
    }

    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="cross-document-page">

      {/* HEADER */}

      <div className="cross-document-header">

        <button
          type="button"
          className="back-button"
          onClick={handleBack}
        >
          ← Back to Dashboard
        </button>

        <div className="cross-document-title">

          <div className="cross-document-icon">
            📑
          </div>

          <h1>Cross-Document Verification</h1>

          <p>
            Compare your Certificate of Analysis with your
            Purchase Order to identify discrepancies and
            verify document consistency.
          </p>

        </div>

      </div>

      {/* MAIN CONTAINER */}

      <div className="cross-document-container">

        {/* UPLOAD CARD */}

        <div className="cross-document-card">

          <div className="section-heading">
            <h2>Upload Documents</h2>

            <p>
              Upload both documents to begin automated verification.
            </p>
          </div>

          <div className="document-upload-grid">

            {/* COA UPLOAD */}

            <div className="document-upload-card">

              <div className="document-upload-heading">

                <div className="document-icon">
                  📄
                </div>

                <div>
                  <h3>Certificate of Analysis</h3>

                  <p>
                    Upload the manufacturer's CoA
                  </p>
                </div>

              </div>

              <label className="document-upload-box">

                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  hidden
                  onChange={(event) =>
                    handleFileChange(event, "coa")
                  }
                />

                {coaFile ? (
                  <div className="file-selected">

                    <div className="file-check">
                      ✓
                    </div>

                    <h4>{coaFile.name}</h4>

                    <p>File selected successfully</p>

                    <span>
                      PDF • {formatFileSize(coaFile.size)}
                    </span>

                  </div>
                ) : (
                  <div className="upload-placeholder">

                    <div className="upload-icon">
                      📤
                    </div>

                    <h4>Click to upload CoA</h4>

                    <p>
                      Select your Certificate of Analysis PDF
                    </p>

                    <span>PDF files only</span>

                  </div>
                )}

              </label>

              {coaFile && (
                <button
                  type="button"
                  className="remove-file-button"
                  onClick={() => removeFile("coa")}
                >
                  Remove file
                </button>
              )}

            </div>

            {/* PURCHASE ORDER */}

            <div className="document-upload-card">

              <div className="document-upload-heading">

                <div className="document-icon">
                  🛒
                </div>

                <div>
                  <h3>Purchase Order</h3>

                  <p>
                    Upload the purchase order document
                  </p>
                </div>

              </div>

              <label className="document-upload-box">

                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  hidden
                  onChange={(event) =>
                    handleFileChange(event, "purchaseOrder")
                  }
                />

                {purchaseOrderFile ? (
                  <div className="file-selected">

                    <div className="file-check">
                      ✓
                    </div>

                    <h4>{purchaseOrderFile.name}</h4>

                    <p>File selected successfully</p>

                    <span>
                      PDF • {formatFileSize(purchaseOrderFile.size)}
                    </span>

                  </div>
                ) : (
                  <div className="upload-placeholder">

                    <div className="upload-icon">
                      📤
                    </div>

                    <h4>
                      Click to upload Purchase Order
                    </h4>

                    <p>
                      Select your Purchase Order PDF
                    </p>

                    <span>PDF files only</span>

                  </div>
                )}

              </label>

              {purchaseOrderFile && (
                <button
                  type="button"
                  className="remove-file-button"
                  onClick={() => removeFile("purchaseOrder")}
                >
                  Remove file
                </button>
              )}

            </div>

          </div>

          {/* ERROR */}

          {error && (
            <div className="verification-error">

              <span>⚠️</span>

              <p>{error}</p>

            </div>
          )}

          {/* ACTIONS */}

          <div className="verification-actions">

            <button
              type="button"
              className="verify-documents-button"
              onClick={handleVerify}
              disabled={
                loading ||
                !coaFile ||
                !purchaseOrderFile
              }
            >

              {loading ? (
                <>
                  <span className="loading-spinner"></span>
                  Verifying Documents...
                </>
              ) : (
                <>
                  🔍 Verify Documents
                </>
              )}

            </button>

            <button
              type="button"
              className="reset-button"
              onClick={handleReset}
              disabled={loading}
            >
              Reset
            </button>

          </div>

        </div>

        {/* RESULTS */}

        {result && (
          <div className="verification-results">

            {/* RESULT HEADER */}

            <div className="result-header">

              <div>
                <h2>Verification Results</h2>

                <p>
                  Cross-document analysis completed successfully.
                </p>
              </div>

              <div
                className="overall-status-badge"
                style={{
                  color: getStatusColor(getOverallStatus()),
                  background:
                    getStatusBackground(getOverallStatus()),
                }}
              >
                {getOverallStatus()}
              </div>

            </div>

            {/* SUMMARY */}

            <div className="result-summary-grid">

              <div className="summary-card">

                <div className="summary-card-icon">
                  📊
                </div>

                <div>
                  <p>Match Percentage</p>

                  <h2>
                    {getMatchPercentage()}%
                  </h2>
                </div>

              </div>

              <div className="summary-card">

                <div className="summary-card-icon match-icon">
                  ✅
                </div>

                <div>
                  <p>Matched Fields</p>

                  <h2>
                    {getMatchCount()}
                  </h2>
                </div>

              </div>

              <div className="summary-card">

                <div className="summary-card-icon mismatch-icon">
                  ❌
                </div>

                <div>
                  <p>Mismatched Fields</p>

                  <h2>
                    {getMismatchCount()}
                  </h2>
                </div>

              </div>

              <div className="summary-card">

                <div className="summary-card-icon review-icon">
                  ⚠️
                </div>

                <div>
                  <p>Review Required</p>

                  <h2>
                    {getReviewCount()}
                  </h2>
                </div>

              </div>

            </div>

            {/* PROGRESS */}

            <div className="match-progress-card">

              <div className="progress-heading">

                <span>Document Consistency</span>

                <strong>
                  {getMatchPercentage()}%
                </strong>

              </div>

              <div className="progress-track">

                <div
                  className="progress-fill"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.max(0, getMatchPercentage())
                    )}%`,
                  }}
                />

              </div>

            </div>

            {/* COMPARISON */}

            <div className="comparison-section">

              <h2>Field-by-Field Comparison</h2>

              {Array.isArray(getComparisons()) &&
              getComparisons().length > 0 ? (
                <div className="comparison-table-wrapper">

                  <table className="comparison-table">

                    <thead>
                      <tr>
                        <th>Field</th>
                        <th>Certificate of Analysis</th>
                        <th>Purchase Order</th>
                        <th>Status</th>
                      </tr>
                    </thead>

                    <tbody>
                      {getComparisons().map((item, index) => {
                        const status = getFieldStatus(item);

                        return (
                          <tr key={index}>

                            <td>
                              <strong>
                                {getFieldName(item)}
                              </strong>
                            </td>

                            <td>
                              {String(getCoaValue(item))}
                            </td>

                            <td>
                              {String(getPoValue(item))}
                            </td>

                            <td>
                              <span
                                className="comparison-status"
                                style={{
                                  color: getStatusColor(status),
                                  background:
                                    getStatusBackground(status),
                                }}
                              >
                                {status}
                              </span>
                            </td>

                          </tr>
                        );
                      })}
                    </tbody>

                  </table>

                </div>
              ) : (
                <div className="no-comparison-results">

                  <p>
                    Verification completed, but the backend
                    did not return comparison fields.
                  </p>

                  <pre>
                    {JSON.stringify(result, null, 2)}
                  </pre>

                </div>
              )}

            </div>

            {/* AI RECOMMENDATION */}

            {result.recommendation && (
              <div className="recommendation-card">

                <div className="recommendation-icon">
                  💡
                </div>

                <div>
                  <h3>AI Recommendation</h3>

                  <p>
                    {result.recommendation}
                  </p>
                </div>

              </div>
            )}

            {/* TECHNICAL RESPONSE */}

            <details className="raw-response-details">

              <summary>
                View Technical Response
              </summary>

              <pre>
                {JSON.stringify(result, null, 2)}
              </pre>

            </details>

          </div>
        )}

      </div>

    </div>
  );
}

export default CrossDocumentVerification;