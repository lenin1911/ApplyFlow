import React from 'react';
import { ChevronRightIcon } from './DashboardIcons';

const companyMonograms = {
  Google:    { bg: 'rgba(66,133,244,0.12)',  color: '#60A5FA', border: 'rgba(96,165,250,0.25)'  },
  Microsoft: { bg: 'rgba(0,120,215,0.12)',   color: '#38BDF8', border: 'rgba(56,189,248,0.25)'  },
  Amazon:    { bg: 'rgba(245,158,11,0.12)',  color: '#FBBF24', border: 'rgba(251,191,36,0.22)'  },
  Zoho:      { bg: 'rgba(244,63,94,0.10)',   color: '#FB7185', border: 'rgba(251,113,133,0.22)' },
  Stripe:    { bg: 'rgba(129,140,248,0.12)', color: '#818CF8', border: 'rgba(129,140,248,0.22)' },
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

export default function UpcomingInterviews({ applications = [], onSelectApplication }) {
  // Derive from real data: all applications with status === 'Interview'
  const interviews = applications
    .filter((app) => app.status === 'Interview')
    .slice(0, 3);

  return (
    <div className="upcoming-interviews-card glass-panel">
      <div className="card-header-flex">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 16 }}>🎯</span>
          <h3 className="section-title">Upcoming Interviews</h3>
        </div>
        <span className="count-pill">{interviews.length}</span>
      </div>

      <div className="interviews-list">
        {interviews.length === 0 ? (
          <div style={{ padding: '20px 0', color: 'var(--af-text-dim)', fontSize: 13, textAlign: 'center' }}>
            No interviews in your pipeline yet.
          </div>
        ) : (
          interviews.map((app) => {
            const mono = companyMonograms[app.company_name] || {
              bg: 'rgba(255,255,255,0.06)',
              color: '#94A3B8',
              border: 'rgba(255,255,255,0.08)',
            };
            const initial = (app.company_name || 'A').charAt(0).toUpperCase();

            return (
              <div
                key={app.id}
                id={`interview-item-${app.id}`}
                className="interview-item"
                onClick={() => onSelectApplication?.(app)}
                style={{ cursor: 'pointer' }}
              >
                {/* Company logo */}
                <div
                  className="interview-company-logo"
                  style={{ background: mono.bg, color: mono.color, borderColor: mono.border }}
                >
                  {initial}
                </div>

                {/* Info */}
                <div className="interview-item-body">
                  <span className="interview-company-name">{app.company_name}</span>
                  <span className="interview-position">{app.job_title}</span>
                  <span className="interview-date-time">
                    Applied {formatDate(app.applied_date)}
                  </span>
                </div>

                {/* Chevron */}
                <button type="button" className="interview-chevron-btn" aria-label="View interview details">
                  <ChevronRightIcon size={15} />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
