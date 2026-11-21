import React, { useMemo, useState } from "react";
import "./RiskPrediction.css";

export default function RiskPrediction({ onBack, onNavigate }) {
  const [records, setRecords] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem("certiVerifyRecords") || "[]"
      );
    } catch {
      return [];
    }
  });

  const [selectedCategory, setSelectedCategory] =
    useState("all");

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
  // HELPERS
  // ==========================================

  const getAnalysis = (record) =>
    record?.result?.qualityAnalysis ||
    record?.qualityAnalysis ||
    record?.result?.analysis ||
    {};

  const getResult = (record) =>
    record?.result || record || {};

  const getStatus = (record) => {
    const analysis = getAnalysis(record);
    const result = getResult(record);

    return (
      analysis?.overallStatus ||
      result?.overallStatus ||
      result?.status ||
      "REVIEW"
    ).toUpperCase();
  };

  const getSupplier = (record) => {
    const result = getResult(record);

    return (
      result?.supplier ||
      result?.supplierName ||
      record?.supplier ||
      "Unknown Supplier"
    );
  };

  const getBatch = (record) => {
    const result = getResult(record);

    return (
      result?.batchNumber ||
      result?.batchNo ||
      record?.batchNumber ||
      "Unknown Batch"
    );
  };

  const getFileName = (record) => {
    const result = getResult(record);

    return (
      record?.fileName ||
      result?.fileName ||
      "CoA Document"
    );
  };

  const getDate = (record) => {
    const result = getResult(record);

    return (
      record?.date ||
      record?.createdAt ||
      result?.date ||
      result?.createdAt ||
      new Date().toISOString()
    );
  };

  const getQualityScore = (record) => {
    const analysis = getAnalysis(record);
    const result = getResult(record);

    const possibleScore =
      analysis?.qualityScore ??
      analysis?.score ??
      result?.qualityScore ??
      result?.score;

    if (
      possibleScore !== undefined &&
      possibleScore !== null &&
      !isNaN(Number(possibleScore))
    ) {
      return Math.max(
        0,
        Math.min(100, Number(possibleScore))
      );
    }

    const total =
      Number(
        analysis?.totalParameters ??
          result?.totalParameters ??
          0
      );

    const passed =
      Number(
        analysis?.passCount ??
          result?.passCount ??
          0
      );

    if (total > 0) {
      return Math.round((passed / total) * 100);
    }

    const status = getStatus(record);

    if (status === "PASS") return 95;
    if (status === "FAIL") return 35;

    return 65;
  };

  // ==========================================
  // RISK CALCULATION
  // ==========================================

  const calculateRisk = (record) => {
    const status = getStatus(record);
    const score = getQualityScore(record);

    let riskScore = 100 - score;

    if (status === "FAIL") {
      riskScore = Math.max(riskScore, 75);
    }

    if (status === "REVIEW") {
      riskScore = Math.max(riskScore, 45);
    }

    if (status === "PASS") {
      riskScore = Math.min(riskScore, 25);
    }

    return Math.max(
      0,
      Math.min(100, Math.round(riskScore))
    );
  };

  const getRiskLevel = (score) => {
    if (score >= 70) return "HIGH";
    if (score >= 40) return "MEDIUM";
    return "LOW";
  };

  const getRiskColor = (level) => {
    if (level === "HIGH") return "#dc2626";
    if (level === "MEDIUM") return "#f59e0b";
    return "#16a34a";
  };

  const getRiskBackground = (level) => {
    if (level === "HIGH") return "#fee2e2";
    if (level === "MEDIUM") return "#fef3c7";
    return "#dcfce7";
  };

  // ==========================================
  // PREDICTION DATA
  // ==========================================

  const predictions = useMemo(() => {
    return records.map((record, index) => {
      const riskScore = calculateRisk(record);
      const riskLevel = getRiskLevel(riskScore);

      return {
        id: record?.id || index,
        fileName: getFileName(record),
        supplier: getSupplier(record),
        batch: getBatch(record),
        status: getStatus(record),
        qualityScore: getQualityScore(record),
        riskScore,
        riskLevel,
        date: getDate(record),
        originalRecord: record,
      };
    });
  }, [records]);

  // ==========================================
  // FILTER
  // ==========================================

  const filteredPredictions = predictions.filter(
    (prediction) => {
      if (selectedCategory === "all") return true;

      return (
        prediction.riskLevel.toLowerCase() ===
        selectedCategory
      );
    }
  );

  // ==========================================
  // STATISTICS
  // ==========================================

  const totalDocuments = predictions.length;

  const highRiskCount = predictions.filter(
    (item) => item.riskLevel === "HIGH"
  ).length;

  const mediumRiskCount = predictions.filter(
    (item) => item.riskLevel === "MEDIUM"
  ).length;

  const lowRiskCount = predictions.filter(
    (item) => item.riskLevel === "LOW"
  ).length;

  const averageRisk =
    predictions.length > 0
      ? Math.round(
          predictions.reduce(
            (sum, item) => sum + item.riskScore,
            0
          ) / predictions.length
        )
      : 0;

  const averageQuality =
    predictions.length > 0
      ? Math.round(
          predictions.reduce(
            (sum, item) => sum + item.qualityScore,
            0
          ) / predictions.length
        )
      : 0;

  // ==========================================
  // SUPPLIER RISK
  // ==========================================

  const supplierRisk = useMemo(() => {
    const supplierMap = {};

    predictions.forEach((prediction) => {
      const supplier = prediction.supplier;

      if (!supplierMap[supplier]) {
        supplierMap[supplier] = {
          name: supplier,
          documents: 0,
          totalRisk: 0,
          highRisk: 0,
          mediumRisk: 0,
          lowRisk: 0,
        };
      }

      supplierMap[supplier].documents++;
      supplierMap[supplier].totalRisk +=
        prediction.riskScore;

      if (prediction.riskLevel === "HIGH") {
        supplierMap[supplier].highRisk++;
      } else if (
        prediction.riskLevel === "MEDIUM"
      ) {
        supplierMap[supplier].mediumRisk++;
      } else {
        supplierMap[supplier].lowRisk++;
      }
    });

    return Object.values(supplierMap)
      .map((supplier) => {
        const averageRisk = Math.round(
          supplier.totalRisk / supplier.documents
        );

        return {
          ...supplier,
          averageRisk,
          riskLevel: getRiskLevel(averageRisk),
        };
      })
      .sort(
        (a, b) =>
          b.averageRisk - a.averageRisk
      );
  }, [predictions]);

  // ==========================================
  // RISK FACTORS
  // ==========================================

  const riskFactors = [
    {
      title: "Failed Quality Parameters",
      description:
        "Documents containing failed quality parameters increase predicted risk.",
      icon: "🚨",
      count: predictions.filter(
        (item) => item.status === "FAIL"
      ).length,
      level:
        predictions.filter(
          (item) => item.status === "FAIL"
        ).length > 0
          ? "HIGH"
          : "LOW",
    },
    {
      title: "Documents Requiring Review",
      description:
        "Documents with incomplete or uncertain analysis require further verification.",
      icon: "🔍",
      count: predictions.filter(
        (item) => item.status === "REVIEW"
      ).length,
      level:
        predictions.filter(
          (item) => item.status === "REVIEW"
        ).length > 0
          ? "MEDIUM"
          : "LOW",
    },
    {
      title: "Low Quality Scores",
      description:
        "Documents with lower quality scores indicate potential quality concerns.",
      icon: "📉",
      count: predictions.filter(
        (item) => item.qualityScore < 70
      ).length,
      level:
        predictions.filter(
          (item) => item.qualityScore < 70
        ).length > 0
          ? "HIGH"
          : "LOW",
    },
    {
      title: "High Risk Batches",
      description:
        "Batch records with high predicted risk require priority inspection.",
      icon: "📦",
      count: highRiskCount,
      level: highRiskCount > 0 ? "HIGH" : "LOW",
    },
  ];

  // ==========================================
  // AI RECOMMENDATIONS
  // ==========================================

  const recommendations = [];

  if (highRiskCount > 0) {
    recommendations.push({
      icon: "🚨",
      title: "Prioritize High-Risk Documents",
      description: `${highRiskCount} document(s) have high predicted risk. Review failed parameters and verify the original CoA documents.`,
      priority: "HIGH",
    });
  }

  if (mediumRiskCount > 0) {
    recommendations.push({
      icon: "⚠️",
      title: "Investigate Medium-Risk Documents",
      description: `${mediumRiskCount} document(s) require additional review. Verify uncertain or incomplete quality parameters.`,
      priority: "MEDIUM",
    });
  }

  if (lowRiskCount > 0) {
    recommendations.push({
      icon: "✅",
      title: "Maintain Low-Risk Suppliers",
      description: `${lowRiskCount} document(s) currently show low risk. Continue routine monitoring and verification.`,
      priority: "LOW",
    });
  }

  if (predictions.length === 0) {
    recommendations.push({
      icon: "📄",
      title: "Upload CoA Documents",
      description:
        "Upload and analyze Certificate of Analysis documents to generate risk predictions.",
      priority: "INFO",
    });
  }

  // ==========================================
  // REFRESH
  // ==========================================

  const refreshData = () => {
    try {
      setRecords(
        JSON.parse(
          localStorage.getItem("certiVerifyRecords") ||
            "[]"
        )
      );
    } catch {
      setRecords([]);
    }
  };

  // ==========================================
  // MAIN UI
  // ==========================================

  return (
    <div className="risk-prediction-page">

      {/* HEADER */}

      <header className="risk-header">

        <div className="risk-header-content">

          <button
            className="risk-back-button"
            onClick={handleBack}
          >
            ← Back to Dashboard
          </button>

          <div className="risk-eyebrow">
            AI QUALITY INTELLIGENCE
          </div>

          <h1>
            Risk Prediction
          </h1>

          <p>
            Predict quality risks, identify vulnerable
            batches, and proactively monitor supplier
            performance.
          </p>

        </div>

        <button
          className="risk-refresh-button"
          onClick={refreshData}
        >
          ↻ Refresh Data
        </button>

      </header>

      {/* OVERVIEW */}

      <section className="risk-overview-grid">

        <div className="risk-overview-card">

          <div className="risk-card-top">
            <span>Overall Risk Score</span>
            <div className="risk-card-icon purple">
              🎯
            </div>
          </div>

          <div className="risk-score-display">

            <strong>
              {averageRisk}
            </strong>

            <span>
              /100
            </span>

          </div>

          <div className="risk-score-progress">

            <div
              style={{
                width: `${averageRisk}%`,
                background: getRiskColor(
                  getRiskLevel(averageRisk)
                ),
              }}
            />

          </div>

          <span
            className={`risk-level-badge ${getRiskLevel(
              averageRisk
            ).toLowerCase()}`}
          >
            {getRiskLevel(averageRisk)} RISK
          </span>

        </div>

        <div className="risk-overview-card">

          <div className="risk-card-top">
            <span>Documents Analyzed</span>
            <div className="risk-card-icon blue">
              📄
            </div>
          </div>

          <h2>
            {totalDocuments}
          </h2>

          <p>
            Total analyzed CoA documents
          </p>

        </div>

        <div className="risk-overview-card">

          <div className="risk-card-top">
            <span>High Risk Documents</span>
            <div className="risk-card-icon red">
              🚨
            </div>
          </div>

          <h2 className="high-risk-number">
            {highRiskCount}
          </h2>

          <p>
            Require immediate attention
          </p>

        </div>

        <div className="risk-overview-card">

          <div className="risk-card-top">
            <span>Average Quality Score</span>
            <div className="risk-card-icon green">
              ✓
            </div>
          </div>

          <h2>
            {averageQuality}%
          </h2>

          <p>
            Across analyzed documents
          </p>

        </div>

      </section>

      {/* RISK DISTRIBUTION */}

      <section className="risk-section">

        <div className="risk-section-heading">

          <div>
            <h2>
              Risk Distribution
            </h2>

            <p>
              Overview of predicted document risk levels
            </p>
          </div>

        </div>

        <div className="risk-distribution-grid">

          <div className="risk-distribution-card high">

            <div className="risk-distribution-icon">
              🚨
            </div>

            <div className="risk-distribution-info">

              <span>
                High Risk
              </span>

              <h2>
                {highRiskCount}
              </h2>

              <p>
                {totalDocuments > 0
                  ? Math.round(
                      (highRiskCount /
                        totalDocuments) *
                        100
                    )
                  : 0}
                % of documents
              </p>

            </div>

            <div className="risk-distribution-bar">

              <div
                style={{
                  width: `${
                    totalDocuments > 0
                      ? (highRiskCount /
                          totalDocuments) *
                        100
                      : 0
                  }%`,
                }}
              />

            </div>

          </div>

          <div className="risk-distribution-card medium">

            <div className="risk-distribution-icon">
              ⚠️
            </div>

            <div className="risk-distribution-info">

              <span>
                Medium Risk
              </span>

              <h2>
                {mediumRiskCount}
              </h2>

              <p>
                {totalDocuments > 0
                  ? Math.round(
                      (mediumRiskCount /
                        totalDocuments) *
                        100
                    )
                  : 0}
                % of documents
              </p>

            </div>

            <div className="risk-distribution-bar">

              <div
                style={{
                  width: `${
                    totalDocuments > 0
                      ? (mediumRiskCount /
                          totalDocuments) *
                        100
                      : 0
                  }%`,
                }}
              />

            </div>

          </div>

          <div className="risk-distribution-card low">

            <div className="risk-distribution-icon">
              ✅
            </div>

            <div className="risk-distribution-info">

              <span>
                Low Risk
              </span>

              <h2>
                {lowRiskCount}
              </h2>

              <p>
                {totalDocuments > 0
                  ? Math.round(
                      (lowRiskCount /
                        totalDocuments) *
                        100
                    )
                  : 0}
                % of documents
              </p>

            </div>

            <div className="risk-distribution-bar">

              <div
                style={{
                  width: `${
                    totalDocuments > 0
                      ? (lowRiskCount /
                          totalDocuments) *
                        100
                      : 0
                  }%`,
                }}
              />

            </div>

          </div>

        </div>

      </section>

      {/* RISK FACTORS */}

      <section className="risk-section">

        <div className="risk-section-heading">

          <div>
            <h2>
              Risk Factors
            </h2>

            <p>
              Key indicators contributing to quality risk
            </p>
          </div>

        </div>

        <div className="risk-factor-grid">

          {riskFactors.map((factor, index) => (

            <div
              className="risk-factor-card"
              key={index}
            >

              <div className="risk-factor-top">

                <div className="risk-factor-icon">
                  {factor.icon}
                </div>

                <span
                  className={`risk-level-badge ${factor.level.toLowerCase()}`}
                >
                  {factor.level}
                </span>

              </div>

              <h3>
                {factor.title}
              </h3>

              <p>
                {factor.description}
              </p>

              <div className="risk-factor-count">
                <strong>
                  {factor.count}
                </strong>

                <span>
                  detected
                </span>
              </div>

            </div>

          ))}

        </div>

      </section>

      {/* SUPPLIER RISK */}

      <section className="risk-section">

        <div className="risk-section-heading">

          <div>
            <h2>
              Supplier Risk Assessment
            </h2>

            <p>
              Suppliers ranked by average predicted risk
            </p>
          </div>

        </div>

        {supplierRisk.length === 0 ? (

          <div className="risk-empty-state">

            <div>
              🏭
            </div>

            <h3>
              No Supplier Data Available
            </h3>

            <p>
              Analyze CoA documents to generate
              supplier risk assessments.
            </p>

          </div>

        ) : (

          <div className="risk-supplier-table-wrapper">

            <table className="risk-supplier-table">

              <thead>

                <tr>
                  <th>Supplier</th>
                  <th>Documents</th>
                  <th>High Risk</th>
                  <th>Medium Risk</th>
                  <th>Low Risk</th>
                  <th>Average Risk</th>
                  <th>Risk Level</th>
                </tr>

              </thead>

              <tbody>

                {supplierRisk.map(
                  (supplier, index) => (

                    <tr key={index}>

                      <td>
                        <strong>
                          {supplier.name}
                        </strong>
                      </td>

                      <td>
                        {supplier.documents}
                      </td>

                      <td className="high-risk-cell">
                        {supplier.highRisk}
                      </td>

                      <td className="medium-risk-cell">
                        {supplier.mediumRisk}
                      </td>

                      <td className="low-risk-cell">
                        {supplier.lowRisk}
                      </td>

                      <td>

                        <div className="risk-table-score">

                          <div className="risk-mini-progress">

                            <div
                              style={{
                                width: `${supplier.averageRisk}%`,
                                background:
                                  getRiskColor(
                                    supplier.riskLevel
                                  ),
                              }}
                            />

                          </div>

                          <strong>
                            {supplier.averageRisk}
                          </strong>

                        </div>

                      </td>

                      <td>

                        <span
                          className={`risk-level-badge ${supplier.riskLevel.toLowerCase()}`}
                        >
                          {supplier.riskLevel}
                        </span>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </section>

      {/* BATCH RISK */}

      <section className="risk-section">

        <div className="risk-section-heading">

          <div>
            <h2>
              Batch Risk Prediction
            </h2>

            <p>
              Risk assessment for analyzed batches
            </p>
          </div>

        </div>

        <div className="risk-filter-row">

          <div className="risk-filter-buttons">

            {["all", "high", "medium", "low"].map(
              (category) => (

                <button
                  key={category}
                  className={
                    selectedCategory === category
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    setSelectedCategory(category)
                  }
                >
                  {category === "all"
                    ? "All Batches"
                    : `${category.charAt(0).toUpperCase()}${category.slice(1)} Risk`}
                </button>

              )
            )}

          </div>

          <span>
            {filteredPredictions.length} results
          </span>

        </div>

        {filteredPredictions.length === 0 ? (

          <div className="risk-empty-state">

            <div>
              📦
            </div>

            <h3>
              No Batch Data Found
            </h3>

            <p>
              Upload CoA documents to generate batch
              risk predictions.
            </p>

          </div>

        ) : (

          <div className="risk-batch-table-wrapper">

            <table className="risk-batch-table">

              <thead>

                <tr>
                  <th>Batch Number</th>
                  <th>Supplier</th>
                  <th>Document</th>
                  <th>Quality Score</th>
                  <th>Risk Score</th>
                  <th>Risk Level</th>
                  <th>Status</th>
                </tr>

              </thead>

              <tbody>

                {filteredPredictions.map(
                  (prediction, index) => (

                    <tr key={prediction.id || index}>

                      <td>
                        <strong>
                          {prediction.batch}
                        </strong>
                      </td>

                      <td>
                        {prediction.supplier}
                      </td>

                      <td>
                        <span
                          className="risk-document-name"
                          title={prediction.fileName}
                        >
                          {prediction.fileName}
                        </span>
                      </td>

                      <td>

                        <div className="risk-quality-score">

                          <span>
                            {prediction.qualityScore}%
                          </span>

                          <div className="risk-mini-progress">

                            <div
                              style={{
                                width: `${prediction.qualityScore}%`,
                                background:
                                  prediction.qualityScore >= 80
                                    ? "#16a34a"
                                    : prediction.qualityScore >= 60
                                    ? "#f59e0b"
                                    : "#dc2626",
                              }}
                            />

                          </div>

                        </div>

                      </td>

                      <td>

                        <strong
                          style={{
                            color: getRiskColor(
                              prediction.riskLevel
                            ),
                          }}
                        >
                          {prediction.riskScore}/100
                        </strong>

                      </td>

                      <td>

                        <span
                          className={`risk-level-badge ${prediction.riskLevel.toLowerCase()}`}
                        >
                          {prediction.riskLevel}
                        </span>

                      </td>

                      <td>

                        <span
                          className={`risk-status-badge ${prediction.status.toLowerCase()}`}
                        >
                          {prediction.status}
                        </span>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </section>

      {/* AI RECOMMENDATIONS */}

      <section className="risk-section">

        <div className="risk-section-heading">

          <div>
            <h2>
              AI Risk Recommendations
            </h2>

            <p>
              Suggested actions based on detected risk patterns
            </p>
          </div>

        </div>

        <div className="risk-recommendations-grid">

          {recommendations.map(
            (recommendation, index) => (

              <div
                className="risk-recommendation-card"
                key={index}
              >

                <div className="risk-recommendation-icon">
                  {recommendation.icon}
                </div>

                <div className="risk-recommendation-content">

                  <div className="risk-recommendation-top">

                    <h3>
                      {recommendation.title}
                    </h3>

                    <span
                      className={`risk-level-badge ${recommendation.priority.toLowerCase()}`}
                    >
                      {recommendation.priority}
                    </span>

                  </div>

                  <p>
                    {recommendation.description}
                  </p>

                </div>

              </div>

            )
          )}

        </div>

      </section>

      {/* DISCLAIMER */}

      <div className="risk-disclaimer">

        <span>
          ℹ️
        </span>

        <p>
          <strong>Risk Prediction Notice:</strong>{" "}
          These risk scores are calculated from existing
          CoA analysis records and quality indicators.
          They are intended to support decision-making
          and do not replace laboratory testing,
          regulatory review, or professional quality
          assessment.
        </p>

      </div>

    </div>
  );
}