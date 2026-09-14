import React from 'react';

const companyMonograms = {
  Google:    { bg: 'rgba(66,133,244,0.14)',  color: '#60A5FA', border: 'rgba(96,165,250,0.25)',  initial: 'G' },
  Microsoft: { bg: 'rgba(0,120,215,0.14)',   color: '#38BDF8', border: 'rgba(56,189,248,0.25)',  initial: 'M' },
  Amazon:    { bg: 'rgba(245,158,11,0.14)',  color: '#FBBF24', border: 'rgba(251,191,36,0.22)',  initial: 'A' },
  Zoho:      { bg: 'rgba(244,63,94,0.12)',   color: '#FB7185', border: 'rgba(251,113,133,0.22)', initial: 'Z' },
  Stripe:    { bg: 'rgba(129,140,248,0.14)', color: '#818CF8', border: 'rgba(129,140,248,0.22)', initial: 'S' },
  Meta:      { bg: 'rgba(24,119,242,0.14)',  color: '#60A5FA', border: 'rgba(96,165,250,0.22)',  initial: 'M' },
  Flipkart:  { bg: 'rgba(249,115,22,0.14)',  color: '#FB923C', border: 'rgba(251,146,60,0.22)',  initial: 'F' },
};

const statusMap = {
  Interview: { cls: 'badge-interview dot-interview', label: 'Interview', optCls: 'opt-interview' },
  Applied:   { cls: 'badge-applied dot-applied',     label: 'Applied',   optCls: 'opt-applied'   },
  Offer:     { cls: 'badge-offer dot-offer',         label: 'Offer',     optCls: 'opt-offer'     },
  Rejected:  { cls: 'badge-rejected dot-rejected',   label: 'Rejected',  optCls: 'opt-rejected'  },
};

export default function ApplicationDetailsModal({ application, onClose, onUpdateStatus }) {
  if (!application) return null;

  const mono = companyMonograms[application.company] || {
    bg: 'rgba(255,255,255,0.06)',
    color: '#94A3B8',
    border: 'rgba(255,255,255,0.08)',
    initial: application.company.charAt(0).toUpperCase(),
  };

  const sConf = statusMap[application.status] || statusMap.Applied;

  return (
    <div className="modal-backdrop-overlay" onClick={onClose}>
      <div
        className="app-details-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Application Details"
      >
        {/* Header */}
        <div className="modal-header">
          <div className="detail-company-header">
            <div
              className="detail-company-logo"
              style={{ background: mono.bg, color: mono.color, borderColor: mono.border }}
            >
              {mono.initial}
            </div>
            <div>
              <div className="detail-company-name">{application.company}</div>
              <div className="detail-position">{application.position}</div>
            </div>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        {/* Details */}
        <div className="detail-fields-grid" style={{ marginBottom: 18 }}>
          <div className="detail-field">
            <span className="detail-field-label">Status</span>
            <span className={`status-badge ${sConf.cls.split(' ')[0]}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, width: 'fit-content' }}>
              <span className={`badge-dot ${sConf.cls.split(' ')[1]}`} />
              {sConf.label}
            </span>
          </div>
          <div className="detail-field">
            <span className="detail-field-label">Applied Date</span>
            <span className="detail-field-value">{application.appliedDate}</span>
          </div>
          <div className="detail-field">
            <span className="detail-field-label">Location</span>
            <span className="detail-field-value">{application.location || 'Remote / Hybrid'}</span>
          </div>
          <div className="detail-field">
            <span className="detail-field-label">Department</span>
            <span className="detail-field-value">{application.department || 'Engineering'}</span>
          </div>
        </div>

        {/* Status update */}
        <div className="detail-status-changer">
          <div className="status-changer-label">Update Status</div>
          <div className="status-options-row">
            {['Applied', 'Interview', 'Offer', 'Rejected'].map((st) => {
              const conf = statusMap[st];
              return (
                <button
                  key={st}
                  type="button"
                  className={`status-option-btn ${conf.optCls} ${application.status === st ? 'chosen' : ''}`}
                  onClick={() => onUpdateStatus && onUpdateStatus(application.id, st)}
                >
                  {st}
                </button>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="modal-actions" style={{ marginTop: 22 }}>
          <button type="button" className="btn-modal-cancel" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
