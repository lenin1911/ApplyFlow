import React from 'react';
import { TargetIcon, MoreHorizontalIcon } from './DashboardIcons';

export default function PlacementGoalCard({ current = 12, target = 20 }) {
  const percentage = Math.min(100, Math.round((current / target) * 100));

  return (
    <div className="placement-goal-card glass-panel">
      {/* Header */}
      <div className="goal-card-header">
        <div className="goal-header-title-group">
          <div className="goal-icon-pill">
            <TargetIcon size={15} />
          </div>
          <div>
            <h3 className="section-title" style={{ fontSize: 14 }}>Placement Goal</h3>
          </div>
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
          }}
          aria-label="Goal options"
        >
          <MoreHorizontalIcon size={15} />
        </button>
      </div>

      {/* Progress label */}
      <div className="goal-stats-row">
        <span style={{ fontSize: 13, color: 'var(--af-text-secondary)' }}>
          {current} / {target} applications
        </span>
        <span className="goal-percentage-badge">{percentage}%</span>
      </div>

      {/* Progress bar */}
      <div className="goal-progress-track">
        <div
          className="goal-progress-fill"
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin="0"
          aria-valuemax="100"
        >
          <div className="progress-glow-head" />
        </div>
      </div>

      {/* Motivational quote block */}
      <div className="goal-quote-block">
        <span className="goal-quote-mark">"</span>
        <span className="goal-quote-text">
          A little progress each day adds up to big results.
        </span>
      </div>
    </div>
  );
}
