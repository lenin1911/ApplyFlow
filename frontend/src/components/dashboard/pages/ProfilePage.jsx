import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import {
  ProfileIcon,
  RefreshIcon,
  LogoutIcon,
} from '../DashboardIcons';

function formatDate(isoString) {
  if (!isoString) return '—';
  try {
    return new Date(isoString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return isoString;
  }
}

export default function ProfilePage({ stats, onSignOut }) {
  const { user, refreshProfile } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [msg, setMsg] = useState(null);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshProfile();
      setMsg('Profile information updated successfully');
      setTimeout(() => setMsg(null), 3000);
    } catch {
      // ignore
    } finally {
      setRefreshing(false);
    }
  };

  const userName = user?.username || user?.email?.split('@')[0] || 'User';
  const userInitial = userName.charAt(0).toUpperCase();
  const userEmail = user?.email || '—';
  const userRole = user?.role || 'Member';
  const userId = user?.id ? `#${user.id}` : '—';
  const joinedDate = formatDate(user?.created_at);

  return (
    <main className="dashboard-scrollable-content">
      <div className="dashboard-content-max">
        {/* Header */}
        <div className="page-header-banner">
          <div className="page-header-info">
            <div className="page-title-row">
              <h1 className="page-main-title">User Profile</h1>
              <span className="count-pill">Authenticated</span>
            </div>
            <p className="page-main-subtitle">
              Your personal account credentials and current placement tracking status.
            </p>
          </div>
          <div className="page-header-actions">
            <button
              type="button"
              className="btn-refresh-pill"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshIcon size={14} />
              <span>{refreshing ? 'Refreshing…' : 'Refresh'}</span>
            </button>
          </div>
        </div>

        {msg && (
          <div className="profile-toast-success" style={{ marginBottom: 16 }}>
            <span>✓ {msg}</span>
          </div>
        )}

        {/* Profile Details Layout */}
        <div className="profile-page-grid">
          {/* Main User Card */}
          <div className="profile-main-card glass-panel">
            <div className="profile-hero-section">
              <div className="profile-hero-avatar">
                {userInitial}
                <span className="profile-online-badge" title="Active" />
              </div>
              <div className="profile-hero-identity">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <h2 className="profile-hero-name">{userName}</h2>
                  <span className="role-pill-badge">{userRole}</span>
                </div>
                <p className="profile-hero-email">{userEmail}</p>
                <div className="profile-hero-meta">
                  <span>Account ID: <strong>{userId}</strong></span>
                  <span>•</span>
                  <span>Joined: <strong>{joinedDate}</strong></span>
                </div>
              </div>
            </div>

            <div className="profile-divider" />

            <div className="profile-fields-grid">
              <div className="profile-field-box">
                <span className="field-label-dim">USERNAME</span>
                <span className="field-val-bright">{userName}</span>
              </div>
              <div className="profile-field-box">
                <span className="field-label-dim">EMAIL ADDRESS</span>
                <span className="field-val-bright">{userEmail}</span>
              </div>
              <div className="profile-field-box">
                <span className="field-label-dim">ROLE</span>
                <span className="field-val-bright">{userRole}</span>
              </div>
              <div className="profile-field-box">
                <span className="field-label-dim">ACCOUNT ID</span>
                <span className="field-val-bright mono">{userId}</span>
              </div>
              <div className="profile-field-box">
                <span className="field-label-dim">MEMBER SINCE</span>
                <span className="field-val-bright">{joinedDate}</span>
              </div>
              <div className="profile-field-box">
                <span className="field-label-dim">ACCOUNT STATUS</span>
                <span className="field-val-bright" style={{ color: '#10B981', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
                  Active
                </span>
              </div>
            </div>

            <div className="profile-divider" />

            <div className="profile-card-footer">
              <button
                type="button"
                className="btn-danger-outline"
                onClick={onSignOut}
              >
                <LogoutIcon size={14} />
                <span>Sign Out of Account</span>
              </button>
            </div>
          </div>

          {/* Side Summary */}
          <div className="profile-stats-stack">
            <div className="glass-panel profile-pipeline-box">
              <h3 className="section-title" style={{ marginBottom: 14 }}>Tracking Summary</h3>
              <div className="profile-stat-list">
                <div className="profile-stat-item">
                  <span className="stat-item-label">Total Applications</span>
                  <strong className="stat-item-val">{stats?.total ?? 0}</strong>
                </div>
                <div className="profile-stat-item">
                  <span className="stat-item-label">Applied</span>
                  <strong className="stat-item-val" style={{ color: '#38BDF8' }}>{stats?.Applied ?? 0}</strong>
                </div>
                <div className="profile-stat-item">
                  <span className="stat-item-label">Active Interviews</span>
                  <strong className="stat-item-val" style={{ color: '#818CF8' }}>{stats?.Interview ?? 0}</strong>
                </div>
                <div className="profile-stat-item">
                  <span className="stat-item-label">Job Offers</span>
                  <strong className="stat-item-val" style={{ color: '#10B981' }}>{stats?.Offer ?? 0}</strong>
                </div>
                <div className="profile-stat-item">
                  <span className="stat-item-label">Rejected</span>
                  <strong className="stat-item-val" style={{ color: '#F43F5E' }}>{stats?.Rejected ?? 0}</strong>
                </div>
              </div>
            </div>

            <div className="glass-panel profile-tip-box">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 16 }}>💡</span>
                <strong style={{ fontSize: 13, color: 'var(--af-text-primary)' }}>Pro Tip</strong>
              </div>
              <p style={{ fontSize: 12.5, color: 'var(--af-text-secondary)', lineHeight: 1.5, margin: 0 }}>
                Keep your applications up to date after each round to maintain accurate pipeline analytics and placement pacing.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
