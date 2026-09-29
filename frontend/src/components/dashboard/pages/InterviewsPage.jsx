import React, { useState, useEffect, useCallback, useRef } from 'react';
import { applicationsApi } from '../../../services/api';
import {
  InterviewsIcon,
  SearchIcon,
  PlusIcon,
  EyeIcon,
  EditIcon,
  TrashIcon,
  ExternalLinkIcon,
  RefreshIcon,
  CalendarIcon,
} from '../DashboardIcons';

function formatDate(isoString) {
  if (!isoString) return '—';
  try {
    return new Date(isoString).toLocaleDateString(undefined, {
      month: 'short', day: 'numeric', year: 'numeric',
    });
  } catch {
    return isoString;
  }
}

function getMonogram(companyName) {
  const known = {
    Google:    { bg: 'rgba(66,133,244,0.12)',  color: '#60A5FA', border: 'rgba(96,165,250,0.25)' },
    Microsoft: { bg: 'rgba(0,120,215,0.12)',   color: '#38BDF8', border: 'rgba(56,189,248,0.25)' },
    Zoho:      { bg: 'rgba(244,63,94,0.10)',   color: '#FB7185', border: 'rgba(251,113,133,0.22)' },
    Amazon:    { bg: 'rgba(245,158,11,0.12)',  color: '#FBBF24', border: 'rgba(251,191,36,0.22)' },
    Stripe:    { bg: 'rgba(129,140,248,0.12)', color: '#818CF8', border: 'rgba(129,140,248,0.22)' },
    Meta:      { bg: 'rgba(24,119,242,0.12)',  color: '#60A5FA', border: 'rgba(96,165,250,0.22)' },
    Flipkart:  { bg: 'rgba(249,115,22,0.12)',  color: '#FB923C', border: 'rgba(251,146,60,0.22)' },
  };
  const conf = known[companyName] || {
    bg: 'rgba(255,255,255,0.06)',
    color: '#94A3B8',
    border: 'rgba(255,255,255,0.08)',
  };
  return { ...conf, initial: (companyName || 'A').charAt(0).toUpperCase() };
}

export default function InterviewsPage({
  onSelectApplication,
  onEditApplication,
  onDeleteApplication,
  onAddClick,
  onNavigateToApplications,
  stats,
  refreshTrigger,
}) {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const searchTimer = useRef(null);

  const fetchInterviews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await applicationsApi.list({
        status: 'Interview',
        company: searchQuery.trim() || undefined,
        limit: 50,
      });
      setInterviews(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to load interviews');
      setInterviews([]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      fetchInterviews();
    }, 250);
    return () => clearTimeout(searchTimer.current);
  }, [fetchInterviews, refreshTrigger]);

  const totalApps = stats?.total ?? 0;
  const interviewCount = stats?.Interview ?? interviews.length;
  const interviewRate = totalApps > 0 ? Math.round((interviewCount / totalApps) * 100) : 0;

  return (
    <main className="dashboard-scrollable-content">
      <div className="dashboard-content-max">
        {/* Page Header */}
        <div className="page-header-banner">
          <div className="page-header-info">
            <div className="page-title-row">
              <h1 className="page-main-title">Interviews</h1>
              <span className="count-pill badge-interview-pill">
                {interviewCount} {interviewCount === 1 ? 'Round' : 'Rounds'} Active
              </span>
            </div>
            <p className="page-main-subtitle">
              All applications currently in interview stages. Prepare well and track your progress.
            </p>
          </div>
          <div className="page-header-actions">
            <button
              type="button"
              className="btn-refresh-pill"
              onClick={fetchInterviews}
              title="Refresh interviews"
            >
              <RefreshIcon size={14} />
              <span>Refresh</span>
            </button>
            <button
              type="button"
              className="btn-primary-add"
              onClick={onAddClick}
            >
              <PlusIcon size={14} />
              <span>Add Application</span>
            </button>
          </div>
        </div>

        {/* Highlight KPI Grid */}
        <div className="interview-summary-grid">
          <div className="summary-card glass-panel">
            <div className="summary-icon-box interview-glow">
              <InterviewsIcon size={20} />
            </div>
            <div className="summary-content">
              <span className="summary-label">ACTIVE INTERVIEWS</span>
              <span className="summary-value">{interviewCount}</span>
              <span className="summary-sub">Across all companies</span>
            </div>
          </div>

          <div className="summary-card glass-panel">
            <div className="summary-icon-box orange-glow">
              <CalendarIcon size={20} />
            </div>
            <div className="summary-content">
              <span className="summary-label">INTERVIEW RATE</span>
              <span className="summary-value">{interviewRate}%</span>
              <span className="summary-sub">Of total applications submitted</span>
            </div>
          </div>

          <div className="summary-card glass-panel">
            <div className="summary-icon-box green-glow">
              <span style={{ fontSize: 18, fontWeight: 700, color: '#10B981' }}>★</span>
            </div>
            <div className="summary-content">
              <span className="summary-label">PIPELINE STATUS</span>
              <span className="summary-value">
                {interviewCount > 0 ? 'Active' : 'Awaiting'}
              </span>
              <span className="summary-sub">
                {interviewCount > 0 ? 'Rounds in progress' : 'Keep applying!'}
              </span>
            </div>
          </div>
        </div>

        {/* Filter bar */}
        <div className="filter-controls-card glass-panel" style={{ marginTop: 16 }}>
          <div className="filter-controls-top">
            <div className="table-inline-search full-search-box">
              <SearchIcon size={14} className="search-icon-muted" />
              <input
                id="interviews-search-input"
                type="text"
                placeholder="Search interviews by company or role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="table-search-input"
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="modal-error-banner" style={{ marginTop: 12 }}>
            <span>{error}</span>
          </div>
        )}

        {/* Table / List */}
        <div className="recent-apps-card glass-panel" style={{ marginTop: 16 }}>
          <div className="table-responsive-container">
            <table className="apps-table">
              <thead>
                <tr>
                  <th scope="col" className="col-company">Company</th>
                  <th scope="col" className="col-position">Position</th>
                  <th scope="col" className="col-status">Status</th>
                  <th scope="col" className="col-date">Date Applied</th>
                  <th scope="col" className="col-link">Job Link</th>
                  <th scope="col" className="col-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="table-empty-row">
                      Loading interview data…
                    </td>
                  </tr>
                ) : interviews.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="table-empty-row" style={{ padding: '48px 20px' }}>
                      <InterviewsIcon size={36} className="empty-state-icon" />
                      <p style={{ marginTop: 10, fontSize: 14, color: 'var(--af-text-primary)', fontWeight: 600 }}>
                        {searchQuery ? 'No interviews match your search' : 'No interviews scheduled yet'}
                      </p>
                      <p style={{ fontSize: 12.5, color: 'var(--af-text-secondary)', marginTop: 4 }}>
                        {searchQuery
                          ? 'Try searching for a different company or job title.'
                          : 'When an employer invites you for an interview, update the status to "Interview".'}
                      </p>
                      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 16 }}>
                        <button
                          type="button"
                          className="btn-primary-add"
                          onClick={onAddClick}
                        >
                          <PlusIcon size={14} />
                          <span>Add Application</span>
                        </button>
                        {onNavigateToApplications && (
                          <button
                            type="button"
                            className="btn-refresh-pill"
                            onClick={onNavigateToApplications}
                          >
                            <span>View All Applications</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  interviews.map((app) => {
                    const mono = getMonogram(app.company_name);
                    return (
                      <tr
                        key={app.id}
                        className="app-table-row"
                        onClick={() => onSelectApplication?.(app)}
                      >
                        <td className="col-company">
                          <div className="company-info-cell">
                            <div
                              className="company-monogram"
                              style={{
                                background: mono.bg,
                                color: mono.color,
                                borderColor: mono.border,
                              }}
                            >
                              {mono.initial}
                            </div>
                            <span className="company-name-text">{app.company_name}</span>
                          </div>
                        </td>

                        <td className="col-position">
                          <span className="position-title-text">{app.job_title}</span>
                        </td>

                        <td className="col-status">
                          <span className="status-badge badge-interview">
                            <span className="status-dot dot-interview" />
                            Interview
                          </span>
                        </td>

                        <td className="col-date">
                          <span className="date-text">{formatDate(app.applied_date)}</span>
                        </td>

                        <td className="col-link" onClick={(e) => e.stopPropagation()}>
                          {app.job_url ? (
                            <a
                              href={app.job_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="table-link-btn"
                              title="Open job URL"
                            >
                              <ExternalLinkIcon size={13} />
                              <span>Link</span>
                            </a>
                          ) : (
                            <span className="date-text">—</span>
                          )}
                        </td>

                        <td className="col-actions" onClick={(e) => e.stopPropagation()}>
                          <div className="row-action-btns">
                            <button
                              type="button"
                              className="action-icon-btn view-btn"
                              title="View details"
                              onClick={() => onSelectApplication?.(app)}
                            >
                              <EyeIcon size={14} />
                            </button>
                            <button
                              type="button"
                              className="action-icon-btn edit-btn"
                              title="Edit application"
                              onClick={() => onEditApplication?.(app)}
                            >
                              <EditIcon size={14} />
                            </button>
                            <button
                              type="button"
                              className="action-icon-btn delete-btn"
                              title="Delete application"
                              onClick={() => onDeleteApplication?.(app)}
                            >
                              <TrashIcon size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
