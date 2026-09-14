import React, { useState } from 'react';
import { TrendUpIcon, AnalyticsIcon } from './DashboardIcons';

export default function ActivityChart() {
  const [activeFilter, setActiveFilter] = useState('30d');
  const [hoveredIndex, setHoveredIndex] = useState(null);

  /* 30 days activity — bar chart data matching the image feel */
  const activityData30 = [
    { day: 'Aug 10', count: 2 },
    { day: 'Aug 13', count: 1 },
    { day: 'Aug 16', count: 4 },
    { day: 'Aug 19', count: 2 },
    { day: 'Aug 22', count: 6 },
    { day: 'Aug 25', count: 3 },
    { day: 'Aug 28', count: 8 },
    { day: 'Aug 31', count: 5 },
    { day: 'Sep 03', count: 11 },
    { day: 'Sep 05', count: 7 },
    { day: 'Sep 07', count: 9 },
    { day: 'Sep 09', count: 6 },
    { day: 'Sep 11', count: 4 },
    { day: 'Sep 12', count: 8 },
    { day: 'Sep 13', count: 5 },
  ];

  const activityData7 = activityData30.slice(-7);
  const activityDataQ = activityData30;

  const data = activeFilter === '7d'
    ? activityData7
    : activeFilter === '90d'
      ? activityDataQ
      : activityData30;

  // SVG dimensions
  const svgW = 640;
  const svgH = 200;
  const padX  = 34;
  const padY  = 20;
  const padB  = 28;
  const graphW = svgW - padX * 2;
  const graphH = svgH - padY - padB;

  const maxVal = Math.max(...data.map((d) => d.count), 1);
  const barCount = data.length;
  const barGap   = 5;
  const barW     = Math.max(10, (graphW / barCount) - barGap);

  // Show every nth label so they don't overlap
  const labelStep = barCount <= 8 ? 1 : barCount <= 15 ? 2 : 3;

  const yLabels = [0, Math.round(maxVal * 0.25), Math.round(maxVal * 0.5), Math.round(maxVal * 0.75), maxVal];

  return (
    <div className="activity-card glass-panel">
      <div className="activity-header">
        <div className="activity-title-group">
          <div className="activity-title-row">
            <AnalyticsIcon size={16} style={{ color: 'var(--af-primary)' }} />
            <h3 className="section-title">Application Activity</h3>
          </div>
          <p className="section-subtitle">Your application progress over time</p>
        </div>

        {/* Period selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            id="period-selector"
            type="button"
            className="period-select-btn"
            onClick={() => {
              const opts = ['7d', '30d', '90d'];
              const next = opts[(opts.indexOf(activeFilter) + 1) % opts.length];
              setActiveFilter(next);
            }}
          >
            {activeFilter === '7d' ? 'Last 7 Days' : activeFilter === '30d' ? 'Last 30 Days' : 'Quarter'}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="6 9 12 15 18 9" /></svg>
          </button>
        </div>
      </div>

      {/* Bar Chart SVG */}
      <div className="bar-chart-wrapper" style={{ position: 'relative' }}>
        <svg
          viewBox={`0 0 ${svgW} ${svgH}`}
          className="bar-chart-svg"
          preserveAspectRatio="none"
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <defs>
            <linearGradient id="barGradDefault" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#FB923C" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#EA6A0A" stopOpacity="0.55" />
            </linearGradient>
            <linearGradient id="barGradHover" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#FCD34D" stopOpacity="1" />
              <stop offset="100%" stopColor="#F97316" stopOpacity="0.85" />
            </linearGradient>
          </defs>

          {/* Y-axis grid lines */}
          {yLabels.map((val, i) => {
            const y = padY + graphH - (val / maxVal) * graphH;
            return (
              <g key={i}>
                <line
                  x1={padX} y1={y}
                  x2={svgW - padX} y2={y}
                  stroke="rgba(255,255,255,0.055)"
                  strokeDasharray={val === 0 ? '0' : '3 5'}
                />
                <text
                  x={padX - 8}
                  y={y + 4}
                  fill="rgba(156,163,175,0.55)"
                  fontSize="10"
                  textAnchor="end"
                  fontFamily="Inter, sans-serif"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* Bars */}
          {data.map((d, i) => {
            const slotW  = graphW / barCount;
            const x      = padX + i * slotW + (slotW - barW) / 2;
            const barH   = Math.max(4, (d.count / maxVal) * graphH);
            const y      = padY + graphH - barH;
            const isHov  = hoveredIndex === i;

            return (
              <g
                key={i}
                onMouseEnter={() => setHoveredIndex(i)}
                style={{ cursor: 'pointer' }}
              >
                {/* Hover background */}
                {isHov && (
                  <rect
                    x={padX + i * slotW}
                    y={padY}
                    width={slotW}
                    height={graphH}
                    fill="rgba(249,115,22,0.05)"
                    rx="2"
                  />
                )}
                {/* Bar */}
                <rect
                  x={x}
                  y={y}
                  width={barW}
                  height={barH}
                  rx="3"
                  fill={isHov ? 'url(#barGradHover)' : 'url(#barGradDefault)'}
                  style={{ transition: 'all 0.15s ease' }}
                />
                {/* Glow on hover */}
                {isHov && (
                  <rect
                    x={x}
                    y={y}
                    width={barW}
                    height={barH}
                    rx="3"
                    fill="none"
                    stroke="#FB923C"
                    strokeWidth="1"
                    style={{ filter: 'blur(2px)', opacity: 0.6 }}
                  />
                )}
                {/* X label */}
                {i % labelStep === 0 && (
                  <text
                    x={x + barW / 2}
                    y={svgH - 5}
                    fill="rgba(156,163,175,0.65)"
                    fontSize="10"
                    textAnchor="middle"
                    fontFamily="Inter, sans-serif"
                  >
                    {d.day}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Floating Tooltip */}
        {hoveredIndex !== null && (() => {
          const d = data[hoveredIndex];
          const slotW = 100 / data.length;
          const leftPct = (hoveredIndex + 0.5) * slotW;
          const barH = (d.count / maxVal) * 100;
          return (
            <div
              className="chart-floating-tooltip"
              style={{ left: `${leftPct}%`, top: `${100 - barH - 8}%` }}
            >
              <div className="tooltip-date">{d.day}</div>
              <div className="tooltip-val">{d.count} application{d.count !== 1 ? 's' : ''}</div>
            </div>
          );
        })()}
      </div>

      {/* Footer */}
      <div className="activity-footer">
        <div className="activity-metric-pill">
          <span className="dot-indicator pulse" />
          <span className="pill-text">Peak: Sep 03 (11 submissions)</span>
        </div>
        <div className="activity-metric-summary">
          <TrendUpIcon size={13} className="text-orange" />
          <span>Avg. 5.6 applications / week</span>
        </div>
      </div>
    </div>
  );
}
