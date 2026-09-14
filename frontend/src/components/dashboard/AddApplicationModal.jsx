import React, { useState } from 'react';
import { PlusIcon } from './DashboardIcons';

export default function AddApplicationModal({ isOpen, onClose, onAdd }) {
  const [company,     setCompany]     = useState('');
  const [position,    setPosition]    = useState('');
  const [status,      setStatus]      = useState('Applied');
  const [appliedDate, setAppliedDate] = useState('');
  const [location,    setLocation]    = useState('');
  const [department,  setDepartment]  = useState('Engineering');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!company.trim() || !position.trim()) return;

    const today = new Date();
    const formatted = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    onAdd({
      id:           `app-${Date.now()}`,
      company:      company.trim(),
      position:     position.trim(),
      status,
      appliedDate:  appliedDate.trim() || formatted,
      relativeTime: 'Just now',
      location:     location.trim() || 'Hybrid',
      department:   department.trim() || 'Engineering',
    });

    onClose();
    setCompany('');
    setPosition('');
    setStatus('Applied');
    setLocation('');
    setAppliedDate('');
    setDepartment('Engineering');
  };

  return (
    <div className="modal-backdrop-overlay" onClick={onClose}>
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
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label" htmlFor="add-company">Company Name *</label>
              <input
                id="add-company"
                type="text"
                required
                placeholder="e.g. Google, Stripe, Netflix"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="form-input"
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="add-position">Position / Role *</label>
              <input
                id="add-position"
                type="text"
                required
                placeholder="e.g. Software Engineer"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="add-status">Application Status</label>
              <select
                id="add-status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="form-select"
              >
                <option value="Applied">Applied</option>
                <option value="Interview">Interview</option>
                <option value="Offer">Offer</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="add-department">Department</label>
              <input
                id="add-department"
                type="text"
                placeholder="e.g. Engineering, Design"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="add-location">Location</label>
              <input
                id="add-location"
                type="text"
                placeholder="e.g. Remote, Bengaluru"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="add-date">Applied Date</label>
              <input
                id="add-date"
                type="text"
                placeholder="e.g. Sep 14, 2025"
                value={appliedDate}
                onChange={(e) => setAppliedDate(e.target.value)}
                className="form-input"
              />
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-modal-cancel" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              id="submit-add-application"
              className="btn-modal-submit"
              disabled={!company.trim() || !position.trim()}
            >
              <PlusIcon size={14} />
              Save Application
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
