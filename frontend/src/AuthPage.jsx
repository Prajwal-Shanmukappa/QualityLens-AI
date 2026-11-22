import React, { useState } from "react";
import "./AuthPage.css";

const API_URL = "http://localhost:8080/api/auth";

function AuthPage({ onAuthenticated }) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    organization: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!isLogin) {
      if (!formData.name.trim()) {
        setError("Please enter your full name.");
        return;
      }

      if (!formData.organization.trim()) {
        setError("Please enter your organization.");
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match.");
        return;
      }

      if (formData.password.length < 6) {
        setError("Password must contain at least 6 characters.");
        return;
      }
    }

    setLoading(true);

    try {
      const endpoint = isLogin ? "/login" : "/signup";

      const payload = isLogin
        ? {
            email: formData.email,
            password: formData.password,
          }
        : {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            organization: formData.organization,
            role: "USER",
          };

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const responseText = await response.text();

      let data = {};

      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch {
        data = {};
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            responseText ||
            "Authentication failed."
        );
      }

      if (!data || !data.email) {
        throw new Error("Invalid response received from server.");
      }

      const authenticatedUser = {
        id: data.id,
        name: data.name,
        email: data.email,
        organization: data.organization,
        role: data.role,
      };

      setSuccess(
        isLogin
          ? "Login successful!"
          : "Account created successfully!"
      );

      // Send authenticated user to App.jsx
      if (onAuthenticated) {
        setTimeout(() => {
          onAuthenticated(authenticatedUser);
        }, 500);
      }
    } catch (err) {
      console.error("Authentication error:", err);

      if (
        err.message.includes("Failed to fetch") ||
        err.message.includes("NetworkError")
      ) {
        setError(
          "Unable to connect to the server. Please make sure the backend is running."
        );
      } else {
        setError(err.message || "Something went wrong.");
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setError("");
    setSuccess("");

    setFormData({
      name: "",
      email: "",
      organization: "",
      password: "",
      confirmPassword: "",
    });
  };

  return (
    <div className="auth-container">

      {/* Background decoration */}
      <div className="auth-background">
        <div className="auth-orb auth-orb-1"></div>
        <div className="auth-orb auth-orb-2"></div>
        <div className="auth-orb auth-orb-3"></div>
      </div>

      {/* Main card */}
      <div className="auth-card">

        {/* Left section */}
        <div className="auth-left">

          <div className="auth-brand">
            <div className="auth-brand-icon">
              <span>✓</span>
            </div>

            <div>
              <h2>CertiVerify</h2>
              <p>AI-Powered Certificate Verification</p>
            </div>
          </div>

          <div className="auth-left-content">
            <div className="auth-tag">
              <span className="auth-tag-dot"></span>
              Intelligent Document Verification
            </div>

            <h1>
              Verify with
              <span> confidence.</span>
            </h1>

            <p className="auth-description">
              Experience smarter certificate analysis with AI-powered
              verification, fraud detection, document intelligence,
              and real-time insights.
            </p>

            <div className="auth-features">

              <div className="auth-feature">
                <div className="auth-feature-icon">✦</div>
                <div>
                  <h4>AI-Powered Analysis</h4>
                  <p>Intelligent certificate processing</p>
                </div>
              </div>

              <div className="auth-feature">
                <div className="auth-feature-icon">✓</div>
                <div>
                  <h4>Secure Verification</h4>
                  <p>Detect inconsistencies and risks</p>
                </div>
              </div>

              <div className="auth-feature">
                <div className="auth-feature-icon">↗</div>
                <div>
                  <h4>Smart Insights</h4>
                  <p>Advanced analytics and reports</p>
                </div>
              </div>

            </div>
          </div>

          <div className="auth-left-footer">
            © 2026 CertiVerify · Intelligent Verification Platform
          </div>
        </div>

        {/* Right section */}
        <div className="auth-right">

          <div className="auth-form-header">

            <div className="auth-mobile-brand">
              <div className="auth-brand-icon">
                <span>✓</span>
              </div>
              <h2>CertiVerify</h2>
            </div>

            <div className="auth-welcome">
              <span className="auth-welcome-label">
                {isLogin ? "WELCOME BACK" : "GET STARTED"}
              </span>

              <h2>
                {isLogin
                  ? "Sign in to your account"
                  : "Create your account"}
              </h2>

              <p>
                {isLogin
                  ? "Enter your credentials to continue."
                  : "Join CertiVerify and start verifying smarter."}
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="auth-form">

            {!isLogin && (
              <>
                <div className="auth-input-group">
                  <label htmlFor="name">Full Name</label>

                  <input
                    type="text"
                    id="name"
                    name="name"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="auth-input-group">
                  <label htmlFor="organization">Organization</label>

                  <input
                    type="text"
                    id="organization"
                    name="organization"
                    placeholder="Enter your organization"
                    value={formData.organization}
                    onChange={handleChange}
                    required
                  />
                </div>
              </>
            )}

            <div className="auth-input-group">
              <label htmlFor="email">Email Address</label>

              <input
                type="email"
                id="email"
                name="email"
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="auth-input-group">
              <label htmlFor="password">Password</label>

              <input
                type="password"
                id="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            {!isLogin && (
              <div className="auth-input-group">
                <label htmlFor="confirmPassword">
                  Confirm Password
                </label>

                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="auth-message auth-error">
                <span>⚠</span>
                {error}
              </div>
            )}

            {/* Success */}
            {success && (
              <div className="auth-message auth-success">
                <span>✓</span>
                {success}
              </div>
            )}

            <button
              type="submit"
              className="auth-submit-button"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="auth-spinner"></span>
                  Please wait...
                </>
              ) : (
                <>
                  {isLogin ? "Sign In" : "Create Account"}
                  <span className="auth-button-arrow">→</span>
                </>
              )}
            </button>

          </form>

          {/* Toggle */}
          <div className="auth-toggle">
            {isLogin
              ? "Don't have an account?"
              : "Already have an account?"}

            <button
              type="button"
              onClick={toggleAuthMode}
            >
              {isLogin ? "Create account" : "Sign in"}
            </button>
          </div>

          <div className="auth-security">
            <span>🔒</span>
            Your information is protected
          </div>

        </div>
      </div>
    </div>
  );
}

export default AuthPage;