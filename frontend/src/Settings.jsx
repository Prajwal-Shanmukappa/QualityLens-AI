
import React, { useState } from "react";
import "./Settings.css";

const defaultSettings = {
  profileName: "Quality Administrator",
  email: "",
  companyName: "QualityLens AI",
  companyType: "Pharmaceutical",
  notifications: true,
  analysisNotifications: true,
  failureAlerts: true,
  weeklyReports: false,
  darkMode: false,
  compactMode: false,
  autoRefresh: true,
  language: "English",
  securityAlerts: true,
};

const loadSettings = () => {
  try {
    const saved = localStorage.getItem("qualityLensSettings");

    return saved
      ? { ...defaultSettings, ...JSON.parse(saved) }
      : defaultSettings;
  } catch {
    return defaultSettings;
  }
};

function Settings({ onBack, onNavigate }) {
  const [settings, setSettings] = useState(loadSettings);
  const [activeSection, setActiveSection] = useState("profile");
  const [savedMessage, setSavedMessage] = useState("");

  const updateSetting = (key, value) => {
    setSettings((previous) => ({
      ...previous,
      [key]: value,
    }));

    setSavedMessage("");
  };

  const saveSettings = () => {
    localStorage.setItem(
      "qualityLensSettings",
      JSON.stringify(settings)
    );

    setSavedMessage("Settings saved successfully!");

    setTimeout(() => {
      setSavedMessage("");
    }, 3000);
  };

  const resetSettings = () => {
    if (!window.confirm("Reset all settings to default?")) {
      return;
    }

    setSettings(defaultSettings);

    localStorage.setItem(
      "qualityLensSettings",
      JSON.stringify(defaultSettings)
    );

    setSavedMessage("Settings reset successfully!");
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (onNavigate) {
      onNavigate("dashboard");
    }
  };

  const sections = [
    {
      id: "profile",
      icon: "👤",
      title: "Profile",
      description: "Personal information",
    },
    {
      id: "company",
      icon: "🏢",
      title: "Company",
      description: "Organization details",
    },
    {
      id: "notifications",
      icon: "🔔",
      title: "Notifications",
      description: "Alert preferences",
    },
    {
      id: "appearance",
      icon: "🎨",
      title: "Appearance",
      description: "Customize interface",
    },
    {
      id: "preferences",
      icon: "⚙️",
      title: "Preferences",
      description: "Application settings",
    },
    {
      id: "security",
      icon: "🔐",
      title: "Security",
      description: "Security preferences",
    },
  ];

  const Toggle = ({ value, onChange }) => (
    <button
      className={`settings-toggle ${value ? "enabled" : ""}`}
      onClick={() => onChange(!value)}
      type="button"
      aria-pressed={value}
    >
      <span />
    </button>
  );

  return (
    <div className="settings-page">

      {/* HEADER */}

      <div className="settings-header">
        <div>
          <button
            className="settings-back-button"
            onClick={handleBack}
          >
            ← Back to Dashboard
          </button>

          <h1>Settings</h1>

          <p>
            Manage your account, application preferences,
            notifications, and security.
          </p>
        </div>
      </div>

      {/* MAIN LAYOUT */}

      <div className="settings-layout">

        {/* SIDEBAR */}

        <div className="settings-sidebar">
          {sections.map((section) => (
            <button
              key={section.id}
              className={`settings-nav-item ${
                activeSection === section.id ? "active" : ""
              }`}
              onClick={() => setActiveSection(section.id)}
            >
              <span className="settings-nav-icon">
                {section.icon}
              </span>

              <div>
                <strong>{section.title}</strong>
                <span>{section.description}</span>
              </div>
            </button>
          ))}
        </div>

        {/* CONTENT */}

        <div className="settings-content">

          {/* PROFILE */}

          {activeSection === "profile" && (
            <div className="settings-section">

              <div className="settings-section-header">
                <div>
                  <h2>Profile Settings</h2>
                  <p>
                    Manage your personal account information.
                  </p>
                </div>
              </div>

              <div className="settings-profile-card">
                <div className="settings-avatar">
                  {settings.profileName
                    ? settings.profileName.charAt(0).toUpperCase()
                    : "Q"}
                </div>

                <div>
                  <strong>{settings.profileName}</strong>
                  <span>Administrator</span>
                </div>
              </div>

              <div className="settings-form-grid">

                <div className="settings-form-group">
                  <label>Full Name</label>

                  <input
                    type="text"
                    value={settings.profileName}
                    onChange={(e) =>
                      updateSetting("profileName", e.target.value)
                    }
                    placeholder="Enter your name"
                  />
                </div>

                <div className="settings-form-group">
                  <label>Email Address</label>

                  <input
                    type="email"
                    value={settings.email}
                    onChange={(e) =>
                      updateSetting("email", e.target.value)
                    }
                    placeholder="admin@example.com"
                  />
                </div>

                <div className="settings-form-group">
                  <label>Role</label>

                  <input
                    type="text"
                    value="Administrator"
                    disabled
                  />
                </div>

                <div className="settings-form-group">
                  <label>Account Type</label>

                  <input
                    type="text"
                    value="Quality Management"
                    disabled
                  />
                </div>

              </div>
            </div>
          )}

          {/* COMPANY */}

          {activeSection === "company" && (
            <div className="settings-section">

              <div className="settings-section-header">
                <div>
                  <h2>Company Settings</h2>
                  <p>
                    Configure your organization information.
                  </p>
                </div>
              </div>

              <div className="settings-form-grid">

                <div className="settings-form-group">
                  <label>Company Name</label>

                  <input
                    type="text"
                    value={settings.companyName}
                    onChange={(e) =>
                      updateSetting("companyName", e.target.value)
                    }
                  />
                </div>

                <div className="settings-form-group">
                  <label>Industry</label>

                  <select
                    value={settings.companyType}
                    onChange={(e) =>
                      updateSetting("companyType", e.target.value)
                    }
                  >
                    <option>Pharmaceutical</option>
                    <option>Healthcare</option>
                    <option>Manufacturing</option>
                    <option>Food & Beverage</option>
                    <option>Chemical</option>
                    <option>Biotechnology</option>
                    <option>Other</option>
                  </select>
                </div>

                <div className="settings-form-group">
                  <label>Organization Size</label>

                  <select>
                    <option>Select company size</option>
                    <option>1–10 employees</option>
                    <option>11–50 employees</option>
                    <option>51–200 employees</option>
                    <option>201–500 employees</option>
                    <option>500+ employees</option>
                  </select>
                </div>

                <div className="settings-form-group">
                  <label>Country</label>

                  <select defaultValue="India">
                    <option>India</option>
                    <option>United States</option>
                    <option>United Kingdom</option>
                    <option>Germany</option>
                    <option>Other</option>
                  </select>
                </div>

              </div>
            </div>
          )}

          {/* NOTIFICATIONS */}

          {activeSection === "notifications" && (
            <div className="settings-section">

              <div className="settings-section-header">
                <div>
                  <h2>Notification Settings</h2>
                  <p>
                    Control which alerts you receive.
                  </p>
                </div>
              </div>

              <div className="settings-options">

                <div className="settings-option">
                  <div>
                    <strong>Enable Notifications</strong>
                    <p>
                      Enable or disable all application notifications.
                    </p>
                  </div>

                  <Toggle
                    value={settings.notifications}
                    onChange={(value) =>
                      updateSetting("notifications", value)
                    }
                  />
                </div>

                <div className="settings-option">
                  <div>
                    <strong>Analysis Completed</strong>
                    <p>
                      Receive notifications when document analysis
                      is completed.
                    </p>
                  </div>

                  <Toggle
                    value={settings.analysisNotifications}
                    onChange={(value) =>
                      updateSetting("analysisNotifications", value)
                    }
                  />
                </div>

                <div className="settings-option">
                  <div>
                    <strong>Failed Document Alerts</strong>
                    <p>
                      Get notified when a CoA document fails
                      quality verification.
                    </p>
                  </div>

                  <Toggle
                    value={settings.failureAlerts}
                    onChange={(value) =>
                      updateSetting("failureAlerts", value)
                    }
                  />
                </div>

                <div className="settings-option">
                  <div>
                    <strong>Weekly Reports</strong>
                    <p>
                      Receive a weekly summary of quality
                      performance and analytics.
                    </p>
                  </div>

                  <Toggle
                    value={settings.weeklyReports}
                    onChange={(value) =>
                      updateSetting("weeklyReports", value)
                    }
                  />
                </div>

              </div>
            </div>
          )}

          {/* APPEARANCE */}

          {activeSection === "appearance" && (
            <div className="settings-section">

              <div className="settings-section-header">
                <div>
                  <h2>Appearance</h2>
                  <p>
                    Customize how QualityLens AI looks.
                  </p>
                </div>
              </div>

              <div className="settings-options">

                <div className="settings-option">
                  <div>
                    <strong>Dark Mode</strong>
                    <p>
                      Enable dark appearance for the interface.
                    </p>
                  </div>

                  <Toggle
                    value={settings.darkMode}
                    onChange={(value) =>
                      updateSetting("darkMode", value)
                    }
                  />
                </div>

                <div className="settings-option">
                  <div>
                    <strong>Compact Layout</strong>
                    <p>
                      Use a more compact interface with reduced spacing.
                    </p>
                  </div>

                  <Toggle
                    value={settings.compactMode}
                    onChange={(value) =>
                      updateSetting("compactMode", value)
                    }
                  />
                </div>

              </div>

              <div className="settings-theme-preview">
                <h3>Theme Preview</h3>

                <div className="settings-preview-card">
                  <div className="settings-preview-header">
                    <div className="settings-preview-logo">
                      Q
                    </div>

                    <strong>QualityLens AI</strong>
                  </div>

                  <div className="settings-preview-body">
                    <div className="settings-preview-stat">
                      <span>Total Documents</span>
                      <strong>128</strong>
                    </div>

                    <div className="settings-preview-stat">
                      <span>Pass Rate</span>
                      <strong>94%</strong>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* PREFERENCES */}

          {activeSection === "preferences" && (
            <div className="settings-section">

              <div className="settings-section-header">
                <div>
                  <h2>Application Preferences</h2>
                  <p>
                    Configure your application behavior.
                  </p>
                </div>
              </div>

              <div className="settings-form-grid">

                <div className="settings-form-group">
                  <label>Language</label>

                  <select
                    value={settings.language}
                    onChange={(e) =>
                      updateSetting("language", e.target.value)
                    }
                  >
                    <option>English</option>
                    <option>Hindi</option>
                    <option>Kannada</option>
                  </select>
                </div>

              </div>

              <div className="settings-options">

                <div className="settings-option">
                  <div>
                    <strong>Auto Refresh Data</strong>
                    <p>
                      Automatically refresh dashboard data when
                      new analysis records are available.
                    </p>
                  </div>

                  <Toggle
                    value={settings.autoRefresh}
                    onChange={(value) =>
                      updateSetting("autoRefresh", value)
                    }
                  />
                </div>

              </div>
            </div>
          )}

          {/* SECURITY */}

          {activeSection === "security" && (
            <div className="settings-section">

              <div className="settings-section-header">
                <div>
                  <h2>Security Settings</h2>
                  <p>
                    Manage security-related preferences.
                  </p>
                </div>
              </div>

              <div className="settings-options">

                <div className="settings-option">
                  <div>
                    <strong>Security Alerts</strong>
                    <p>
                      Receive alerts for important security events.
                    </p>
                  </div>

                  <Toggle
                    value={settings.securityAlerts}
                    onChange={(value) =>
                      updateSetting("securityAlerts", value)
                    }
                  />
                </div>

              </div>

              <div className="settings-security-card">
                <div className="settings-security-icon">
                  🔐
                </div>

                <div>
                  <h3>Local Data Storage</h3>
                  <p>
                    Your current application preferences and
                    analysis records are stored locally in
                    your browser.
                  </p>
                </div>
              </div>

              <div className="settings-security-card">
                <div className="settings-security-icon">
                  🛡️
                </div>

                <div>
                  <h3>Account Security</h3>
                  <p>
                    Authentication and advanced account security
                    features can be configured when backend
                    authentication is integrated.
                  </p>
                </div>
              </div>

            </div>
          )}

          {/* FOOTER ACTIONS */}

          <div className="settings-footer">

            <div>
              {savedMessage && (
                <span className="settings-saved-message">
                  ✓ {savedMessage}
                </span>
              )}
            </div>

            <div className="settings-footer-actions">
              <button
                className="settings-reset-button"
                onClick={resetSettings}
              >
                Reset
              </button>

              <button
                className="settings-save-button"
                onClick={saveSettings}
              >
                Save Changes
              </button>
            </div>

          </div>

        </div>
      </div>

    </div>
  );
}

export default Settings;
