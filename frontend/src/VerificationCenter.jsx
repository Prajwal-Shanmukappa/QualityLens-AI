import { useState } from "react";

export default function VerificationCenter({ onBack }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState("");

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];

    if (!selectedFile) return;

    if (selectedFile.type !== "application/pdf") {
      setError("Please upload a PDF file.");
      setFile(null);
      return;
    }

    setFile(selectedFile);
    setAnalysis(null);
    setError("");
  };

  const handleAnalyze = async () => {
    if (!file) {
      setError("Please select a CoA PDF first.");
      return;
    }

    setLoading(true);
    setError("");
    setAnalysis(null);

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

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Analysis failed");
      }

      setAnalysis(data);
    } catch (err) {
      setError(
        err.message ||
          "Backend connection failed. Please make sure Spring Boot is running."
      );
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "PASS":
        return "#16a34a";
      case "FAIL":
        return "#dc2626";
      default:
        return "#d97706";
    }
  };

  const getStatusBackground = (status) => {
    switch (status) {
      case "PASS":
        return "#dcfce7";
      case "FAIL":
        return "#fee2e2";
      default:
        return "#fef3c7";
    }
  };

  const parameters =
    analysis?.qualityAnalysis?.parameters || [];

  const overallStatus =
    analysis?.qualityAnalysis?.overallStatus || "REVIEW";

  return (
    <div className="vc-page">
      <style>{`
        * {
          box-sizing: border-box;
        }

        .vc-page {
          min-height: 100vh;
          background: #f5f7fb;
          color: #1e293b;
          padding: 30px;
          font-family: Arial, Helvetica, sans-serif;
        }

        .vc-header {
          max-width: 1200px;
          margin: 0 auto 30px;
        }

        .vc-back {
          border: none;
          background: transparent;
          color: #64748b;
          font-size: 15px;
          cursor: pointer;
          padding: 10px 0;
          margin-bottom: 25px;
        }

        .vc-back:hover {
          color: #6366f1;
        }

        .vc-title {
          text-align: center;
        }

        .vc-icon {
          font-size: 60px;
          margin-bottom: 10px;
        }

        .vc-title h1 {
          font-size: 36px;
          font-weight: 800;
          margin: 10px 0;
          color: #172033;
        }

        .vc-title p {
          font-size: 17px;
          color: #64748b;
        }

        .vc-content {
          max-width: 1200px;
          margin: 0 auto;
        }

        .vc-card {
          background: white;
          border-radius: 20px;
          padding: 30px;
          margin-bottom: 25px;
          box-shadow: 0 8px 25px rgba(15, 23, 42, 0.04);
        }

        .vc-upload-card h2 {
          font-size: 24px;
          margin: 0 0 10px;
        }

        .vc-description {
          color: #64748b;
          margin-bottom: 25px;
        }

        .vc-upload-area {
          border: 2px dashed #cbd5e1;
          border-radius: 16px;
          background: #f8fafc;
          padding: 45px 20px;
          text-align: center;
          transition: 0.2s;
        }

        .vc-upload-area:hover {
          border-color: #6366f1;
          background: #f5f3ff;
        }

        .vc-upload-icon {
          font-size: 55px;
          margin-bottom: 15px;
        }

        .vc-upload-area h3 {
          font-size: 18px;
          margin: 10px 0;
          word-break: break-word;
        }

        .vc-upload-area p {
          color: #64748b;
          margin-bottom: 20px;
        }

        .vc-file-input {
          display: none;
        }

        .vc-choose-file {
          display: inline-block;
          background: #6366f1;
          color: white;
          padding: 12px 25px;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          transition: 0.2s;
        }

        .vc-choose-file:hover {
          background: #4f46e5;
        }

        .vc-analyze-button {
          width: 100%;
          margin-top: 25px;
          padding: 17px;
          border: none;
          border-radius: 12px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          transition: 0.2s;
        }

        .vc-analyze-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(99, 102, 241, 0.25);
        }

        .vc-analyze-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .vc-error {
          background: #fee2e2;
          color: #991b1b;
          padding: 15px;
          border-radius: 12px;
          margin-top: 20px;
        }

        .vc-loading {
          text-align: center;
          padding: 30px;
          color: #6366f1;
          font-weight: 600;
        }

        .vc-results {
          margin-top: 30px;
        }

        .vc-results-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          background: white;
          padding: 25px;
          border-radius: 18px;
          margin-bottom: 25px;
          box-shadow: 0 5px 20px rgba(15, 23, 42, 0.04);
        }

        .vc-results-header h2 {
          margin: 0 0 8px;
          font-size: 25px;
        }

        .vc-results-header p {
          margin: 0;
          color: #64748b;
          word-break: break-word;
        }

        .vc-overall-status {
          padding: 12px 25px;
          border-radius: 30px;
          font-size: 18px;
          font-weight: 800;
          white-space: nowrap;
        }

        .vc-summary-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 18px;
          margin-bottom: 25px;
        }

        .vc-summary-card {
          background: white;
          padding: 25px;
          border-radius: 16px;
          text-align: center;
          box-shadow: 0 5px 20px rgba(15, 23, 42, 0.04);
        }

        .vc-summary-icon {
          font-size: 30px;
        }

        .vc-summary-card h3 {
          font-size: 32px;
          margin: 12px 0;
        }

        .vc-summary-card p {
          color: #64748b;
          margin: 0;
        }

        .vc-pass h3 {
          color: #16a34a;
        }

        .vc-fail h3 {
          color: #dc2626;
        }

        .vc-review h3 {
          color: #d97706;
        }

        .vc-section-title {
          font-size: 21px;
          font-weight: 700;
          margin: 0 0 25px;
        }

        .vc-info-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 25px;
        }

        .vc-info-item {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .vc-info-item label {
          font-size: 14px;
          color: #64748b;
        }

        .vc-info-item strong {
          font-size: 15px;
          word-break: break-word;
        }

        .vc-table-wrapper {
          overflow-x: auto;
        }

        .vc-table {
          width: 100%;
          min-width: 850px;
          border-collapse: collapse;
        }

        .vc-table th {
          background: #f8fafc;
          padding: 16px;
          text-align: left;
          font-size: 14px;
          color: #475569;
          border-bottom: 2px solid #e2e8f0;
        }

        .vc-table td {
          padding: 16px;
          border-bottom: 1px solid #e2e8f0;
          vertical-align: top;
          font-size: 14px;
        }

        .vc-table tr:hover {
          background: #fafafa;
        }

        .vc-status {
          display: inline-block;
          padding: 7px 13px;
          border-radius: 30px;
          font-size: 12px;
          font-weight: 800;
        }

        .vc-no-results {
          text-align: center;
          padding: 40px;
          color: #64748b;
        }

        .vc-extracted summary {
          cursor: pointer;
          font-weight: 700;
          font-size: 16px;
        }

        .vc-extracted pre {
          margin-top: 20px;
          background: #f8fafc;
          padding: 20px;
          border-radius: 12px;
          white-space: pre-wrap;
          word-break: break-word;
          max-height: 500px;
          overflow-y: auto;
          font-size: 13px;
          line-height: 1.6;
        }

        .vc-reset-button {
          padding: 14px 25px;
          background: #6366f1;
          color: white;
          border: none;
          border-radius: 10px;
          font-weight: 700;
          cursor: pointer;
          margin-bottom: 30px;
        }

        .vc-reset-button:hover {
          background: #4f46e5;
        }

        @media (max-width: 768px) {
          .vc-page {
            padding: 15px;
          }

          .vc-title h1 {
            font-size: 27px;
          }

          .vc-summary-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .vc-info-grid {
            grid-template-columns: 1fr;
          }

          .vc-results-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .vc-card {
            padding: 20px;
          }
        }

        @media (max-width: 480px) {
          .vc-summary-grid {
            grid-template-columns: 1fr 1fr;
            gap: 10px;
          }

          .vc-summary-card {
            padding: 18px 10px;
          }

          .vc-summary-card h3 {
            font-size: 25px;
          }
        }
      `}</style>

      {/* HEADER */}

      <div className="vc-header">
        <button className="vc-back" onClick={onBack}>
          ← Back to Dashboard
        </button>

        <div className="vc-title">
          <div className="vc-icon">🔍</div>

          <h1>Verification Center</h1>

          <p>
            Verify Certificate of Analysis documents against
            quality standards.
          </p>
        </div>
      </div>

      <div className="vc-content">
        {/* UPLOAD CARD */}

        <div className="vc-card vc-upload-card">
          <h2>Upload Certificate of Analysis</h2>

          <p className="vc-description">
            Upload your CoA PDF document for automated
            quality verification.
          </p>

          <div className="vc-upload-area">
            <div className="vc-upload-icon">📄</div>

            <h3>
              {file
                ? file.name
                : "Select your Certificate of Analysis"}
            </h3>

            <p>
              {file
                ? `${(file.size / 1024).toFixed(2)} KB`
                : "PDF documents only"}
            </p>

            <input
              type="file"
              accept="application/pdf"
              id="vc-file"
              className="vc-file-input"
              onChange={handleFileChange}
            />

            <label
              htmlFor="vc-file"
              className="vc-choose-file"
            >
              Choose PDF File
            </label>
          </div>

          {error && (
            <div className="vc-error">
              ⚠️ {error}
            </div>
          )}

          <button
            className="vc-analyze-button"
            onClick={handleAnalyze}
            disabled={!file || loading}
          >
            {loading
              ? "⏳ Analyzing CoA..."
              : "🔍 Analyze Document"}
          </button>
        </div>

        {/* LOADING */}

        {loading && (
          <div className="vc-card vc-loading">
            <div style={{ fontSize: "40px" }}>🤖</div>

            <h3>Analyzing your Certificate of Analysis</h3>

            <p>
              Extracting information and checking quality
              parameters...
            </p>
          </div>
        )}

        {/* RESULTS */}

        {analysis && (
          <div className="vc-results">
            {/* RESULT HEADER */}

            <div className="vc-results-header">
              <div>
                <h2>Verification Results</h2>
                <p>{analysis.fileName}</p>
              </div>

              <div
                className="vc-overall-status"
                style={{
                  background:
                    getStatusBackground(overallStatus),
                  color:
                    getStatusColor(overallStatus),
                }}
              >
                {overallStatus}
              </div>
            </div>

            {/* SUMMARY */}

            <div className="vc-summary-grid">
              <div className="vc-summary-card">
                <div className="vc-summary-icon">📊</div>

                <h3>
                  {analysis.qualityAnalysis.totalParameters || 0}
                </h3>

                <p>Total Parameters</p>
              </div>

              <div className="vc-summary-card vc-pass">
                <div className="vc-summary-icon">✅</div>

                <h3>
                  {analysis.qualityAnalysis.passCount || 0}
                </h3>

                <p>Passed</p>
              </div>

              <div className="vc-summary-card vc-fail">
                <div className="vc-summary-icon">❌</div>

                <h3>
                  {analysis.qualityAnalysis.failCount || 0}
                </h3>

                <p>Failed</p>
              </div>

              <div className="vc-summary-card vc-review">
                <div className="vc-summary-icon">⚠️</div>

                <h3>
                  {analysis.qualityAnalysis.reviewCount || 0}
                </h3>

                <p>Needs Review</p>
              </div>
            </div>

            {/* DOCUMENT INFORMATION */}

            <div className="vc-card">
              <h3 className="vc-section-title">
                📋 Document Information
              </h3>

              <div className="vc-info-grid">
                <div className="vc-info-item">
                  <label>File Name</label>
                  <strong>{analysis.fileName}</strong>
                </div>

                <div className="vc-info-item">
                  <label>Supplier</label>
                  <strong>
                    {analysis.supplier || "Not detected"}
                  </strong>
                </div>

                <div className="vc-info-item">
                  <label>Batch Number</label>
                  <strong>
                    {analysis.batchNumber || "Not detected"}
                  </strong>
                </div>

                <div className="vc-info-item">
                  <label>Number of Pages</label>
                  <strong>{analysis.pageCount}</strong>
                </div>
              </div>
            </div>

            {/* PARAMETER ANALYSIS */}

            <div className="vc-card">
              <h3 className="vc-section-title">
                🧪 Quality Parameter Analysis
              </h3>

              {parameters.length === 0 ? (
                <div className="vc-no-results">
                  No parameters were detected in this document.
                </div>
              ) : (
                <div className="vc-table-wrapper">
                  <table className="vc-table">
                    <thead>
                      <tr>
                        <th>Parameter</th>
                        <th>Specification</th>
                        <th>Actual Result</th>
                        <th>Status</th>
                        <th>Explanation</th>
                      </tr>
                    </thead>

                    <tbody>
                      {parameters.map((parameter, index) => (
                        <tr key={index}>
                          <td>
                            <strong>
                              {parameter.parameter}
                            </strong>
                          </td>

                          <td>
                            {parameter.specification}
                          </td>

                          <td>
                            {parameter.result}
                          </td>

                          <td>
                            <span
                              className="vc-status"
                              style={{
                                background:
                                  getStatusBackground(
                                    parameter.status
                                  ),
                                color:
                                  getStatusColor(
                                    parameter.status
                                  ),
                              }}
                            >
                              {parameter.status}
                            </span>
                          </td>

                          <td>
                            {parameter.explanation}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* EXTRACTED TEXT */}

            <div className="vc-card vc-extracted">
              <details>
                <summary>
                  📄 View Extracted PDF Text
                </summary>

                <pre>
                  {analysis.extractedText}
                </pre>
              </details>
            </div>

            {/* RESET */}

            <button
              className="vc-reset-button"
              onClick={() => {
                setFile(null);
                setAnalysis(null);
                setError("");
              }}
            >
              🔄 Analyze Another Document
            </button>
          </div>
        )}
      </div>
    </div>
  );
}