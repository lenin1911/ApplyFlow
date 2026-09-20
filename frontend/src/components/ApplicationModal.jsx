import React, { useState, useEffect } from 'react';
import { applicationsApi } from '../services/api';

const STATUS_OPTIONS = ['Applied', 'Interview', 'Offer', 'Rejected'];

export default function ApplicationModal({
  isOpen,
  onClose,
  onSuccess,
  application = null, // if null -> Create mode, if object -> Edit mode
}) {
  const isEdit = Boolean(application && application.id);

  const [companyName, setCompanyName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [status, setStatus] = useState('Applied');
  const [appliedDate, setAppliedDate] = useState('');
  const [jobUrl, setJobUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (application) {
      setCompanyName(application.company_name || '');
      setJobTitle(application.job_title || '');
      setStatus(application.status || 'Applied');
      // Format date for date input: YYYY-MM-DD
      if (application.applied_date) {
        const d = new Date(application.applied_date);
        const iso = d.toISOString().split('T')[0];
        setAppliedDate(iso);
      } else {
        setAppliedDate(new Date().toISOString().split('T')[0]);
      }
      setJobUrl(application.job_url || '');
      setNotes(application.notes || '');
    } else {
      setCompanyName('');
      setJobTitle('');
      setStatus('Applied');
      setAppliedDate(new Date().toISOString().split('T')[0]);
      setJobUrl('');
      setNotes('');
    }
    setError(null);
  }, [application, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!companyName.trim()) {
      setError('Company name is required');
      return;
    }
    if (!jobTitle.trim()) {
      setError('Job title is required');
      return;
    }

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

    const payload = {
      company_name: companyName.trim(),
      job_title: jobTitle.trim(),
      status: status,
      applied_date: appliedDate ? new Date(appliedDate).toISOString() : null,
      job_url: jobUrl.trim() || null,
      notes: notes.trim() || null,
    };

    try {
      if (isEdit) {
        await applicationsApi.update(application.id, payload);
      } else {
        await applicationsApi.create(payload);
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save application');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-dialog">
        <div className="modal-header">
          <div>
            <span className="eyebrow">{isEdit ? 'UPDATE RECORD' : 'NEW OPPORTUNITY'}</span>
            <h2>{isEdit ? 'Edit Application' : 'Add an Application'}</h2>
          </div>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        {error && <div className="modal-alert error">{error}</div>}

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="app-company">COMPANY NAME *</label>
            <input
              id="app-company"
              type="text"
              required
              autoFocus
              maxLength={100}
              placeholder="e.g. Stripe, Linear, Figma"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="app-role">JOB TITLE *</label>
            <input
              id="app-role"
              type="text"
              required
              maxLength={100}
              placeholder="e.g. Senior Frontend Engineer"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
            />
          </div>

          <div className="form-row">
            <div className="form-group half">
              <label htmlFor="app-status">STATUS</label>
              <select
                id="app-status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group half">
              <label htmlFor="app-date">DATE APPLIED</label>
              <input
                id="app-date"
                type="date"
                value={appliedDate}
                onChange={(e) => setAppliedDate(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="app-url">JOB POSTING URL (OPTIONAL)</label>
            <input
              id="app-url"
              type="url"
              maxLength={500}
              placeholder="https://boards.greenhouse.io/..."
              value={jobUrl}
              onChange={(e) => setJobUrl(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="app-notes">NOTES (OPTIONAL)</label>
            <textarea
              id="app-notes"
              rows={3}
              maxLength={1000}
              placeholder="Salary range, referral contact, interview stages, or notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            <span className="char-count">{notes.length} / 1000</span>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
