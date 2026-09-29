import React, { useState, useEffect, useCallback } from 'react';
import { applicationsApi } from '../../../services/api';
import KpiCards from '../KpiCards';
import ActivityChart from '../ActivityChart';
import StatusDonutChart from '../StatusDonutChart';
import { RefreshIcon } from '../DashboardIcons';

function buildDonutData(stats) {
  return [
    { label: 'Applied',   count: stats?.Applied   ?? 0, color: '#38BDF8', subtleColor: 'rgba(56,189,248,0.15)' },
    { label: 'Interview', count: stats?.Interview  ?? 0, color: '#818CF8', subtleColor: 'rgba(129,140,248,0.15)' },
    { label: 'Offer',     count: stats?.Offer      ?? 0, color: '#10B981', subtleColor: 'rgba(16,185,129,0.15)' },
    { label: 'Rejected',  count: stats?.Rejected   ?? 0, color: '#F43F5E', subtleColor: 'rgba(244,63,94,0.15)' },
  ];
}

export default function AnalyticsPage({ initialStats, initialApplications, refreshTrigger }) {
  const [stats, setStats] = useState(initialStats || null);
  const [applications, setApplications] = useState(initialApplications || []);
  const [loading, setLoading] = useState(false);

  const fetchAnalyticsData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsData, appsData] = await Promise.all([
        applicationsApi.getStats().catch(() => null),
        applicationsApi.list({ limit: 100 }).catch(() => []),
      ]);
      if (statsData) setStats(statsData);
      if (Array.isArray(appsData)) setApplications(appsData);
    } catch (err) {
      console.warn('Failed to load analytics data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData, refreshTrigger]);

  const total = stats?.total ?? 0;
  const appliedCount = stats?.Applied ?? 0;
  const interviewCount = stats?.Interview ?? 0;
  const offerCount = stats?.Offer ?? 0;
  const rejectedCount = stats?.Rejected ?? 0;

  const interviewRate = total > 0 ? Math.round((interviewCount / total) * 100) : 0;
  const offerRate = total > 0 ? Math.round((offerCount / total) * 100) : 0;
  const rejectionRate = total > 0 ? Math.round((rejectedCount / total) * 100) : 0;
  const activeCount = appliedCount + interviewCount;

  const donutData = buildDonutData(stats);

  return (
    <main className="dashboard-scrollable-content">
      <div className="dashboard-content-max">
        {/* Header */}
        <div className="page-header-banner">
          <div className="page-header-info">
            <div className="page-title-row">
              <h1 className="page-main-title">Analytics & Insights</h1>
              <span className="count-pill">Real-time Metrics</span>
            </div>
            <p className="page-main-subtitle">
              Comprehensive pipeline metrics, success rates, and application velocity for your job search.
            </p>
          </div>
          <div className="page-header-actions">
            <button
              type="button"
              className="btn-refresh-pill"
              onClick={fetchAnalyticsData}
              disabled={loading}
              title="Refresh metrics"
            >
              <RefreshIcon size={14} />
              <span>{loading ? 'Refreshing…' : 'Refresh Metrics'}</span>
            </button>
          </div>
        </div>

        {/* Top KPI Cards */}
        <KpiCards stats={stats} />

        {/* Funnel & Conversion Rates Card */}
        <div className="analytics-funnel-card glass-panel" style={{ marginTop: 20 }}>
          <div className="card-header-flex">
            <div>
              <h3 className="section-title">Application Conversion Funnel</h3>
              <p className="section-subtitle">
                Progression through hiring stages from initial submission to job offer.
              </p>
            </div>
            <span className="count-pill">{total} Total Tracked</span>
          </div>

          {/* Multi-segment visual bar */}
          <div className="funnel-progress-container" style={{ marginTop: 16 }}>
            <div className="funnel-bar">
              {total > 0 ? (
                <>
                  <div
                    className="funnel-seg seg-applied"
                    style={{ width: `${(appliedCount / total) * 100}%` }}
                    title={`Applied: ${appliedCount} (${Math.round((appliedCount / total) * 100)}%)`}
                  />
                  <div
                    className="funnel-seg seg-interview"
                    style={{ width: `${(interviewCount / total) * 100}%` }}
                    title={`Interview: ${interviewCount} (${Math.round((interviewCount / total) * 100)}%)`}
                  />
                  <div
                    className="funnel-seg seg-offer"
                    style={{ width: `${(offerCount / total) * 100}%` }}
                    title={`Offer: ${offerCount} (${Math.round((offerCount / total) * 100)}%)`}
                  />
                  <div
                    className="funnel-seg seg-rejected"
                    style={{ width: `${(rejectedCount / total) * 100}%` }}
                    title={`Rejected: ${rejectedCount} (${Math.round((rejectedCount / total) * 100)}%)`}
                  />
                </>
              ) : (
                <div className="funnel-seg seg-empty" style={{ width: '100%' }} />
              )}
            </div>

            {/* Funnel metrics 4-column */}
            <div className="funnel-stats-row">
              <div className="funnel-metric-box">
                <span className="dot-indicator dot-applied" />
                <span className="metric-name">Applied</span>
                <strong className="metric-num">{appliedCount}</strong>
                <span className="metric-pct">{total > 0 ? Math.round((appliedCount / total) * 100) : 0}%</span>
              </div>
              <div className="funnel-metric-box">
                <span className="dot-indicator dot-interview" />
                <span className="metric-name">Interviews</span>
                <strong className="metric-num">{interviewCount}</strong>
                <span className="metric-pct">{interviewRate}%</span>
              </div>
              <div className="funnel-metric-box">
                <span className="dot-indicator dot-offer" />
                <span className="metric-name">Offers</span>
                <strong className="metric-num">{offerCount}</strong>
                <span className="metric-pct">{offerRate}%</span>
              </div>
              <div className="funnel-metric-box">
                <span className="dot-indicator dot-rejected" />
                <span className="metric-name">Rejected</span>
                <strong className="metric-num">{rejectedCount}</strong>
                <span className="metric-pct">{rejectionRate}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <section className="dashboard-analytics-grid" style={{ marginTop: 20 }}>
          <div className="grid-col-activity">
            <ActivityChart applications={applications} />
          </div>
          <div className="grid-col-donut">
            <StatusDonutChart statusData={donutData} />
          </div>
        </section>

        {/* Performance Insights Row */}
        <div className="performance-insights-grid" style={{ marginTop: 20 }}>
          <div className="insight-card glass-panel">
            <span className="insight-title">Interview Conversion Rate</span>
            <div className="insight-value-row">
              <span className="insight-value">{interviewRate}%</span>
              <span className="insight-badge badge-interview">
                {interviewCount} / {total}
              </span>
            </div>
            <p className="insight-description">
              Percentage of applied roles that reached an interview or screening round.
            </p>
          </div>

          <div className="insight-card glass-panel">
            <span className="insight-title">Offer Conversion Rate</span>
            <div className="insight-value-row">
              <span className="insight-value">{offerRate}%</span>
              <span className="insight-badge badge-offer">
                {offerCount} {offerCount === 1 ? 'Offer' : 'Offers'}
              </span>
            </div>
            <p className="insight-description">
              Ratio of total applications that translated into finalized job offers.
            </p>
          </div>

          <div className="insight-card glass-panel">
            <span className="insight-title">Active In-Flight Pipeline</span>
            <div className="insight-value-row">
              <span className="insight-value">{activeCount}</span>
              <span className="insight-badge badge-applied">
                In progress
              </span>
            </div>
            <p className="insight-description">
              Applications actively pending decision or in ongoing interview discussions.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
