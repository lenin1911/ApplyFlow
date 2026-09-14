import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import KpiCards from './KpiCards';
import ActivityChart from './ActivityChart';
import StatusDonutChart from './StatusDonutChart';
import RecentApplicationsTable from './RecentApplicationsTable';
import UpcomingInterviews from './UpcomingInterviews';
import PlacementGoalCard from './PlacementGoalCard';
import AddApplicationModal from './AddApplicationModal';
import ApplicationDetailsModal from './ApplicationDetailsModal';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function ApplyFlowDashboard({ currentUser, onOpenAuthModal, onSignOut }) {
  const [activeTab, setActiveTab]               = useState('dashboard');
  const [globalSearch, setGlobalSearch]         = useState('');
  const [isAddModalOpen, setIsAddModalOpen]     = useState(false);
  const [selectedApplication, setSelectedApp]  = useState(null);
  const [theme, setTheme]                       = useState('dark');

  // Apply theme to <html> element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const handleToggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  // Initial application data matching the image
  const [applications, setApplications] = useState([
    {
      id: 'app-1',
      company:      'Google',
      position:     'Software Engineer',
      status:       'Interview',
      appliedDate:  'Sep 10, 2025',
      relativeTime: '3 days ago',
      location:     'Mountain View / Hybrid',
      department:   'Cloud Core Systems',
    },
    {
      id: 'app-2',
      company:      'Microsoft',
      position:     'Backend Developer',
      status:       'Applied',
      appliedDate:  'Sep 08, 2025',
      relativeTime: '5 days ago',
      location:     'Redmond, WA',
      department:   'Azure Distributed',
    },
    {
      id: 'app-3',
      company:      'Amazon',
      position:     'SDE Intern',
      status:       'Offer',
      appliedDate:  'Sep 05, 2025',
      relativeTime: '8 days ago',
      location:     'Seattle, WA',
      department:   'AWS Serverless',
    },
    {
      id: 'app-4',
      company:      'Zoho',
      position:     'Java Developer',
      status:       'Rejected',
      appliedDate:  'Sep 01, 2025',
      relativeTime: '12 days ago',
      location:     'Chennai / On-site',
      department:   'Zoho Creator Platform',
    },
    {
      id: 'app-5',
      company:      'Flipkart',
      position:     'Software Engineer',
      status:       'Applied',
      appliedDate:  'Aug 28, 2025',
      relativeTime: '16 days ago',
      location:     'Bengaluru / Hybrid',
      department:   'Commerce Platform',
    },
  ]);

  const handleAddApplication = (newApp) => {
    setApplications((prev) => [newApp, ...prev]);
  };

  const handleUpdateStatus = (appId, newStatus) => {
    setApplications((prev) =>
      prev.map((app) => (app.id === appId ? { ...app, status: newStatus } : app))
    );
    if (selectedApplication?.id === appId) {
      setSelectedApp((prev) => ({ ...prev, status: newStatus }));
    }
  };

  // KPI stats
  const addedCount = Math.max(0, applications.length - 5);
  const kpiStats = {
    total:      28 + addedCount,
    interviews: 6  + applications.filter((a) => !['app-1'].includes(a.id) && a.status === 'Interview').length,
    offers:     2  + applications.filter((a) => !['app-3'].includes(a.id) && a.status === 'Offer').length,
    rejected:   8  + applications.filter((a) => !['app-4'].includes(a.id) && a.status === 'Rejected').length,
  };

  const statusDonutData = [
    { label: 'Applied',   count: 14, color: '#38BDF8', subtleColor: 'rgba(56,189,248,0.15)' },
    { label: 'Interview', count: kpiStats.interviews, color: '#818CF8', subtleColor: 'rgba(129,140,248,0.15)' },
    { label: 'Offer',     count: kpiStats.offers,     color: '#10B981', subtleColor: 'rgba(16,185,129,0.15)' },
    { label: 'Rejected',  count: kpiStats.rejected,   color: '#F43F5E', subtleColor: 'rgba(244,63,94,0.15)' },
  ];

  const userName = currentUser?.displayName || 'Lenin';

  return (
    <div className="applyflow-app-shell">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        currentUser={currentUser}
        onOpenAuthModal={onOpenAuthModal}
        onSignOut={onSignOut}
        theme={theme}
      />

      {/* Main area */}
      <div className="applyflow-main-viewport">
        {/* Top Header */}
        <Header
          userName={userName}
          onAddApplication={() => setIsAddModalOpen(true)}
          searchValue={globalSearch}
          onSearch={setGlobalSearch}
          currentUser={currentUser}
          onOpenAuthModal={onOpenAuthModal}
          onSignOut={onSignOut}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          activeTab={activeTab}
        />

        {/* Scrollable Dashboard Body */}
        <main className="dashboard-scrollable-content">
          <div className="dashboard-content-max">

            {/* Greeting Band */}
            <div className="dashboard-greeting-band">
              <div className="greeting-left">
                <h1 className="greeting-title">
                  {getGreeting()}, {userName} <span className="greeting-emoji">👋</span>
                </h1>
                <p className="greeting-subtitle">
                  Track your applications, stay consistent, and get placed.
                </p>
              </div>

              {/* Quote / Motivation Card */}
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
            <KpiCards stats={kpiStats} />

            {/* Analytics: Bar Chart + Donut */}
            <section className="dashboard-analytics-grid">
              <div className="grid-col-activity">
                <ActivityChart />
              </div>
              <div className="grid-col-donut">
                <StatusDonutChart statusData={statusDonutData} />
              </div>
            </section>

            {/* Operations: Table + Side Stack */}
            <section className="dashboard-operations-grid">
              <div className="grid-col-table">
                <RecentApplicationsTable
                  applications={applications}
                  onSelectApplication={(app) => setSelectedApp(app)}
                  onAddClick={() => setIsAddModalOpen(true)}
                />
              </div>

              <div className="grid-col-side-stack">
                <UpcomingInterviews />
                <PlacementGoalCard
                  current={12 + addedCount}
                  target={20}
                />
              </div>
            </section>

          </div>
        </main>
      </div>

      {/* Add Application Modal */}
      <AddApplicationModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddApplication}
      />

      {/* View/Edit Application Modal */}
      <ApplicationDetailsModal
        application={selectedApplication}
        onClose={() => setSelectedApp(null)}
        onUpdateStatus={handleUpdateStatus}
      />
    </div>
  );
}
