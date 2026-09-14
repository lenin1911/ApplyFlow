import React, { useState } from 'react';
import {
  SearchIcon,
  BellIcon,
  PlusIcon,
  ChevronDownIcon,
  MoonIcon,
  SunIcon,
  DashboardIcon,
} from './DashboardIcons';

export default function Header({
  userName = 'Lenin',
  onAddApplication,
  onSearch,
  searchValue = '',
  notificationCount = 3,
  currentUser,
  onOpenAuthModal,
  onSignOut,
  theme,
  onToggleTheme,
  activeTab = 'dashboard',
}) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const notifications = [
    { id: 1, title: 'Interview confirmed with Google – Sep 12, 10:00 AM', time: '1 hour ago', unread: true },
    { id: 2, title: 'Amazon updated your SDE Intern status to Offer 🎉', time: '3 hours ago', unread: true },
    { id: 3, title: 'Zoho application status changed to Rejected', time: '1 day ago', unread: false },
  ];

  const tabLabels = {
    dashboard:    'Dashboard',
    applications: 'Applications',
    companies:    'Companies',
    interviews:   'Interviews',
    analytics:    'Analytics',
    calendar:     'Calendar',
    profile:      'Profile',
    settings:     'Settings',
  };
  const pageLabel = tabLabels[activeTab] || 'Dashboard';

  const closeAll = () => {
    setShowNotifications(false);
    setShowUserMenu(false);
  };

  return (
    <header className="dashboard-header">
      {/* Left: Breadcrumb */}
      <div className="header-left">
        <DashboardIcon size={16} className="header-breadcrumb-icon" />
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
            onChange={(e) => onSearch && onSearch(e.target.value)}
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
            onClick={() => theme !== 'dark' && onToggleTheme && onToggleTheme()}
            aria-pressed={theme === 'dark'}
            title="Dark mode"
          >
            <MoonIcon size={13} />
          </button>
          <button
            type="button"
            className={`toggle-option ${theme === 'light' ? 'active-toggle' : ''}`}
            onClick={() => theme !== 'light' && onToggleTheme && onToggleTheme()}
            aria-pressed={theme === 'light'}
            title="Light mode"
          >
            <SunIcon size={13} />
          </button>
        </div>

        {/* Notifications */}
        <div className="notification-wrapper">
          <button
            type="button"
            id="notifications-btn"
            className="btn-icon-square"
            title="View notifications"
            aria-label="Notifications"
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowUserMenu(false);
            }}
          >
            <BellIcon size={17} />
            {notificationCount > 0 && <span className="notification-indicator-dot" />}
          </button>

          {showNotifications && (
            <div className="notification-dropdown glass-dropdown">
              <div className="dropdown-header">
                <span className="dropdown-title">Notifications</span>
                <span className="dropdown-badge">{notificationCount} new</span>
              </div>
              <div className="notification-list">
                {notifications.map((n) => (
                  <div key={n.id} className={`notification-item ${n.unread ? 'unread' : ''}`}>
                    <div className="notification-dot-wrap">
                      <span className={`status-point ${n.unread ? 'active-point' : ''}`} />
                    </div>
                    <div className="notification-content">
                      <p className="notification-title">{n.title}</p>
                      <span className="notification-time">{n.time}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="dropdown-footer">
                <button type="button" className="dropdown-footer-btn" onClick={closeAll}>
                  Mark all as read
                </button>
              </div>
            </div>
          )}
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
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowNotifications(false);
            }}
          >
            {currentUser?.photoURL ? (
              <img src={currentUser.photoURL} alt={userName} className="header-avatar-img" />
            ) : (
              <div className="header-avatar-fallback">{userName.charAt(0).toUpperCase()}</div>
            )}
            <ChevronDownIcon size={12} className="header-user-chevron" />
          </button>

          {showUserMenu && (
            <div className="user-menu-dropdown glass-dropdown">
              <div className="user-menu-header">
                <span className="user-menu-name">{userName}</span>
                <span className="user-menu-email">{currentUser?.email || 'student@applyflow.app'}</span>
              </div>
              <div className="dropdown-divider" />
              {onOpenAuthModal && (
                <button
                  type="button"
                  className="user-menu-item"
                  onClick={() => { closeAll(); onOpenAuthModal(); }}
                >
                  Sign-in / Switch Account
                </button>
              )}
              {currentUser && (
                <button
                  type="button"
                  className="user-menu-item text-danger"
                  onClick={() => { closeAll(); onSignOut && onSignOut(); }}
                >
                  Sign Out
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
