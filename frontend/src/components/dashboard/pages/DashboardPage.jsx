import React from 'react';
import KpiCards from '../KpiCards';
import ActivityChart from '../ActivityChart';
import StatusDonutChart from '../StatusDonutChart';
import RecentApplicationsTable from '../RecentApplicationsTable';
import UpcomingInterviews from '../UpcomingInterviews';
import PlacementGoalCard from '../PlacementGoalCard';

export default function DashboardPage({
  user,
  stats,
  applications,
  loadingApps,
  globalSearch,
  onSearchChange,
  statusFilter,
  onStatusChange,
  currentPage,
  setCurrentPage,
  PAGE_SIZE = 10,
  onSelectApplication,
  onEditApplication,
  onDeleteApplication,
  onAddClick,
  donutData,
  getGreeting,
}) {
  const userName = user?.username || user?.email?.split('@')[0] || 'User';

  return (
    <main className="dashboard-scrollable-content">
      <div className="dashboard-content-max">
        {/* Greeting Band */}
        <div className="dashboard-greeting-band">
          <div className="greeting-left">
            <h1 className="greeting-title">
              {getGreeting?.() || 'Welcome back'}, {userName} <span className="greeting-emoji">👋</span>
            </h1>
            <p className="greeting-subtitle">
              Track your applications, stay consistent, and get placed.
            </p>
          </div>
          {/* Motivational Card */}
          <div className="quote-banner-card">
            <div className="quote-banner-big-text">
              Small<br />Steps<br />Big<br />Opportunities
            </div>
            <div className="quote-banner-caption">
              "Consistency creates results."
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <KpiCards stats={stats} />

        {/* Analytics: Bar Chart + Donut */}
        <section className="dashboard-analytics-grid">
          <div className="grid-col-activity">
            <ActivityChart applications={applications} />
          </div>
          <div className="grid-col-donut">
            <StatusDonutChart statusData={donutData} />
          </div>
        </section>

        {/* Operations: Table + Side Stack */}
        <section className="dashboard-operations-grid">
          <div className="grid-col-table">
            <RecentApplicationsTable
              applications={applications}
              loading={loadingApps}
              searchQuery={globalSearch}
              onSearchChange={onSearchChange}
              statusFilter={statusFilter}
              onStatusChange={onStatusChange}
              onSelectApplication={onSelectApplication}
              onEditApplication={onEditApplication}
              onDeleteApplication={onDeleteApplication}
              onAddClick={onAddClick}
              totalCount={stats?.total}
            />

            {/* Pagination */}
            {(applications.length === PAGE_SIZE || currentPage > 1) && (
              <div className="pagination-bar" style={{ marginTop: 12 }}>
                <button
                  type="button"
                  className="btn-page"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                >
                  ← Prev
                </button>
                <span style={{ fontSize: 13, color: 'var(--af-text-secondary)', padding: '0 12px' }}>
                  Page <strong>{currentPage}</strong>
                </span>
                <button
                  type="button"
                  className="btn-page"
                  disabled={applications.length < PAGE_SIZE}
                  onClick={() => setCurrentPage((p) => p + 1)}
                >
                  Next →
                </button>
              </div>
            )}
          </div>

          <div className="grid-col-side-stack">
            <UpcomingInterviews
              applications={applications}
              onSelectApplication={onSelectApplication}
            />
            <PlacementGoalCard
              current={stats?.total ?? 0}
              target={20}
            />
          </div>
        </section>
      </div>
    </main>
  );
}
