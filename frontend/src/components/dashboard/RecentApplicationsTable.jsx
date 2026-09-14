import React, { useState } from 'react';
import {
  SearchIcon,
  EyeIcon,
  EditIcon,
  TrashIcon,
} from './DashboardIcons';

export default function RecentApplications({ applications, onSelectApplication, onAddClick }) {
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Status badge styling
  const statusStyles = {
    Interview: { badgeClass: 'badge-interview', dotClass: 'dot-interview', text: 'Interview' },
    Applied:   { badgeClass: 'badge-applied',   dotClass: 'dot-applied',   text: 'Applied'   },
    Rejected:  { badgeClass: 'badge-rejected',  dotClass: 'dot-rejected',  text: 'Rejected'  },
    Offer:     { badgeClass: 'badge-offer',     dotClass: 'dot-offer',     text: 'Offer'     },
  };

  // Company monogram config
  const companyMonograms = {
    Google:    { bg: 'rgba(66,133,244,0.12)',  color: '#60A5FA', border: 'rgba(96,165,250,0.25)',  initial: 'G' },
    Microsoft: { bg: 'rgba(0,120,215,0.12)',   color: '#38BDF8', border: 'rgba(56,189,248,0.25)',  initial: 'M' },
    Zoho:      { bg: 'rgba(244,63,94,0.10)',   color: '#FB7185', border: 'rgba(251,113,133,0.22)', initial: 'Z' },
    Amazon:    { bg: 'rgba(245,158,11,0.12)',  color: '#FBBF24', border: 'rgba(251,191,36,0.22)',  initial: 'A' },
    Stripe:    { bg: 'rgba(129,140,248,0.12)', color: '#818CF8', border: 'rgba(129,140,248,0.22)', initial: 'S' },
    Meta:      { bg: 'rgba(24,119,242,0.12)',  color: '#60A5FA', border: 'rgba(96,165,250,0.22)',  initial: 'M' },
    Flipkart:  { bg: 'rgba(249,115,22,0.12)',  color: '#FB923C', border: 'rgba(251,146,60,0.22)',  initial: 'F' },
  };

  const filteredApps = applications.filter((app) => {
    const matchStatus = filterStatus === 'ALL' || app.status.toUpperCase() === filterStatus;
    const matchSearch =
      app.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.position.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="recent-apps-card glass-panel">
      {/* Header */}
      <div className="apps-table-header">
        <div className="apps-header-left">
          <h3 className="section-title">Recent Applications</h3>
          <span className="count-pill">{filteredApps.length} entries</span>
        </div>
        <div className="apps-header-actions">
          {/* Status filter tabs */}
          <div className="status-tabs" role="tablist">
            {['ALL', 'INTERVIEW', 'OFFER', 'APPLIED', 'REJECTED'].map((tab) => (
              <button
                key={tab}
                type="button"
                id={`status-tab-${tab.toLowerCase()}`}
                role="tab"
                className={`status-tab-btn ${filterStatus === tab ? 'active' : ''}`}
                onClick={() => setFilterStatus(tab)}
              >
                {tab === 'ALL' ? 'All' : tab.charAt(0) + tab.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          {/* Inline search */}
          <div className="table-inline-search">
            <SearchIcon size={13} className="search-icon-muted" />
            <input
              id="table-search-input"
              type="text"
              placeholder="Filter company or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="table-search-input"
            />
          </div>

          <button type="button" className="view-all-link">View All</button>
        </div>
      </div>

      {/* Table */}
      <div className="table-responsive-container">
        <table className="apps-table">
          <thead>
            <tr>
              <th scope="col" className="col-company">Company</th>
              <th scope="col" className="col-position">Position</th>
              <th scope="col" className="col-status">Status</th>
              <th scope="col" className="col-date">Applied Date</th>
              <th scope="col" className="col-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredApps.length === 0 ? (
              <tr>
                <td colSpan="5" className="table-empty-row">
                  No applications match your criteria.
                </td>
              </tr>
            ) : (
              filteredApps.map((app) => {
                const conf = statusStyles[app.status] || statusStyles.Applied;
                const mono = companyMonograms[app.company] || {
                  bg: 'rgba(255,255,255,0.06)',
                  color: '#94A3B8',
                  border: 'rgba(255,255,255,0.08)',
                  initial: app.company.charAt(0).toUpperCase(),
                };

                return (
                  <tr
                    key={app.id}
                    className="app-table-row"
                    onClick={() => onSelectApplication && onSelectApplication(app)}
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
                        <div className="company-name-group">
                          <span className="company-name-text">{app.company}</span>
                          <span className="company-location-sub">{app.location || 'Remote / Hybrid'}</span>
                        </div>
                      </div>
                    </td>

                    {/* Position */}
                    <td className="col-position">
                      <span className="position-text">{app.position}</span>
                      <span className="dept-tag">{app.department || 'Engineering'}</span>
                    </td>

                    {/* Status */}
                    <td className="col-status">
                      <span className={`status-badge ${conf.badgeClass}`}>
                        <span className={`badge-dot ${conf.dotClass}`} />
                        <span className="badge-label">{conf.text}</span>
                      </span>
                    </td>

                    {/* Date */}
                    <td className="col-date">
                      <span className="date-primary">{app.appliedDate}</span>
                      <span className="date-relative">{app.relativeTime || 'Recently'}</span>
                    </td>

                    {/* Actions: View / Edit / Delete */}
                    <td
                      className="col-actions"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="action-button-group">
                        <button
                          type="button"
                          id={`view-btn-${app.id}`}
                          className="btn-table-action"
                          title="View application"
                          onClick={() => onSelectApplication && onSelectApplication(app)}
                        >
                          <EyeIcon size={14} />
                        </button>
                        <button
                          type="button"
                          id={`edit-btn-${app.id}`}
                          className="btn-table-action"
                          title="Edit application"
                          onClick={() => onSelectApplication && onSelectApplication(app)}
                        >
                          <EditIcon size={14} />
                        </button>
                        <button
                          type="button"
                          id={`delete-btn-${app.id}`}
                          className="btn-table-action danger"
                          title="Delete application"
                          onClick={() => {/* handled by parent */}}
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

      {/* Footer */}
      <div className="table-footer-bar">
        <span className="footer-subtext">
          Showing {filteredApps.length} of {applications.length} applications
        </span>
        <button type="button" className="btn-secondary-link" onClick={onAddClick}>
          + Add New Application
        </button>
      </div>
    </div>
  );
}
