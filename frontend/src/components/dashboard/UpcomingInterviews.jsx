import React from 'react';
import { ChevronRightIcon } from './DashboardIcons';

const companyMonograms = {
  Google:    { bg: 'rgba(66,133,244,0.12)',  color: '#60A5FA', border: 'rgba(96,165,250,0.25)',  initial: 'G' },
  Microsoft: { bg: 'rgba(0,120,215,0.12)',   color: '#38BDF8', border: 'rgba(56,189,248,0.25)',  initial: 'M' },
  Amazon:    { bg: 'rgba(245,158,11,0.12)',  color: '#FBBF24', border: 'rgba(251,191,36,0.22)',  initial: 'A' },
  Zoho:      { bg: 'rgba(244,63,94,0.10)',   color: '#FB7185', border: 'rgba(251,113,133,0.22)', initial: 'Z' },
  Stripe:    { bg: 'rgba(129,140,248,0.12)', color: '#818CF8', border: 'rgba(129,140,248,0.22)', initial: 'S' },
};

export default function UpcomingInterviews() {
  const interviews = [
    {
      id: 'int-1',
      company: 'Google',
      position: 'Software Engineer',
      date: 'Sep 12, 2025',
      time: '10:00 AM',
    },
    {
      id: 'int-2',
      company: 'Microsoft',
      position: 'Backend Developer',
      date: 'Sep 15, 2025',
      time: '2:00 PM',
    },
    {
      id: 'int-3',
      company: 'Zoho',
      position: 'Java Developer',
      date: 'Sep 20, 2025',
      time: '11:00 AM',
    },
  ];

  return (
    <div className="upcoming-interviews-card glass-panel">
      <div className="card-header-flex">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Flame icon */}
          <span style={{ fontSize: 16 }}>🎯</span>
          <h3 className="section-title">Upcoming Interviews</h3>
        </div>
        <button type="button" className="view-all-link" id="interviews-view-all">
          View All
        </button>
      </div>

      <div className="interviews-list">
        {interviews.map((item) => {
          const mono = companyMonograms[item.company] || {
            bg: 'rgba(255,255,255,0.06)',
            color: '#94A3B8',
            border: 'rgba(255,255,255,0.08)',
            initial: item.company.charAt(0),
          };

          return (
            <div key={item.id} id={`interview-item-${item.id}`} className="interview-item">
              {/* Company logo */}
              <div
                className="interview-company-logo"
                style={{ background: mono.bg, color: mono.color, borderColor: mono.border }}
              >
                {mono.initial}
              </div>

              {/* Info */}
              <div className="interview-item-body">
                <span className="interview-company-name">{item.company}</span>
                <span className="interview-position">{item.position}</span>
                <span className="interview-date-time">
                  {item.date} &nbsp;·&nbsp; {item.time}
                </span>
              </div>

              {/* Chevron */}
              <button type="button" className="interview-chevron-btn" aria-label="View interview details">
                <ChevronRightIcon size={15} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
