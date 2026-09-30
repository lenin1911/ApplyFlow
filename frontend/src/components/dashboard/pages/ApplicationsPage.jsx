import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { applicationsApi } from '../../../services/api';
import {
  SearchIcon,
  PlusIcon,
  EyeIcon,
  EditIcon,
  TrashIcon,
  ExternalLinkIcon,
  RefreshIcon,
  ApplicationsIcon,
} from '../DashboardIcons';

const statusStyles = {
  Interview: { badgeClass: 'badge-interview', dotClass: 'dot-interview', text: 'Interview' },
  Applied:   { badgeClass: 'badge-applied',   dotClass: 'dot-applied',   text: 'Applied'   },
  Rejected:  { badgeClass: 'badge-rejected',  dotClass: 'dot-rejected',  text: 'Rejected'  },
  Offer:     { badgeClass: 'badge-offer',     dotClass: 'dot-offer',     text: 'Offer'     },
};

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

export default function ApplicationsPage({
  onSelectApplication,
  onEditApplication,
  onDeleteApplication,
  onAddClick,
  onStatsChanged,
  refreshTrigger,
}) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortOption, setSortOption] = useState('date-desc');

  const searchTimer = useRef(null);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const statusParam = statusFilter !== 'ALL'
        ? statusFilter.charAt(0) + statusFilter.slice(1).toLowerCase()
        : undefined;

      const data = await applicationsApi.list({
        status: statusParam,
        company: searchQuery.trim() || undefined,
        page: currentPage,
        limit: pageSize,
      });
      setApplications(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to load applications');
      setApplications([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchQuery, currentPage, pageSize]);

  useEffect(() => {
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      fetchApplications();
    }, 250);
    return () => clearTimeout(searchTimer.current);
  }, [fetchApplications, refreshTrigger]);

  const handleSearchChange = (val) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  const handleStatusChange = (val) => {
    setStatusFilter(val);
    setCurrentPage(1);
  };

  // Client-side sort if desired
  const sortedApplications = useMemo(() => {
    const list = [...applications];
    switch (sortOption) {
      case 'date-desc':
        return list.sort((a, b) => new Date(b.applied_date || 0) - new Date(a.applied_date || 0));
      case 'date-asc':
        return list.sort((a, b) => new Date(a.applied_date || 0) - new Date(b.applied_date || 0));
      case 'company-asc':
        return list.sort((a, b) => (a.company_name || '').localeCompare(b.company_name || ''));
      case 'company-desc':
        return list.sort((a, b) => (b.company_name || '').localeCompare(a.company_name || ''));
      case 'status':
        return list.sort((a, b) => (a.status || '').localeCompare(b.status || ''));
      default:
        return list;
    }
  }, [applications, sortOption]);

  return (
    <main className="dashboard-scrollable-content">
      <div className="dashboard-content-max">
        {/* Page Top Header */}
        <div className="page-header-banner">
          <div className="page-header-info">
            <div className="page-title-row">
              <h1 className="page-main-title">Applications</h1>
              <span className="count-pill">{sortedApplications.length} loaded</span>
            </div>
            <p className="page-main-subtitle">
              View, search, filter, and manage your full pipeline of job applications.
            </p>
          </div>
          <div className="page-header-actions">
            <button
              type="button"
              className="btn-refresh-pill"
              onClick={fetchApplications}
              title="Refresh applications"
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

        {/* Filter / Search Card */}
        <div className="filter-controls-card glass-panel">
          <div className="filter-controls-top">
            {/* Status pills */}
            <div className="status-tabs" role="tablist">
              {['ALL', 'APPLIED', 'INTERVIEW', 'OFFER', 'REJECTED'].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  id={`app-filter-${tab.toLowerCase()}`}
                  className={`status-tab-btn ${statusFilter === tab ? 'active' : ''}`}
                  onClick={() => handleStatusChange(tab)}
                >
                  {tab === 'ALL' ? 'All' : tab.charAt(0) + tab.slice(1).toLowerCase()}
                </button>
              ))}
            </div>

            <div className="filter-right-inputs">
              {/* Search */}
              <div className="table-inline-search full-search-box">
                <SearchIcon size={14} className="search-icon-muted" />
                <input
                  id="applications-search-input"
                  type="text"
                  placeholder="Search company or job title..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="table-search-input"
                />
              </div>

              {/* Sort selector */}
              <select
                id="applications-sort-select"
                className="select-filter-compact"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                aria-label="Sort applications"
              >
                <option value="date-desc">Newest First</option>
                <option value="date-asc">Oldest First</option>
                <option value="company-asc">Company (A-Z)</option>
                <option value="company-desc">Company (Z-A)</option>
                <option value="status">Status</option>
              </select>

              {/* Page size */}
              <select
                id="applications-pagesize-select"
                className="select-filter-compact"
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                aria-label="Items per page"
              >
                <option value="10">10 / page</option>
                <option value="20">20 / page</option>
                <option value="50">50 / page</option>
              </select>
            </div>
          </div>
        </div>

        {/* Error message if any */}
        {error && (
          <div className="modal-error-banner" style={{ marginTop: 12 }}>
            <span>{error}</span>
          </div>
        )}

        {/* Table Card */}
        <div className="recent-apps-card glass-panel" style={{ marginTop: 16 }}>
          <div className="table-responsive-container">
            <table className="apps-table">
              <thead>
                <tr>
                  <th scope="col" className="col-company">Company</th>
                  <th scope="col" className="col-position">Position</th>
                  <th scope="col" className="col-status">Status</th>
                  <th scope="col" className="col-date">Applied Date</th>
                  <th scope="col" className="col-link">Link</th>
                  <th scope="col" className="col-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr className="table-loading-row">
                    <td colSpan="6">
                      <div className="table-spinner-wrap">
                        <div className="table-spinner" />
                        <span className="table-loading-text">Loading applications…</span>
                      </div>
                    </td>
                  </tr>
                ) : sortedApplications.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="table-empty-row" style={{ padding: '40px 20px' }}>
                      <ApplicationsIcon size={32} className="empty-state-icon" />
                      <p style={{ marginTop: 8, fontSize: 14, color: 'var(--af-text-primary)', fontWeight: 600 }}>
                        {searchQuery || statusFilter !== 'ALL'
                          ? 'No applications match your filters'
                          : 'No applications found'}
                      </p>
                      <p style={{ fontSize: 12.5, color: 'var(--af-text-secondary)', marginTop: 4 }}>
                        {searchQuery || statusFilter !== 'ALL'
                          ? 'Try adjusting your search query or status filter.'
                          : 'Start tracking your career opportunities by adding your first application.'}
                      </p>
                      <button
                        type="button"
                        className="btn-primary-add"
                        style={{ marginTop: 14 }}
                        onClick={onAddClick}
                      >
                        <PlusIcon size={14} />
                        <span>Add First Application</span>
                      </button>
                    </td>
                  </tr>
                ) : (
                  sortedApplications.map((app) => {
                    const conf = statusStyles[app.status] || statusStyles.Applied;
                    const mono = getMonogram(app.company_name);

                    return (
                      <tr
                        key={app.id}
                        className="app-table-row"
                        onClick={() => onSelectApplication?.(app)}
                      >
                        {/* Company */}
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

                        {/* Position */}
                        <td className="col-position">
                          <span className="position-title-text">{app.job_title}</span>
                        </td>

                        {/* Status badge */}
                        <td className="col-status">
                          <span className={`status-badge ${conf.badgeClass}`}>
                            <span className={`status-dot ${conf.dotClass}`} />
                            {conf.text}
                          </span>
                        </td>

                        {/* Applied Date */}
                        <td className="col-date">
                          <span className="date-text">{formatDate(app.applied_date)}</span>
                        </td>

                        {/* Link */}
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

                        {/* Actions */}
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

          {/* Pagination */}
          {(sortedApplications.length === pageSize || currentPage > 1) && (
            <div className="pagination-bar" style={{ padding: '12px 16px', borderTop: '1px solid var(--af-border-subtle)' }}>
              <button
                type="button"
                className="btn-page"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                ← Prev
              </button>
              <span style={{ fontSize: 13, color: 'var(--af-text-secondary)', padding: '0 12px' }}>
                Page <strong>{currentPage}</strong>
              </span>
              <button
                type="button"
                className="btn-page"
                disabled={sortedApplications.length < pageSize}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                Next →
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
