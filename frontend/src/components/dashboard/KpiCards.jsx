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

export default function KpiCards({ stats }) {
  const cards = [
    {
      id: 'total',
      label: 'Total Applications',
      value: stats?.total ?? 28,
      trend: '+12%',
      trendLabel: 'from last month',
      trendPositive: true,
      icon: <ApplicationsIcon size={18} />,
      accentClass: 'accent-orange',
    },
    {
      id: 'interviews',
      label: 'Interviews',
      value: stats?.interviews ?? 6,
      trend: '+50%',
      trendLabel: 'from last month',
      trendPositive: true,
      icon: <InterviewsIcon size={18} />,
      accentClass: 'accent-indigo',
    },
    {
      id: 'offers',
      label: 'Offers',
      value: stats?.offers ?? 2,
      trend: '+100%',
      trendLabel: 'from last month',
      trendPositive: true,
      icon: <CheckCircleIcon size={18} />,
      accentClass: 'accent-emerald',
    },
    {
      id: 'rejected',
      label: 'Rejected',
      value: stats?.rejected ?? 8,
      trend: '-20%',
      trendLabel: 'from last month',
      trendPositive: false,
      icon: <XCircleIcon size={18} />,
      accentClass: 'accent-rose',
    },
  ];

  return (
    <section className="kpi-grid" aria-label="Key Performance Indicators">
      {cards.map((card) => (
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
              <span className={`kpi-trend-badge ${card.trendPositive ? 'trend-up' : 'trend-down'}`}>
                {card.trendPositive ? <TrendUpIcon size={11} /> : <TrendDownIcon size={11} />}
                <span>{card.trend}</span>
              </span>
              <span style={{ fontSize: 11, color: 'var(--af-text-dim)', marginLeft: 6 }}>
                {card.trendLabel}
              </span>
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}
