import React, { useState } from 'react';

export default function StatusDonutChart({ statusData }) {
  const [hoveredSlice, setHoveredSlice] = useState(null);

  const data = statusData || [
    { label: 'Applied',   count: 14, color: '#38BDF8', subtleColor: 'rgba(56,189,248,0.15)' },
    { label: 'Interview', count: 6,  color: '#818CF8', subtleColor: 'rgba(129,140,248,0.15)' },
    { label: 'Offer',     count: 2,  color: '#10B981', subtleColor: 'rgba(16,185,129,0.15)' },
    { label: 'Rejected',  count: 8,  color: '#F43F5E', subtleColor: 'rgba(244,63,94,0.15)' },
  ];

  const total = data.reduce((acc, curr) => acc + curr.count, 0);

  // Donut geometry
  const size = 155;
  const strokeWidth = 18;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;
  const slices = data.map((item) => {
    const percent = total > 0 ? item.count / total : 0;
    const strokeDasharray = `${percent * circumference} ${circumference}`;
    const strokeDashoffset = -accumulatedPercent * circumference;
    accumulatedPercent += percent;
    return { ...item, percent: Math.round(percent * 100), strokeDasharray, strokeDashoffset };
  });

  return (
    <div className="donut-card glass-panel">
      <div className="donut-card-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 16 }}>🔥</span>
            <h3 className="section-title">Application Status</h3>
          </div>
          <p className="section-subtitle" style={{ marginTop: 2 }}>Pipeline breakdown</p>
        </div>
        <span className="donut-total-badge">{total} total</span>
      </div>

      <div className="donut-content-layout">
        {/* Donut SVG */}
        <div className="donut-chart-container">
          <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            onMouseLeave={() => setHoveredSlice(null)}
          >
            {/* Background ring */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke="rgba(255,255,255,0.05)"
              strokeWidth={strokeWidth}
            />

            {/* Slices */}
            {slices.map((slice, i) => {
              const isHov = hoveredSlice === slice.label;
              return (
                <circle
                  key={i}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="transparent"
                  stroke={slice.color}
                  strokeWidth={isHov ? strokeWidth + 3 : strokeWidth}
                  strokeDasharray={slice.strokeDasharray}
                  strokeDashoffset={slice.strokeDashoffset}
                  strokeLinecap="round"
                  style={{
                    transform: 'rotate(-90deg)',
                    transformOrigin: '50% 50%',
                    cursor: 'pointer',
                    transition: 'all 0.25s cubic-bezier(0.16,1,0.3,1)',
                    filter: isHov ? `drop-shadow(0 0 6px ${slice.color})` : 'none',
                    opacity: hoveredSlice && !isHov ? 0.4 : 1,
                  }}
                  onMouseEnter={() => setHoveredSlice(slice.label)}
                />
              );
            })}
          </svg>

          {/* Center text */}
          <div className="donut-center-info">
            <span className="donut-center-number">
              {hoveredSlice ? data.find((d) => d.label === hoveredSlice)?.count : total}
            </span>
            <span className="donut-center-label">
              {hoveredSlice ? hoveredSlice : 'Total'}
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="donut-legend">
          {slices.map((slice) => {
            const isHov = hoveredSlice === slice.label;
            return (
              <div
                key={slice.label}
                className={`legend-item ${isHov ? 'active' : ''}`}
                onMouseEnter={() => setHoveredSlice(slice.label)}
                onMouseLeave={() => setHoveredSlice(null)}
              >
                <div className="legend-marker" style={{ backgroundColor: slice.color }} />
                <div className="legend-label-col">
                  <span className="legend-name">{slice.label}</span>
                  <span className="legend-percentage">{slice.percent}%</span>
                </div>
                <span className="legend-count">{slice.count}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
