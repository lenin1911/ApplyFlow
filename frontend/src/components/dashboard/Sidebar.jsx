import React from 'react';
import {
  FlowLogo,
  DashboardIcon,
  ApplicationsIcon,
  CompaniesIcon,
  InterviewsIcon,
  AnalyticsIcon,
  CalendarIcon,
  ProfileIcon,
  SettingsIcon,
  LogoutIcon,
  ChevronRightIcon,
} from './DashboardIcons';

export default function Sidebar({
  activeTab = 'dashboard',
  onTabChange,
  currentUser,
  onSignOut,
  theme,
}) {
  const mainNavItems = [
    { id: 'dashboard',     label: 'Dashboard',     icon: <DashboardIcon size={17} /> },
    { id: 'applications',  label: 'Applications',  icon: <ApplicationsIcon size={17} />, badge: '28' },
    { id: 'companies',     label: 'Companies',     icon: <CompaniesIcon size={17} />, badge: '14' },
    { id: 'interviews',    label: 'Interviews',    icon: <InterviewsIcon size={17} />, badge: '6' },
    { id: 'analytics',    label: 'Analytics',    icon: <AnalyticsIcon size={17} /> },
    { id: 'calendar',     label: 'Calendar',     icon: <CalendarIcon size={17} /> },
  ];

  const accountNavItems = [
    { id: 'profile',  label: 'Profile',  icon: <ProfileIcon size={17} /> },
    { id: 'settings', label: 'Settings', icon: <SettingsIcon size={17} /> },
  ];

  const userName  = currentUser?.displayName || 'Lenin Samuvel';
  const userRole  = currentUser?.email ? currentUser.email.split('@')[0] : 'Student';

  return (
    <aside className="sidebar-container">
      {/* Brand */}
      <div className="sidebar-brand-header">
        <div className="brand-logo-lockup">
          <FlowLogo size={32} />
          <div className="brand-name-group">
            <span className="brand-title">ApplyFlow</span>
            <span className="brand-tagline">Your Career, In Flow</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="sidebar-nav-section">
        <div className="nav-group-label">Main</div>
        <nav className="sidebar-nav" aria-label="Main Navigation">
          {mainNavItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                id={`nav-${item.id}`}
                className={`nav-item-btn ${isActive ? 'nav-item-active' : ''}`}
                onClick={() => onTabChange && onTabChange(item.id)}
              >
                <span className="nav-item-icon">{item.icon}</span>
                <span className="nav-item-label">{item.label}</span>
                {item.badge && (
                  <span className={`nav-item-badge ${isActive ? 'badge-active' : ''}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="nav-group-label nav-group-spacer">Account</div>
        <nav className="sidebar-nav" aria-label="Account Navigation">
          {accountNavItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                id={`nav-${item.id}`}
                className={`nav-item-btn ${isActive ? 'nav-item-active' : ''}`}
                onClick={() => onTabChange && onTabChange(item.id)}
              >
                <span className="nav-item-icon">{item.icon}</span>
                <span className="nav-item-label">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Profile + Logout */}
      <div className="sidebar-profile-section">
        <div className="profile-card-inner">
          <div className="profile-avatar-wrapper">
            {currentUser?.photoURL ? (
              <img src={currentUser.photoURL} alt={userName} className="profile-avatar-img" />
            ) : (
              <div className="profile-avatar-fallback">
                {userName.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="profile-status-indicator" title="Active" />
          </div>
          <div className="profile-text-group">
            <span className="profile-name">{userName}</span>
            <span className="profile-role">{userRole}</span>
          </div>
          <button
            type="button"
            className="profile-chevron-btn"
            title="Profile options"
            onClick={() => onTabChange && onTabChange('profile')}
            aria-label="View profile"
          >
            <ChevronRightIcon size={14} />
          </button>
        </div>

        <button
          type="button"
          id="sidebar-logout-btn"
          className="sidebar-logout-btn"
          onClick={onSignOut}
        >
          <LogoutIcon size={15} />
          <span>Logout</span>
        </button>

        <div className="sidebar-version-footer">
          <span className="version-text">v1.0.0</span>
          <span className="version-emoji">Keep Going 🚀</span>
        </div>
      </div>
    </aside>
  );
}
