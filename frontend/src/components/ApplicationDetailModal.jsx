import React, { useEffect, useState } from 'react';
import { applicationsApi } from '../services/api';

export default function ApplicationDetailModal({
  isOpen,
  applicationId,
  onClose,
  onEdit,
  onDelete,
}) {
  const [appData, setAppData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen || !applicationId) {
      setAppData(null);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);

    applicationsApi
      .get(applicationId)
      .then((data) => {
        if (isMounted) setAppData(data);
      })
      .catch((err) => {
        if (isMounted) setError(err.message || 'Failed to load application details');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, applicationId]);

  if (!isOpen) return null;

  const formatDate = (isoString) => {
    if (!isoString) return '—';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-dialog">
        <div className="modal-header">
          <div>
            <span className="eyebrow">APPLICATION DETAILS</span>
            <h2>{appData ? appData.company_name : 'Loading…'}</h2>
          </div>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        {loading && (
          <div className="modal-loading">
            <div className="spinner" />
            <span>Fetching record #{applicationId}…</span>
          </div>
        )}

        {error && <div className="modal-alert error">{error}</div>}

        {appData && !loading && (
          <div className="detail-body">
            <div className="detail-grid">
              <div className="detail-field">
                <span className="field-label">ROLE / POSITION</span>
                <span className="field-value font-highlight">{appData.job_title}</span>
              </div>

              <div className="detail-field">
                <span className="field-label">STATUS</span>
                <div>
                  <span className={`status-pill ${appData.status.toLowerCase()}`}>
                    {appData.status}
                  </span>
                </div>
              </div>

              <div className="detail-field">
                <span className="field-label">DATE APPLIED</span>
                <span className="field-value">{formatDate(appData.applied_date)}</span>
              </div>

              <div className="detail-field">
                <span className="field-label">RECORD ID</span>
                <span className="field-value mono">#{appData.id}</span>
              </div>
            </div>

            {appData.job_url && (
              <div className="detail-section">
                <span className="field-label">JOB POSTING URL</span>
                <a
                  href={appData.job_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="external-link"
                >
                  {appData.job_url} ↗
                </a>
              </div>
            )}

            <div className="detail-section">
              <span className="field-label">NOTES</span>
              <div className="notes-box">
                {appData.notes ? appData.notes : <span className="text-muted">No notes recorded for this application.</span>}
              </div>
            </div>

            <div className="modal-actions space-between">
              <button
                type="button"
                className="btn-danger"
                onClick={() => {
                  onDelete?.(appData);
                }}
              >
                Delete
              </button>

              <div className="action-cluster">
                <button type="button" className="btn-secondary" onClick={onClose}>
                  Close
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => {
                    onEdit?.(appData);
                  }}
                >
                  Edit Record
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
