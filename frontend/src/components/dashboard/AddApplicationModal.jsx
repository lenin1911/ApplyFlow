import React, { useState } from 'react';
import { PlusIcon } from './DashboardIcons';
import { applicationsApi } from '../../services/api';

export default function AddApplicationModal({ isOpen, onClose, onSuccess }) {
  const [companyName,  setCompanyName]  = useState('');
  const [jobTitle,     setJobTitle]     = useState('');
  const [status,       setStatus]       = useState('Applied');
  const [appliedDate,  setAppliedDate]  = useState('');
  const [jobUrl,       setJobUrl]       = useState('');
  const [notes,        setNotes]        = useState('');
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState(null);

  if (!isOpen) return null;

  const resetForm = () => {
    setCompanyName('');
    setJobTitle('');
    setStatus('Applied');
    setAppliedDate('');
    setJobUrl('');
    setNotes('');
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!companyName.trim() || !jobTitle.trim()) return;

    if (jobUrl.trim()) {
      try {
        const parsed = new URL(jobUrl.trim());
        if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
          setError('Job URL must start with http:// or https://');
          return;
        }
      } catch {
        setError('Please enter a valid URL (e.g. https://company.com/job)');
        return;
      }
    }

    setLoading(true);
    setError(null);

    try {
      await applicationsApi.create({
        company_name: companyName.trim(),
        job_title:    jobTitle.trim(),
        status,
        applied_date: appliedDate ? new Date(appliedDate).toISOString() : null,
        job_url:      jobUrl.trim() || null,
        notes:        notes.trim() || null,
      });
      resetForm();
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop-overlay" onClick={handleClose}>
      <div
        className="add-app-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-modal-title"
      >
        {/* Header */}
        <div className="modal-header">
          <h2 id="add-modal-title" className="modal-title">+ Add Application</h2>
          <button type="button" className="modal-close-btn" onClick={handleClose} aria-label="Close">
            ✕
          </button>
        </div>

        {error && <div className="modal-error-banner">{error}</div>}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label" htmlFor="add-company">Company Name *</label>
              <input
                id="add-company"
                type="text"
                required
                maxLength={100}
                placeholder="e.g. Google, Stripe, Netflix"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="form-input"
                autoFocus
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="add-position">Position / Role *</label>
              <input
                id="add-position"
                type="text"
                required
                maxLength={100}
                placeholder="e.g. Software Engineer"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="form-input"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="add-status">Application Status</label>
              <select
                id="add-status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="form-select"
                disabled={loading}
              >
                <option value="Applied">Applied</option>
                <option value="Interview">Interview</option>
                <option value="Offer">Offer</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="add-date">Applied Date</label>
              <input
                id="add-date"
                type="date"
                value={appliedDate}
                onChange={(e) => setAppliedDate(e.target.value)}
                className="form-input"
                disabled={loading}
              />
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label" htmlFor="add-url">Job Posting URL (optional)</label>
              <input
                id="add-url"
                type="url"
                maxLength={500}
                placeholder="https://boards.greenhouse.io/..."
                value={jobUrl}
                onChange={(e) => setJobUrl(e.target.value)}
                className="form-input"
                disabled={loading}
              />
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label" htmlFor="add-notes">Notes (optional)</label>
              <textarea
                id="add-notes"
                rows={3}
                maxLength={1000}
                placeholder="Salary range, referral contact, interview stages..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="form-input"
                style={{ resize: 'vertical', minHeight: 72 }}
                disabled={loading}
              />
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-modal-cancel" onClick={handleClose} disabled={loading}>
              Cancel
            </button>
            <button
              type="submit"
              id="submit-add-application"
              className="btn-modal-submit"
              disabled={loading || !companyName.trim() || !jobTitle.trim()}
            >
              {loading ? (
                'Saving…'
              ) : (
                <>
                  <PlusIcon size={14} />
                  Save Application
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
