import React from 'react';
import {
  ApplicationsIcon,
  InterviewsIcon,
  CheckCircleIcon,
  XCircleIcon,
  TrendUpIcon,
  TrendDownIcon,
  MoreHorizontalIcon,
} from './DashboardIcons';

/**
 * stats shape (from GET /applications/stats):
 *   { total, Applied, Interview, Offer, Rejected }
 */
export default function KpiCards({ stats }) {
  const cards = [
    {
      id: 'total',
      label: 'Total Applications',
      value: stats?.total ?? 0,
      icon: <ApplicationsIcon size={18} />,
      accentClass: 'accent-orange',
    },
    {
      id: 'interviews',
      label: 'Interviews',
      value: stats?.Interview ?? 0,
      icon: <InterviewsIcon size={18} />,
      accentClass: 'accent-indigo',
    },
    {
      id: 'offers',
      label: 'Offers',
      value: stats?.Offer ?? 0,
      icon: <CheckCircleIcon size={18} />,
      accentClass: 'accent-emerald',
    },
    {
      id: 'rejected',
      label: 'Rejected',
      value: stats?.Rejected ?? 0,
      icon: <XCircleIcon size={18} />,
      accentClass: 'accent-rose',
    },
  ];

  const interviewRate = stats?.total > 0
    ? Math.round(((stats?.Interview ?? 0) / stats.total) * 100)
    : 0;
  const offerRate = stats?.total > 0
    ? Math.round(((stats?.Offer ?? 0) / stats.total) * 100)
    : 0;
  const rejectedRate = stats?.total > 0
    ? Math.round(((stats?.Rejected ?? 0) / stats.total) * 100)
    : 0;
  const appliedRate = stats?.total > 0
    ? Math.round(((stats?.Applied ?? 0) / stats.total) * 100)
    : 0;

  const subLabels = [
    `${appliedRate}% pending response`,
    `${interviewRate}% interview rate`,
    `${offerRate}% offer rate`,
    `${rejectedRate}% rejection rate`,
  ];

  const trendPositive = [true, true, true, false];

  return (
    <section className="kpi-grid" aria-label="Key Performance Indicators">
      {cards.map((card, idx) => (
        <div key={card.id} id={`kpi-${card.id}`} className={`kpi-card ${card.accentClass}`}>
          <div className="kpi-card-header">
            <span className="kpi-label">{card.label}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div className="kpi-icon-wrapper" aria-hidden="true">
                {card.icon}
              </div>
              <button
                type="button"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--af-text-dim)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  padding: 0,
                }}
                aria-label="More options"
              >
                <MoreHorizontalIcon size={14} />
              </button>
            </div>
          </div>

          <div>
            <span className="kpi-value">{card.value}</span>
            <div className="kpi-trend-row" style={{ marginTop: 6 }}>
              <span className={`kpi-trend-badge ${trendPositive[idx] ? 'trend-up' : 'trend-down'}`}>
                {trendPositive[idx] ? <TrendUpIcon size={11} /> : <TrendDownIcon size={11} />}
                <span>{subLabels[idx]}</span>
              </span>
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}
