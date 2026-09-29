import React, { useState } from 'react';
import {
  SunIcon,
  MoonIcon,
  CheckIcon,
} from '../DashboardIcons';

export default function SettingsPage({ theme, onToggleTheme }) {
  const [defaultTab, setDefaultTab] = useState(() => {
    return localStorage.getItem('applyflow_default_tab') || 'dashboard';
  });
  const [tableDensity, setTableDensity] = useState(() => {
    return localStorage.getItem('applyflow_density') || 'comfortable';
  });
  const [savedMsg, setSavedMsg] = useState(null);

  const handleSetDefaultTab = (tab) => {
    setDefaultTab(tab);
    localStorage.setItem('applyflow_default_tab', tab);
    showSaved('Default view preference saved');
  };

  const handleSetDensity = (density) => {
    setTableDensity(density);
    localStorage.setItem('applyflow_density', density);
    showSaved('Display density updated');
  };

  const showSaved = (msg) => {
    setSavedMsg(msg);
    setTimeout(() => setSavedMsg(null), 2500);
  };

  return (
    <main className="dashboard-scrollable-content">
      <div className="dashboard-content-max">
        {/* Header */}
        <div className="page-header-banner">
          <div className="page-header-info">
            <div className="page-title-row">
              <h1 className="page-main-title">Settings</h1>
              <span className="count-pill">Preferences</span>
            </div>
            <p className="page-main-subtitle">
              Customize your dashboard appearance, display density, and default preferences.
            </p>
          </div>
        </div>

        {savedMsg && (
          <div className="profile-toast-success" style={{ marginBottom: 16 }}>
            <span>✓ {savedMsg}</span>
          </div>
        )}

        <div className="settings-sections-stack">
          {/* Theme / Appearance */}
          <div className="settings-card glass-panel">
            <div className="settings-card-header">
              <h3 className="section-title">Appearance & Theme</h3>
              <p className="section-subtitle">
                Choose how ApplyFlow looks to you. Select between sleek dark mode or clean light mode.
              </p>
            </div>

            <div className="theme-selection-grid">
              {/* Dark mode card */}
              <div
                className={`theme-card-option ${theme === 'dark' ? 'selected-theme' : ''}`}
                onClick={() => theme !== 'dark' && onToggleTheme?.()}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && theme !== 'dark' && onToggleTheme?.()}
              >
                <div className="theme-preview-box dark-preview">
                  <div className="theme-mini-sidebar" />
                  <div className="theme-mini-content">
                    <div className="theme-mini-header" />
                    <div className="theme-mini-card" />
                  </div>
                </div>
                <div className="theme-option-info">
                  <div className="theme-option-title-row">
                    <MoonIcon size={14} />
                    <strong>Dark Charcoal</strong>
                  </div>
                  <span className="theme-option-desc">Deep slate background with vibrant orange accents</span>
                </div>
                {theme === 'dark' && (
                  <span className="theme-active-tag">Active</span>
                )}
              </div>

              {/* Light mode card */}
              <div
                className={`theme-card-option ${theme === 'light' ? 'selected-theme' : ''}`}
                onClick={() => theme !== 'light' && onToggleTheme?.()}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && theme !== 'light' && onToggleTheme?.()}
              >
                <div className="theme-preview-box light-preview">
                  <div className="theme-mini-sidebar light" />
                  <div className="theme-mini-content light">
                    <div className="theme-mini-header light" />
                    <div className="theme-mini-card light" />
                  </div>
                </div>
                <div className="theme-option-info">
                  <div className="theme-option-title-row">
                    <SunIcon size={14} />
                    <strong>Royal Light</strong>
                  </div>
                  <span className="theme-option-desc">Clean, high-clarity daylight theme</span>
                </div>
                {theme === 'light' && (
                  <span className="theme-active-tag">Active</span>
                )}
              </div>
            </div>
          </div>

          {/* Navigation Preferences */}
          <div className="settings-card glass-panel" style={{ marginTop: 18 }}>
            <div className="settings-card-header">
              <h3 className="section-title">Default Landing Page</h3>
              <p className="section-subtitle">
                Choose which page renders when you first sign in.
              </p>
            </div>

            <div className="radio-preference-group">
              {[
                { id: 'dashboard', label: 'Dashboard', desc: 'Overview, KPI cards, activity charts, and recent applications' },
                { id: 'applications', label: 'Applications', desc: 'Full application pipeline table with search and filters' },
                { id: 'interviews', label: 'Interviews', desc: 'Active interview rounds and upcoming schedule' },
                { id: 'analytics', label: 'Analytics', desc: 'Funnel progression, charts, and placement statistics' },
              ].map((opt) => (
                <label
                  key={opt.id}
                  className={`radio-pref-item ${defaultTab === opt.id ? 'active-radio-item' : ''}`}
                  onClick={() => handleSetDefaultTab(opt.id)}
                >
                  <input
                    type="radio"
                    name="defaultTab"
                    value={opt.id}
                    checked={defaultTab === opt.id}
                    onChange={() => handleSetDefaultTab(opt.id)}
                  />
                  <div className="radio-pref-content">
                    <span className="radio-pref-title">{opt.label}</span>
                    <span className="radio-pref-desc">{opt.desc}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Table Display Density */}
          <div className="settings-card glass-panel" style={{ marginTop: 18 }}>
            <div className="settings-card-header">
              <h3 className="section-title">Table Display Density</h3>
              <p className="section-subtitle">
                Adjust row padding and spacing in application tables.
              </p>
            </div>

            <div className="density-toggle-group">
              <button
                type="button"
                className={`btn-density ${tableDensity === 'comfortable' ? 'active-density' : ''}`}
                onClick={() => handleSetDensity('comfortable')}
              >
                <strong>Comfortable</strong>
                <span>Spacious row layout with generous breathing room</span>
              </button>
              <button
                type="button"
                className={`btn-density ${tableDensity === 'compact' ? 'active-density' : ''}`}
                onClick={() => handleSetDensity('compact')}
              >
                <strong>Compact</strong>
                <span>Higher information density, fits more rows on screen</span>
              </button>
            </div>
          </div>

          {/* Session Information */}
          <div className="settings-card glass-panel" style={{ marginTop: 18 }}>
            <div className="settings-card-header">
              <h3 className="section-title">Session & Security</h3>
              <p className="section-subtitle">
                Account security and session status.
              </p>
            </div>

            <div className="session-info-rows">
              <div className="session-info-row">
                <span className="session-info-label">Session Status</span>
                <span className="session-info-val">Active & Encrypted</span>
              </div>
              <div className="session-info-row">
                <span className="session-info-label">Data Privacy</span>
                <span className="session-info-val" style={{ color: '#10B981' }}>Private Account Space</span>
              </div>
              <div className="session-info-row">
                <span className="session-info-label">App Version</span>
                <span className="session-info-val mono">v1.0.0</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
