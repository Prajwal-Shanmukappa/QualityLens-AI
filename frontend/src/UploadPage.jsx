import React, { useState } from "react";

export default function UploadPage({ onBack }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  // ==========================================
  // ANALYZE DOCUMENT
  // ==========================================

  const handleAnalyze = async () => {
    if (!file) {
      setError("Please select a PDF file.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(
        "http://https://qualitylens-ai.onrender.com/api/coa/analyze/api/coa/analyze",
        {
          method: "POST",
          body: formData,
        }
      );

      const responseData = await response.json();

      if (!response.ok || !responseData.success) {
        throw new Error(
          responseData.message || "Analysis failed."
        );
      }

      // ==========================================
      // EXTRACT ANALYSIS DATA
      // ==========================================

      const qualityAnalysis =
        responseData.qualityAnalysis || {};

      const overallStatus =
        responseData.overallStatus ||
        qualityAnalysis.overallStatus ||
        "REVIEW";

      const totalParameters =
        responseData.totalParameters ??
        qualityAnalysis.totalParameters ??
        0;

      const passCount =
        responseData.passCount ??
        qualityAnalysis.passCount ??
        0;

      const failCount =
        responseData.failCount ??
        qualityAnalysis.failCount ??
        0;

      const reviewCount =
        responseData.reviewCount ??
        qualityAnalysis.reviewCount ??
        0;

      // ==========================================
      // SAVE RECORD IN CORRECT STRUCTURE
      // ==========================================

      const newRecord = {
        id: Date.now(),

        filename: file.name,
        fileName: file.name,
        name: file.name,

        date: new Date().toLocaleString(),
        timestamp: new Date().toISOString(),

        overallStatus: overallStatus,
        status: overallStatus,

        totalParameters: totalParameters,
        passCount: passCount,
        failCount: failCount,
        reviewCount: reviewCount,

        supplier: responseData.supplier || "Not detected",
        batchNumber: responseData.batchNumber || "Not detected",

        qualityAnalysis: qualityAnalysis,

        parameters: qualityAnalysis.parameters || [],

        extractedText: responseData.extractedText || "",

        result: responseData,
      };

      // ==========================================
      // SAVE TO LOCAL STORAGE
      // ==========================================

      let existingRecords = [];

      try {
        existingRecords = JSON.parse(
          localStorage.getItem("certiVerifyRecords") || "[]"
        );
      } catch {
        existingRecords = [];
      }

      existingRecords.unshift(newRecord);

      localStorage.setItem(
        "certiVerifyRecords",
        JSON.stringify(existingRecords)
      );

      // ==========================================
      // DISPLAY RESULTS
      // ==========================================

      setResult({
        ...responseData,
        overallStatus,
        totalParameters,
        passCount,
        failCount,
        reviewCount,
        qualityAnalysis,
      });

    } catch (err) {
      console.error("Analysis error:", err);

      setError(
        err.message.includes("Failed to fetch")
          ? "Cannot connect to backend. Make sure Spring Boot is running on port 8080."
          : err.message
      );

    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // RESET
  // ==========================================

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setError("");
  };

  // ==========================================
  // DATA
  // ==========================================

  const analysis = result?.qualityAnalysis || {};
  const parameters = analysis.parameters || [];

  const status =
    result?.overallStatus ||
    analysis?.overallStatus ||
    "REVIEW";

  // ==========================================
  // STATUS COLORS
  // ==========================================

  const getStatusColor = (status) => {
    if (status === "PASS") return "#16a34a";
    if (status === "FAIL") return "#dc2626";
    return "#d97706";
  };

  const getStatusBackground = (status) => {
    if (status === "PASS") return "#dcfce7";
    if (status === "FAIL") return "#fee2e2";
    return "#fef3c7";
  };

  const getStatusIcon = (status) => {
    if (status === "PASS") return "✓";
    if (status === "FAIL") return "✕";
    return "⚠";
  };

  // ==========================================
  // MAIN UI
  // ==========================================

  return (
    <div className="module-page">

      {/* HEADER */}

      <div className="module-header">

        <button
          className="back-button"
          onClick={onBack}
        >
          ← Back to Dashboard
        </button>

        <div className="module-title">

          <h1>AI CoA Analysis</h1>

          <p>
            Upload and analyze Certificate of Analysis documents
          </p>

        </div>

      </div>

      <div className="upload-container">

        {/* ====================================== */}
        {/* UPLOAD SECTION */}
        {/* ====================================== */}

        {!result && (

          <>
            <h2>Upload Certificate of Analysis</h2>

            <p>
              Upload your CoA PDF document for intelligent
              extraction and analysis.
            </p>

            <div
              className="upload-box"
              style={{
                border: "2px dashed #cbd5e1",
                borderRadius: "20px",
                padding: "40px",
                textAlign: "center",
                background: "#f8fafc",
              }}
            >

              <div
                style={{
                  fontSize: "50px",
                  marginBottom: "15px",
                }}
              >
                📄
              </div>

              <h3>Select your CoA PDF</h3>

              <p>
                Supported format: PDF
              </p>

              <input
                type="file"
                accept=".pdf,application/pdf"
                onChange={(event) => {
                  const selectedFile =
                    event.target.files[0];

                  if (selectedFile) {

                    if (
                      selectedFile.type !== "application/pdf"
                    ) {
                      setError("Please select a valid PDF file.");
                      setFile(null);
                      return;
                    }

                    setFile(selectedFile);
                    setResult(null);
                    setError("");
                  }
                }}
              />

              {file && (

                <div
                  style={{
                    marginTop: "25px",
                    padding: "15px",
                    background: "#e0f2fe",
                    borderRadius: "12px",
                    color: "#0369a1",
                  }}
                >

                  <strong>
                    📄 {file.name}
                  </strong>

                  <p style={{ marginTop: "8px" }}>
                    Size: {(file.size / 1024).toFixed(2)} KB
                  </p>

                </div>

              )}

              <button
                className="primary-button"
                onClick={handleAnalyze}
                disabled={loading || !file}
                style={{
                  marginTop: "25px",
                  padding: "14px 30px",
                  opacity:
                    loading || !file ? 0.6 : 1,
                }}
              >

                {loading
                  ? "🤖 Analyzing Document..."
                  : "✨ Analyze with AI"}

              </button>

            </div>

          </>

        )}

        {/* ====================================== */}
        {/* ERROR */}
        {/* ====================================== */}

        {error && (

          <div
            style={{
              marginTop: "25px",
              padding: "18px",
              background: "#fee2e2",
              color: "#991b1b",
              borderRadius: "12px",
              border: "1px solid #fecaca",
            }}
          >
            ❌ {error}
          </div>

        )}

        {/* ====================================== */}
        {/* LOADING */}
        {/* ====================================== */}

        {loading && (

          <div
            style={{
              marginTop: "25px",
              padding: "25px",
              background: "#eff6ff",
              borderRadius: "15px",
              textAlign: "center",
              color: "#1d4ed8",
            }}
          >

            <h3>
              🤖 CertiVerify AI is analyzing your document
            </h3>

            <p>
              Extracting PDF information and checking
              quality parameters...
            </p>

          </div>

        )}

        {/* ====================================== */}
        {/* ANALYSIS RESULTS */}
        {/* ====================================== */}

        {result && (

          <div
            style={{
              marginTop: "30px",
              display: "flex",
              flexDirection: "column",
              gap: "25px",
            }}
          >

            {/* REPORT HEADER */}

            <div
              style={{
                background: "white",
                borderRadius: "20px",
                padding: "30px",
                boxShadow: "0 5px 20px rgba(0,0,0,0.06)",
                border: "1px solid #e2e8f0",
              }}
            >

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "15px",
                }}
              >

                <div>

                  <h2 style={{ margin: "0 0 10px 0" }}>
                    Analysis Report
                  </h2>

                  <p
                    style={{
                      color: "#64748b",
                      margin: 0,
                    }}
                  >
                    {result.fileName}
                  </p>

                </div>

                <div
                  style={{
                    background: getStatusBackground(status),
                    color: getStatusColor(status),
                    padding: "12px 25px",
                    borderRadius: "30px",
                    fontWeight: "bold",
                    fontSize: "16px",
                  }}
                >

                  {getStatusIcon(status)} {status}

                </div>

              </div>

              <div
                style={{
                  marginTop: "20px",
                  padding: "15px",
                  background: "#f8fafc",
                  borderRadius: "12px",
                }}
              >

                <p style={{ margin: 0 }}>
                  🤖 {result.message}
                </p>

              </div>

            </div>

            {/* STATISTICS */}

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(180px, 1fr))",
                gap: "15px",
              }}
            >

              {/* TOTAL */}

              <div
                style={{
                  padding: "25px",
                  background: "white",
                  borderRadius: "16px",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
                }}
              >

                <p style={{ color: "#64748b", margin: 0 }}>
                  Total Parameters
                </p>

                <h1 style={{ fontSize: "35px", margin: "10px 0" }}>
                  {result.totalParameters ?? 0}
                </h1>

                <p style={{ color: "#64748b", margin: 0 }}>
                  Analyzed
                </p>

              </div>

              {/* PASS */}

              <div
                style={{
                  padding: "25px",
                  background: "#f0fdf4",
                  borderRadius: "16px",
                  border: "1px solid #bbf7d0",
                }}
              >

                <p style={{ color: "#15803d", margin: 0 }}>
                  Passed
                </p>

                <h1
                  style={{
                    fontSize: "35px",
                    margin: "10px 0",
                    color: "#16a34a",
                  }}
                >
                  {result.passCount ?? 0}
                </h1>

                <p style={{ color: "#15803d", margin: 0 }}>
                  Parameters compliant
                </p>

              </div>

              {/* FAIL */}

              <div
                style={{
                  padding: "25px",
                  background: "#fef2f2",
                  borderRadius: "16px",
                  border: "1px solid #fecaca",
                }}
              >

                <p style={{ color: "#b91c1c", margin: 0 }}>
                  Failed
                </p>

                <h1
                  style={{
                    fontSize: "35px",
                    margin: "10px 0",
                    color: "#dc2626",
                  }}
                >
                  {result.failCount ?? 0}
                </h1>

                <p style={{ color: "#b91c1c", margin: 0 }}>
                  Parameters out of range
                </p>

              </div>

              {/* REVIEW */}

              <div
                style={{
                  padding: "25px",
                  background: "#fffbeb",
                  borderRadius: "16px",
                  border: "1px solid #fde68a",
                }}
              >

                <p style={{ color: "#b45309", margin: 0 }}>
                  Review
                </p>

                <h1
                  style={{
                    fontSize: "35px",
                    margin: "10px 0",
                    color: "#d97706",
                  }}
                >
                  {result.reviewCount ?? 0}
                </h1>

                <p style={{ color: "#b45309", margin: 0 }}>
                  Requires verification
                </p>

              </div>

            </div>

            {/* DOCUMENT INFORMATION */}

            <div
              style={{
                background: "white",
                padding: "25px",
                borderRadius: "18px",
                border: "1px solid #e2e8f0",
              }}
            >

              <h2>📋 Document Information</h2>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(250px, 1fr))",
                  gap: "20px",
                  marginTop: "20px",
                }}
              >

                <div>
                  <p style={{ color: "#64748b" }}>
                    File Name
                  </p>

                  <strong>{result.fileName}</strong>
                </div>

                <div>
                  <p style={{ color: "#64748b" }}>
                    Supplier
                  </p>

                  <strong>
                    {result.supplier || "Not detected"}
                  </strong>
                </div>

                <div>
                  <p style={{ color: "#64748b" }}>
                    Batch Number
                  </p>

                  <strong>
                    {result.batchNumber || "Not detected"}
                  </strong>
                </div>

                <div>
                  <p style={{ color: "#64748b" }}>
                    Pages
                  </p>

                  <strong>{result.pageCount || 0}</strong>
                </div>

                <div>
                  <p style={{ color: "#64748b" }}>
                    File Size
                  </p>

                  <strong>
                    {(result.fileSize / 1024).toFixed(2)} KB
                  </strong>
                </div>

                <div>
                  <p style={{ color: "#64748b" }}>
                    Analysis Date
                  </p>

                  <strong>
                    {new Date().toLocaleString()}
                  </strong>
                </div>

              </div>

            </div>

            {/* PARAMETER ANALYSIS */}

            <div
              style={{
                background: "white",
                padding: "25px",
                borderRadius: "18px",
                border: "1px solid #e2e8f0",
              }}
            >

              <h2>🔬 Parameter Analysis</h2>

              {parameters.length === 0 ? (

                <p>
                  No parameter analysis data was returned.
                </p>

              ) : (

                <div
                  style={{
                    overflowX: "auto",
                    marginTop: "20px",
                  }}
                >

                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      minWidth: "700px",
                    }}
                  >

                    <thead>

                      <tr style={{ background: "#f8fafc" }}>

                        <th style={tableHeaderStyle}>
                          Parameter
                        </th>

                        <th style={tableHeaderStyle}>
                          Specification
                        </th>

                        <th style={tableHeaderStyle}>
                          Result
                        </th>

                        <th style={tableHeaderStyle}>
                          Status
                        </th>

                      </tr>

                    </thead>

                    <tbody>

                      {parameters.map((parameter, index) => (

                        <tr key={index}>

                          <td style={tableCellStyle}>
                            <strong>
                              {parameter.parameter}
                            </strong>
                          </td>

                          <td style={tableCellStyle}>
                            {parameter.specification}
                          </td>

                          <td style={tableCellStyle}>
                            {parameter.result}
                          </td>

                          <td style={tableCellStyle}>

                            <span
                              style={{
                                background:
                                  getStatusBackground(parameter.status),

                                color:
                                  getStatusColor(parameter.status),

                                padding: "6px 14px",
                                borderRadius: "20px",
                                fontWeight: "bold",
                                fontSize: "13px",
                              }}
                            >
                              {getStatusIcon(parameter.status)}{" "}
                              {parameter.status}
                            </span>

                          </td>

                        </tr>

                      ))}

                    </tbody>

                  </table>

                </div>

              )}

            </div>

            {/* AI EXPLANATION */}

            <div
              style={{
                background: "white",
                padding: "25px",
                borderRadius: "18px",
                border: "1px solid #e2e8f0",
              }}
            >

              <h2>🤖 AI Analysis & Explanation</h2>

              <div style={{ marginTop: "20px" }}>

                {parameters.map((parameter, index) => (

                  <div
                    key={index}
                    style={{
                      padding: "20px",
                      marginBottom: "15px",
                      borderRadius: "14px",
                      background:
                        getStatusBackground(parameter.status),

                      borderLeft:
                        `5px solid ${getStatusColor(parameter.status)}`,
                    }}
                  >

                    <h3 style={{ marginTop: 0 }}>
                      {parameter.parameter}
                    </h3>

                    <p>
                      <strong>Status:</strong>{" "}
                      {parameter.status}
                    </p>

                    <p>
                      <strong>Specification:</strong>{" "}
                      {parameter.specification}
                    </p>

                    <p>
                      <strong>Result:</strong>{" "}
                      {parameter.result}
                    </p>

                    <p>
                      <strong>Explanation:</strong>{" "}
                      {parameter.explanation}
                    </p>

                  </div>

                ))}

              </div>

            </div>

            {/* EXTRACTED TEXT */}

            <div
              style={{
                background: "white",
                padding: "25px",
                borderRadius: "18px",
                border: "1px solid #e2e8f0",
              }}
            >

              <details>

                <summary
                  style={{
                    cursor: "pointer",
                    fontSize: "18px",
                    fontWeight: "bold",
                    padding: "10px",
                  }}
                >
                  📄 View Extracted PDF Text
                </summary>

                <div
                  style={{
                    marginTop: "20px",
                    padding: "20px",
                    background: "#f8fafc",
                    borderRadius: "12px",
                    whiteSpace: "pre-wrap",
                    lineHeight: "1.8",
                    fontSize: "14px",
                    color: "#334155",
                    maxHeight: "500px",
                    overflowY: "auto",
                  }}
                >
                  {result.extractedText}
                </div>

              </details>

            </div>

            {/* ACTION BUTTONS */}

            <div
              style={{
                display: "flex",
                gap: "15px",
                flexWrap: "wrap",
              }}
            >

              <button
                className="primary-button"
                onClick={handleReset}
              >
                📄 Analyze Another Document
              </button>

              <button
                className="back-button"
                onClick={onBack}
              >
                ← Back to Dashboard
              </button>

            </div>

          </div>

        )}

      </div>

    </div>
  );
}

// ==========================================
// TABLE STYLES
// ==========================================

const tableHeaderStyle = {
  textAlign: "left",
  padding: "15px",
  borderBottom: "2px solid #e2e8f0",
  color: "#475569",
};

const tableCellStyle = {
  padding: "15px",
  borderBottom: "1px solid #e2e8f0",
  color: "#334155",
};