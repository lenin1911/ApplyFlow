import React, { useState, useMemo } from 'react';
import { TrendUpIcon, AnalyticsIcon } from './DashboardIcons';

/**
 * Build a bar chart dataset from real application objects.
 * Groups by applied_date into N-day buckets going back `days` days from today.
 */
function buildChartData(applications, days) {
  const now  = new Date();
  const bins = [];

  // Create one bucket per day
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0]; // YYYY-MM-DD
    bins.push({ key, day: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }), count: 0 });
  }

  const bucketMap = {};
  bins.forEach((b) => { bucketMap[b.key] = b; });

  applications.forEach((app) => {
    if (!app.applied_date) return;
    const appKey = new Date(app.applied_date).toISOString().split('T')[0];
    if (bucketMap[appKey]) bucketMap[appKey].count += 1;
  });

  // Collapse to show at most ~15 data points (aggregate by groups if many days)
  if (days <= 30) return bins;

  // For 90 days group every 6 days → ~15 bars
  const grouped = [];
  const step = Math.ceil(bins.length / 15);
  for (let i = 0; i < bins.length; i += step) {
    const chunk = bins.slice(i, i + step);
    grouped.push({
      day: chunk[0].day,
      count: chunk.reduce((s, b) => s + b.count, 0),
    });
  }
  return grouped;
}

export default function ActivityChart({ applications = [] }) {
  const [activeFilter, setActiveFilter] = useState('30d');
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const days = activeFilter === '7d' ? 7 : activeFilter === '90d' ? 90 : 30;
  const data = useMemo(() => buildChartData(applications, days), [applications, days]);

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

  const labelStep = barCount <= 8 ? 1 : barCount <= 15 ? 2 : 3;
  const yLabels = [0, Math.round(maxVal * 0.25), Math.round(maxVal * 0.5), Math.round(maxVal * 0.75), maxVal];

  // Compute footer stats from real data
  const peak = data.reduce((best, d) => (d.count > (best?.count ?? -1) ? d : best), null);
  const totalInPeriod = data.reduce((s, d) => s + d.count, 0);
  const avgPerWeek = days > 0 ? ((totalInPeriod / days) * 7).toFixed(1) : 0;

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
          <span className="pill-text">
            {peak && peak.count > 0
              ? `Peak: ${peak.day} (${peak.count} submission${peak.count !== 1 ? 's' : ''})`
              : 'No activity yet in this period'}
          </span>
        </div>
        <div className="activity-metric-summary">
          <TrendUpIcon size={13} className="text-orange" />
          <span>Avg. {avgPerWeek} applications / week</span>
        </div>
      </div>
    </div>
  );
}
