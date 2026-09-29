import React, { useState } from 'react';
import {
  SearchIcon,
  BellIcon,
  PlusIcon,
  ChevronDownIcon,
  MoonIcon,
  SunIcon,
  DashboardIcon,
  ApplicationsIcon,
  InterviewsIcon,
  AnalyticsIcon,
  ProfileIcon,
  SettingsIcon,
} from './DashboardIcons';

export default function Header({
  userName = 'User',
  onAddApplication,
  onSearch,
  searchValue = '',
  user,
  onSignOut,
  theme,
  onToggleTheme,
  activeTab = 'dashboard',
  onTabChange,
}) {
  const [showUserMenu, setShowUserMenu] = useState(false);

  const tabLabels = {
    dashboard:    'Dashboard',
    applications: 'Applications',
    interviews:   'Interviews',
    analytics:    'Analytics',
    profile:      'Profile',
    settings:     'Settings',
  };
  const pageLabel = tabLabels[activeTab] || 'Dashboard';

  const tabIcons = {
    dashboard:    <DashboardIcon size={16} className="header-breadcrumb-icon" />,
    applications: <ApplicationsIcon size={16} className="header-breadcrumb-icon" />,
    interviews:   <InterviewsIcon size={16} className="header-breadcrumb-icon" />,
    analytics:    <AnalyticsIcon size={16} className="header-breadcrumb-icon" />,
    profile:      <ProfileIcon size={16} className="header-breadcrumb-icon" />,
    settings:     <SettingsIcon size={16} className="header-breadcrumb-icon" />,
  };
  const activeIcon = tabIcons[activeTab] || <DashboardIcon size={16} className="header-breadcrumb-icon" />;

  const displayName = user?.username || userName;
  const displayEmail = user?.email || '';

  return (
    <header className="dashboard-header">
      {/* Left: Breadcrumb */}
      <div className="header-left">
        {activeIcon}
        <span className="header-breadcrumb-label">{pageLabel}</span>
      </div>

      {/* Right: Search + Toggle + Bell + Add + Avatar */}
      <div className="header-right-actions">
        {/* Global Search */}
        <div className="header-search-box">
          <SearchIcon size={14} className="header-search-icon" />
          <input
            id="header-search-input"
            type="text"
            placeholder="Search applications, companies..."
            value={searchValue}
            onChange={(e) => onSearch?.(e.target.value)}
            className="header-search-input"
            aria-label="Search"
          />
          <div className="header-search-shortcut">
            <kbd>Ctrl</kbd>
            <kbd>K</kbd>
          </div>
        </div>

        {/* Light / Dark Toggle */}
        <div
          className="theme-toggle-pill"
          role="group"
          aria-label="Theme toggle"
          id="theme-toggle"
        >
          <button
            type="button"
            className={`toggle-option ${theme === 'dark' ? 'active-toggle' : ''}`}
            onClick={() => theme !== 'dark' && onToggleTheme?.()}
            aria-pressed={theme === 'dark'}
            title="Dark mode"
          >
            <MoonIcon size={13} />
          </button>
          <button
            type="button"
            className={`toggle-option ${theme === 'light' ? 'active-toggle' : ''}`}
            onClick={() => theme !== 'light' && onToggleTheme?.()}
            aria-pressed={theme === 'light'}
            title="Light mode"
          >
            <SunIcon size={13} />
          </button>
        </div>

        {/* Notification bell (placeholder — no backend notifications yet) */}
        <div className="notification-wrapper">
          <button
            type="button"
            id="notifications-btn"
            className="btn-icon-square"
            title="Notifications"
            aria-label="Notifications"
          >
            <BellIcon size={17} />
          </button>
        </div>

        {/* + Add Application */}
        <button
          type="button"
          id="add-application-btn"
          className="btn-primary-add"
          onClick={onAddApplication}
        >
          <PlusIcon size={14} />
          <span>Add Application</span>
        </button>

        {/* User Avatar Menu */}
        <div className="header-user-wrapper">
          <button
            type="button"
            id="user-menu-btn"
            className="header-user-btn"
            aria-label="User menu"
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <div className="header-avatar-fallback">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <ChevronDownIcon size={12} className="header-user-chevron" />
          </button>

          {showUserMenu && (
            <div
              className="user-menu-dropdown glass-dropdown"
              onMouseLeave={() => setShowUserMenu(false)}
            >
              <div className="user-menu-header">
                <span className="user-menu-name">{displayName}</span>
                <span className="user-menu-email">{displayEmail}</span>
              </div>
              <div className="dropdown-divider" />
              <button
                type="button"
                className="user-menu-item"
                onClick={() => { setShowUserMenu(false); onTabChange?.('profile'); }}
              >
                View Profile
              </button>
              <button
                type="button"
                className="user-menu-item text-danger"
                onClick={() => { setShowUserMenu(false); onSignOut?.(); }}
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
