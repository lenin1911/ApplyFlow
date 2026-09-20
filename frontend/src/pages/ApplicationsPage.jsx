import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { applicationsApi } from '../services/api';
import FilterBar from '../components/FilterBar';
import Pagination from '../components/Pagination';
import ApplicationModal from '../components/ApplicationModal';
import ApplicationDetailModal from '../components/ApplicationDetailModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';

export default function ApplicationsPage({ onStatsChanged }) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);

  // Filters & Pagination state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortOption, setSortOption] = useState('date-desc');

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingApplication, setEditingApplication] = useState(null);
  const [viewingApplicationId, setViewingApplicationId] = useState(null);
  const [deletingApplication, setDeletingApplication] = useState(null);

  // Fetch applications from backend
  const fetchApplications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await applicationsApi.list({
        status: statusFilter,
        company: searchQuery,
        page: currentPage,
        limit: pageSize,
      });
      setApplications(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchQuery, currentPage, pageSize]);

  // Debounced search trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchApplications();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchApplications]);

  const showToast = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const handleCreatedOrUpdated = () => {
    fetchApplications();
    onStatsChanged?.();
    showToast(editingApplication ? 'Application updated successfully' : 'Application created successfully');
    setEditingApplication(null);
  };

  const handleDeleted = (id) => {
    fetchApplications();
    onStatsChanged?.();
    showToast('Application deleted successfully');
    if (viewingApplicationId === id) {
      setViewingApplicationId(null);
    }
  };

  // Sort applications client-side
  const sortedApplications = useMemo(() => {
    const list = [...applications];
    switch (sortOption) {
      case 'date-desc':
        return list.sort((a, b) => new Date(b.applied_date) - new Date(a.applied_date));
      case 'date-asc':
        return list.sort((a, b) => new Date(a.applied_date) - new Date(b.applied_date));
      case 'company-asc':
        return list.sort((a, b) => a.company_name.localeCompare(b.company_name));
      case 'company-desc':
        return list.sort((a, b) => b.company_name.localeCompare(a.company_name));
      case 'status':
        return list.sort((a, b) => a.status.localeCompare(b.status));
      default:
        return list;
    }
  }, [applications, sortOption]);

  const formatDate = (isoString) => {
    if (!isoString) return '—';
    try {
      return new Date(isoString).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="applications-page">
      <div className="page-header">
        <div>
          <span className="eyebrow">APPLICATION PIPELINE</span>
          <h1>Applications</h1>
          <p className="page-sub">
            Review, search, and manage every stage of your career opportunities.
          </p>
        </div>
        <button
          type="button"
          className="add-button"
          onClick={() => setIsCreateOpen(true)}
        >
          <span>+</span> Add Application
        </button>
      </div>

      {notification && (
        <div className={`notification-banner ${notification.type}`}>
          <span>✦ {notification.message}</span>
          <button type="button" onClick={() => setNotification(null)}>×</button>
        </div>
      )}

      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          setCurrentPage(1);
        }}
        statusFilter={statusFilter}
        onStatusChange={(s) => {
          setStatusFilter(s);
          setCurrentPage(1);
        }}
        sortOption={sortOption}
        onSortChange={setSortOption}
        onAddClick={() => setIsCreateOpen(true)}
        onRefresh={fetchApplications}
        loading={loading}
      />

      {error && (
        <div className="error-banner">
          <span>{error}</span>
          <button type="button" onClick={fetchApplications}>Retry</button>
        </div>
      )}

      <div className="table-wrapper">
        <table className="apps-table">
          <thead>
            <tr>
              <th>COMPANY</th>
              <th>ROLE</th>
              <th>STATUS</th>
              <th>DATE APPLIED</th>
              <th>LINK</th>
              <th className="th-actions">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {loading && applications.length === 0 ? (
              <tr>
                <td colSpan="6" className="table-loading-cell">
                  <div className="table-spinner" />
                  <span>Loading applications from server…</span>
                </td>
              </tr>
            ) : sortedApplications.length === 0 ? (
              <tr>
                <td colSpan="6" className="table-empty-cell">
                  {searchQuery || statusFilter !== 'All' ? (
                    <div>
                      <p>No applications match your current filters.</p>
                      <button
                        type="button"
                        className="btn-link"
                        onClick={() => {
                          setSearchQuery('');
                          setStatusFilter('All');
                        }}
                      >
                        Reset filters
                      </button>
                    </div>
                  ) : (
                    <div>
                      <p>No applications yet. Start tracking your first role!</p>
                      <button
                        type="button"
                        className="btn-primary-inline"
                        onClick={() => setIsCreateOpen(true)}
                      >
                        + Create Your First Application
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ) : (
              sortedApplications.map((app) => (
                <tr key={app.id} className="app-row">
                  <td className="company-cell">
                    <div className="company-info">
                      <div className="company-mark">
                        {(app.company_name || 'C')[0].toUpperCase()}
                      </div>
                      <span className="company-name">{app.company_name}</span>
                    </div>
                  </td>
                  <td className="role-cell font-highlight">{app.job_title}</td>
                  <td>
                    <span className={`status-pill ${app.status.toLowerCase()}`}>
                      {app.status}
                    </span>
                  </td>
                  <td className="date-cell">{formatDate(app.applied_date)}</td>
                  <td className="url-cell">
                    {app.job_url ? (
                      <a
                        href={app.job_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="job-link"
                        title={app.job_url}
                      >
                        Link ↗
                      </a>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>
                  <td className="actions-cell">
                    <div className="action-buttons">
                      <button
                        type="button"
                        className="action-btn view-btn"
                        onClick={() => setViewingApplicationId(app.id)}
                        title="View Application Details"
                      >
                        View
                      </button>
                      <button
                        type="button"
                        className="action-btn edit-btn"
                        onClick={() => setEditingApplication(app)}
                        title="Edit Application"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="action-btn delete-btn"
                        onClick={() => setDeletingApplication(app)}
                        title="Delete Application"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={currentPage}
        pageSize={pageSize}
        itemCount={applications.length}
        onPageChange={setCurrentPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setCurrentPage(1);
        }}
        hasMore={applications.length === pageSize}
      />

      {/* Modals */}
      <ApplicationModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={handleCreatedOrUpdated}
      />

      <ApplicationModal
        isOpen={Boolean(editingApplication)}
        application={editingApplication}
        onClose={() => setEditingApplication(null)}
        onSuccess={handleCreatedOrUpdated}
      />

      <ApplicationDetailModal
        isOpen={Boolean(viewingApplicationId)}
        applicationId={viewingApplicationId}
        onClose={() => setViewingApplicationId(null)}
        onEdit={(app) => {
          setViewingApplicationId(null);
          setEditingApplication(app);
        }}
        onDelete={(app) => {
          setViewingApplicationId(null);
          setDeletingApplication(app);
        }}
      />

      <DeleteConfirmModal
        isOpen={Boolean(deletingApplication)}
        application={deletingApplication}
        onClose={() => setDeletingApplication(null)}
        onDeleted={handleDeleted}
      />
    </div>
  );
}
