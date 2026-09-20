import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { applicationsApi } from './services/api';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import ApplicationsPage from './pages/ApplicationsPage';
import ProfileModal from './components/ProfileModal';

const Icon = ({ name, size = 18 }) => {
  const paths = {
    grid: 'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z',
    briefcase: 'M4 7h16v13H4zM8 7V5h8v2M2 11h20',
    calendar: 'M5 4v3M19 4v3M4 7h16v13H4zM8 12h3M8 16h3M14 12h3',
    chart: 'M4 19V5M4 19h17M8 16v-4M12 16V8M16 16v-6M20 16v-9',
    settings:
      'M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4zM19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.8 1.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5v.1h-2.5v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1-1.8-1.8.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H6.5v-2.5h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1 1.8-1.8.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.5v-.1H15v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1 1.8 1.8-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.5 1h.1V13h-.1a1.7 1.7 0 0 0-1.5 1z',
    plus: 'M12 5v14M5 12h14',
    arrow: 'M5 12h14M13 6l6 6-6 6',
    search: 'm20 20-4-4M10.8 18a7.2 7.2 0 1 1 0-14.4 7.2 7.2 0 0 1 0 14.4z',
    bell: 'M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4',
    check: 'm5 12 4 4L19 6',
    sun: 'M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41',
    moon: 'M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z',
    logout: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9',
    user: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name] || paths.grid} />
    </svg>
  );
};

function Brand({ dark = false }) {
  return (
    <div className={`brand ${dark ? 'brand-dark' : ''}`}>
      <span className="brand-mark">
        <span />
        <span />
        <span />
      </span>
      <span>applyflow</span>
    </div>
  );
}

function MainLayout() {
  const { user, logout } = useAuth();
  const [activeNav, setActiveNav] = useState('Overview');
  const [theme, setTheme] = useState('dark');
  const [appCount, setAppCount] = useState(0);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Fetch total count for sidebar badge
  const refreshStats = useCallback(async () => {
    try {
      const stats = await applicationsApi.getStats();
      if (stats && typeof stats.total === 'number') {
        setAppCount(stats.total);
      }
    } catch {
      // Ignore count fetch error
    }
  }, []);

  useEffect(() => {
    refreshStats();
  }, [refreshStats]);

  const firstName = user?.username || user?.email?.split('@')[0] || 'User';

  return (
    <div className="dashboard" data-theme={theme}>
      {/* Sidebar */}
      <aside className="sidebar">
        <Brand />

        <div className="side-section">
          <span className="side-label">WORKSPACE</span>

          <button
            type="button"
            className={activeNav === 'Overview' ? 'nav-item active' : 'nav-item'}
            onClick={() => setActiveNav('Overview')}
          >
            <Icon name="grid" size={17} />
            Overview
          </button>

          <button
            type="button"
            className={activeNav === 'Applications' ? 'nav-item active' : 'nav-item'}
            onClick={() => setActiveNav('Applications')}
          >
            <Icon name="briefcase" size={17} />
            Applications
            <span className="nav-count">{appCount}</span>
          </button>
        </div>

        <div className="side-bottom">
          <button
            type="button"
            className="nav-item"
            onClick={() => setIsProfileOpen(true)}
          >
            <Icon name="user" size={17} />
            Profile & Account
          </button>

          <div
            className="user-card"
            onClick={() => setIsProfileOpen(true)}
            style={{ cursor: 'pointer' }}
            title="Click to view profile"
          >
            <div className="avatar">{firstName[0].toUpperCase()}</div>
            <div>
              <strong>{user?.username || firstName}</strong>
              <small>{user?.email || 'Authenticated User'}</small>
            </div>
            <button
              type="button"
              className="signout"
              onClick={(e) => {
                e.stopPropagation();
                logout();
              }}
              title="Sign out"
            >
              <Icon name="logout" size={13} />
            </button>
          </div>

          <button
            type="button"
            className="signout-button"
            onClick={logout}
          >
            <Icon name="logout" size={13} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main Dashboard Area */}
      <main className="dashboard-main">
        <header className="topbar">
          <div className="mobile-brand">
            <Brand />
          </div>

          <div className="topbar-actions">
            <button
              type="button"
              className="theme-toggle"
              onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
              title={theme === 'dark' ? 'Switch to Royal White light mode' : 'Switch to dark mode'}
            >
              <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={15} />
            </button>

            <button
              type="button"
              className="icon-button"
              onClick={() => setIsProfileOpen(true)}
              title="View account"
            >
              <div className="avatar small">{firstName[0].toUpperCase()}</div>
            </button>
          </div>
        </header>

        <div className="content">
          {activeNav === 'Overview' && (
            <Dashboard
              onNavigateToApplications={() => setActiveNav('Applications')}
            />
          )}

          {activeNav === 'Applications' && (
            <ApplicationsPage onStatsChanged={refreshStats} />
          )}
        </div>
      </main>

      {/* Profile Modal */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />
    </div>
  );
}

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <Brand dark />
        <span />
      </div>
    );
  }

  return user ? <MainLayout /> : <LoginPage />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
