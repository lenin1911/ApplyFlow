import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { applicationsApi } from '../../services/api';

import Sidebar from './Sidebar';
import Header from './Header';
import AddApplicationModal from './AddApplicationModal';
import ApplicationDetailsModal from './ApplicationDetailsModal';

// Dedicated tab pages
import DashboardPage from './pages/DashboardPage';
import ApplicationsPage from './pages/ApplicationsPage';
import InterviewsPage from './pages/InterviewsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';

// Reuse existing top-level modals for Edit and Delete
import ApplicationModal from '../ApplicationModal';
import DeleteConfirmModal from '../DeleteConfirmModal';

const VALID_TABS = ['dashboard', 'applications', 'interviews', 'analytics', 'profile', 'settings'];

function getTabFromPathname() {
  if (typeof window === 'undefined') return 'dashboard';
  const raw = window.location.pathname.replace(/^\/+|\/+$/g, '').toLowerCase();
  return VALID_TABS.includes(raw) ? raw : 'dashboard';
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

// Donut chart data shape from stats API
function buildDonutData(stats) {
  return [
    { label: 'Applied',   count: stats?.Applied   ?? 0, color: '#38BDF8', subtleColor: 'rgba(56,189,248,0.15)' },
    { label: 'Interview', count: stats?.Interview  ?? 0, color: '#818CF8', subtleColor: 'rgba(129,140,248,0.15)' },
    { label: 'Offer',     count: stats?.Offer      ?? 0, color: '#10B981', subtleColor: 'rgba(16,185,129,0.15)' },
    { label: 'Rejected',  count: stats?.Rejected   ?? 0, color: '#F43F5E', subtleColor: 'rgba(244,63,94,0.15)' },
  ];
}

export default function ApplyFlowDashboard() {
  const { user, logout } = useAuth();

  // ─── UI / Route state ───
  const [activeTab, setActiveTab] = useState(() => {
    const fromPath = getTabFromPathname();
    if (typeof window !== 'undefined' && (window.location.pathname === '/' || window.location.pathname === '')) {
      const pref = localStorage.getItem('applyflow_default_tab');
      if (pref && VALID_TABS.includes(pref)) {
        return pref;
      }
    }
    return fromPath;
  });

  const handleTabChange = useCallback((tabId) => {
    if (!VALID_TABS.includes(tabId)) return;
    setActiveTab(tabId);
    const targetPath = '/' + tabId;
    if (window.location.pathname !== targetPath) {
      window.history.pushState(null, '', targetPath);
    }
  }, []);

  // Listen for browser Back/Forward navigation
  useEffect(() => {
    const handlePopState = () => {
      setActiveTab(getTabFromPathname());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Ensure root '/' or unknown URL is reflected as current tab
  useEffect(() => {
    const raw = window.location.pathname.replace(/^\/+|\/+$/g, '').toLowerCase();
    if (!VALID_TABS.includes(raw)) {
      window.history.replaceState(null, '', '/' + activeTab);
    }
  }, [activeTab]);

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('applyflow_theme') || 'dark';
  });
  const [globalSearch, setGlobalSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage]   = useState(1);
  const PAGE_SIZE = 10;

  // Apply theme to <html> and persist in localStorage
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('applyflow_theme', theme);
  }, [theme]);

  const handleToggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  // ─── Data state ───
  const [stats, setStats]               = useState(null);
  const [applications, setApplications] = useState([]);
  const [loadingApps, setLoadingApps]   = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);

  // ─── Modal state ───
  const [isAddOpen, setIsAddOpen]           = useState(false);
  const [viewingApp, setViewingApp]         = useState(null);  // app object for detail modal
  const [editingApp, setEditingApp]         = useState(null);  // app object for edit modal
  const [deletingApp, setDeletingApp]       = useState(null);  // app object for delete confirm

  // ─── Debounce search ───
  const searchTimer = useRef(null);
  const handleSearchChange = (q) => {
    setGlobalSearch(q);
    setCurrentPage(1);
  };

  // ─── Fetch stats ───
  const fetchStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const data = await applicationsApi.getStats();
      setStats(data);
    } catch (err) {
      console.warn('Failed to fetch stats:', err.message);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  // ─── Fetch applications ───
  const fetchApplications = useCallback(async () => {
    setLoadingApps(true);
    try {
      // Map internal filter ('ALL') to nothing (backend shows all if no status param)
      const statusParam = statusFilter !== 'ALL' ? statusFilter.charAt(0) + statusFilter.slice(1).toLowerCase() : undefined;
      const data = await applicationsApi.list({
        status: statusParam,
        company: globalSearch.trim() || undefined,
        page: currentPage,
        limit: PAGE_SIZE,
      });
      setApplications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn('Failed to fetch applications:', err.message);
      setApplications([]);
    } finally {
      setLoadingApps(false);
    }
  }, [statusFilter, globalSearch, currentPage]);

  // ─── Refresh both stats + apps ───
  const [dataVersion, setDataVersion] = useState(0);

  const refreshAll = useCallback(() => {
    fetchStats();
    fetchApplications();
    setDataVersion((v) => v + 1);
  }, [fetchStats, fetchApplications]);

  // Initial load
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Debounced apps fetch (250ms on search changes)
  useEffect(() => {
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      fetchApplications();
    }, 250);
    return () => clearTimeout(searchTimer.current);
  }, [fetchApplications]);

  // ─── Status filter → reset page ───
  const handleStatusChange = (tab) => {
    setStatusFilter(tab);
    setCurrentPage(1);
  };

  // ─── Handlers ───
  const handleAddSuccess = () => {
    setIsAddOpen(false);
    refreshAll();
  };

  const handleEditSuccess = () => {
    setEditingApp(null);
    refreshAll();
  };

  const handleDeleted = () => {
    setDeletingApp(null);
    refreshAll();
  };

  const handleViewApp = (app) => {
    setViewingApp(app);
  };

  const handleEditFromDetail = (app) => {
    setViewingApp(null);
    setEditingApp(app);
  };

  const handleDeleteFromDetail = (app) => {
    setViewingApp(null);
    setDeletingApp(app);
  };

  const handleEditFromTable = (app) => {
    setEditingApp(app);
  };

  const handleDeleteFromTable = (app) => {
    setDeletingApp(app);
  };

  const userName = user?.username || user?.email?.split('@')[0] || 'User';
  const donutData = buildDonutData(stats);

  // ─── Tab routing — renders the active page component ───
  const renderTabContent = () => {
    switch (activeTab) {
      case 'applications':
        return (
          <ApplicationsPage
            onSelectApplication={handleViewApp}
            onEditApplication={handleEditFromTable}
            onDeleteApplication={handleDeleteFromTable}
            onAddClick={() => setIsAddOpen(true)}
            onStatsChanged={refreshAll}
            refreshTrigger={dataVersion}
          />
        );
      case 'interviews':
        return (
          <InterviewsPage
            onSelectApplication={handleViewApp}
            onEditApplication={handleEditFromTable}
            onDeleteApplication={handleDeleteFromTable}
            onAddClick={() => setIsAddOpen(true)}
            onNavigateToApplications={() => handleTabChange('applications')}
            stats={stats}
            refreshTrigger={dataVersion}
          />
        );
      case 'analytics':
        return (
          <AnalyticsPage
            initialStats={stats}
            initialApplications={applications}
            refreshTrigger={dataVersion}
          />
        );
      case 'profile':
        return (
          <ProfilePage
            stats={stats}
            onSignOut={logout}
          />
        );
      case 'settings':
        return (
          <SettingsPage
            theme={theme}
            onToggleTheme={handleToggleTheme}
          />
        );
      case 'dashboard':
      default:
        return (
          <DashboardPage
            user={user}
            stats={stats}
            applications={applications}
            loadingApps={loadingApps}
            globalSearch={globalSearch}
            onSearchChange={handleSearchChange}
            statusFilter={statusFilter}
            onStatusChange={handleStatusChange}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            PAGE_SIZE={PAGE_SIZE}
            onSelectApplication={handleViewApp}
            onEditApplication={handleEditFromTable}
            onDeleteApplication={handleDeleteFromTable}
            onAddClick={() => setIsAddOpen(true)}
            donutData={donutData}
            getGreeting={getGreeting}
          />
        );
    }
  };

  return (
    <div className="applyflow-app-shell">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        user={user}
        onSignOut={logout}
        stats={stats}
      />

      {/* Main area */}
      <div className="applyflow-main-viewport">
        {/* Top Header */}
        <Header
          userName={userName}
          onAddApplication={() => setIsAddOpen(true)}
          searchValue={globalSearch}
          onSearch={handleSearchChange}
          user={user}
          onSignOut={logout}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />

        {/* Dashboard Body */}
        {renderTabContent()}
      </div>

      {/* Add Application Modal */}
      <AddApplicationModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSuccess={handleAddSuccess}
      />

      {/* View/Detail Modal */}
      <ApplicationDetailsModal
        application={viewingApp}
        onClose={() => setViewingApp(null)}
        onEdit={handleEditFromDetail}
        onDelete={handleDeleteFromDetail}
        onRefresh={refreshAll}
      />

      {/* Edit Modal — reuses the proven top-level ApplicationModal */}
      <ApplicationModal
        isOpen={Boolean(editingApp)}
        application={editingApp}
        onClose={() => setEditingApp(null)}
        onSuccess={handleEditSuccess}
      />

      {/* Delete Confirm Modal — reuses the proven top-level DeleteConfirmModal */}
      <DeleteConfirmModal
        isOpen={Boolean(deletingApp)}
        application={deletingApp}
        onClose={() => setDeletingApp(null)}
        onDeleted={handleDeleted}
      />
    </div>
  );
}
