import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function ProfileModal({ isOpen, onClose }) {
  const { user, logout } = useAuth();

  if (!isOpen || !user) return null;

  const formatDate = (isoString) => {
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
  };

  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-dialog profile-dialog">
        <div className="modal-header">
          <div>
            <span className="eyebrow">ACCOUNT INFORMATION</span>
            <h2>User Profile</h2>
          </div>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="profile-card">
          <div className="profile-avatar">
            {(user.username || user.email || 'U')[0].toUpperCase()}
          </div>
          <div className="profile-identity">
            <h3>{user.username}</h3>
            <p className="profile-email">{user.email}</p>
            <span className="badge-role">{user.role || 'User'}</span>
          </div>
        </div>

        <div className="profile-details-grid">
          <div className="detail-field">
            <span className="field-label">USER ID</span>
            <span className="field-value mono">#{user.id}</span>
          </div>
          <div className="detail-field">
            <span className="field-label">ACCOUNT ROLE</span>
            <span className="field-value">{user.role || 'Member'}</span>
          </div>
          <div className="detail-field full-width">
            <span className="field-label">JOINED DATE</span>
            <span className="field-value">{formatDate(user.created_at)}</span>
          </div>
        </div>

        <div className="modal-actions space-between">
          <button
            type="button"
            className="btn-danger"
            onClick={() => {
              logout();
              onClose();
            }}
          >
            Log out of account
          </button>
          <button type="button" className="btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
