import React, { useState } from 'react';
import { applicationsApi } from '../services/api';

export default function DeleteConfirmModal({
  isOpen,
  application,
  onClose,
  onDeleted,
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen || !application) return null;

  const handleDelete = async () => {
    setLoading(true);
    setError(null);
    try {
      await applicationsApi.delete(application.id);
      onDeleted?.(application.id);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to delete application');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-dialog delete-dialog">
        <div className="modal-header">
          <div>
            <span className="eyebrow danger-eyebrow">CONFIRM REMOVAL</span>
            <h2>Delete Application?</h2>
          </div>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        {error && <div className="modal-alert error">{error}</div>}

        <p className="delete-warning">
          Are you sure you want to permanently delete your application for{' '}
          <strong>{application.job_title}</strong> at <strong>{application.company_name}</strong>?
          This action cannot be undone.
        </p>

        <div className="modal-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn-danger-solid"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? 'Deleting…' : 'Yes, Delete Application'}
          </button>
        </div>
      </div>
    </div>
  );
}
