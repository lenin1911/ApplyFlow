import React, { useState, useEffect, useCallback } from 'react';
import { applicationsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ApplicationModal from '../components/ApplicationModal';
import ApplicationDetailModal from '../components/ApplicationDetailModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';

export default function Dashboard({ onNavigateToApplications }) {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    total: 0,
    Applied: 0,
    Interview: 0,
    Offer: 0,
    Rejected: 0,
  });
  const [recentApplications, setRecentApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [viewingId, setViewingId] = useState(null);
  const [editingApp, setEditingApp] = useState(null);
  const [deletingApp, setDeletingApp] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsData, recentData] = await Promise.all([
        applicationsApi.getStats().catch(() => null),
        applicationsApi.list({ limit: 5 }).catch(() => []),
      ]);

      if (statsData) {
        setStats(statsData);
      }
      if (Array.isArray(recentData)) {
        setRecentApplications(recentData);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const firstName = user?.username || user?.email?.split('@')[0] || 'User';

  const inProgressCount = (stats.Applied || 0) + (stats.Interview || 0);
  const interviewRate = stats.total > 0 ? Math.round(((stats.Interview || 0) / stats.total) * 100) : 0;
  const offerRate = stats.total > 0 ? Math.round(((stats.Offer || 0) / stats.total) * 100) : 0;

  const formatDate = (isoString) => {
    if (!isoString) return '—';
    try {
      return new Date(isoString).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="dashboard-content">
      <div className="dashboard-intro">
        <div>
          <p className="eyebrow">
            {new Date().toLocaleDateString(undefined, {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            }).toUpperCase()}
          </p>
          <h1>Good day, {firstName}.</h1>
          <p className="intro-sub">
            Real-time pipeline metrics connected directly to your FastAPI backend.
          </p>
        </div>
        <button
          type="button"
          className="add-button"
          onClick={() => setIsCreateOpen(true)}
        >
          <span>+</span> Add application
        </button>
      </div>

      {/* Real Statistics Cards */}
      <section className="stats-grid">
        <div className="stat-card dark">
          <span>Total applications</span>
          <strong>{stats.total || 0}</strong>
          <small>
            <b>Live backend count</b>
          </small>
          <div className="sparkline">
            <span style={{ height: '9px' }} />
            <span style={{ height: '16px' }} />
            <span style={{ height: '13px' }} />
            <span style={{ height: '26px' }} />
            <span style={{ height: '21px' }} />
            <span style={{ height: '33px' }} />
            <span style={{ height: '28px' }} />
            <span style={{ height: '40px' }} />
          </div>
        </div>

        <div className="stat-card">
          <span>In progress</span>
          <strong>{inProgressCount}</strong>
          <small>
            <b className="green">{stats.Applied || 0} applied</b>, {stats.Interview || 0} interviews
          </small>
          <div className="mini-bar">
            <i
              style={{
                width: stats.total > 0 ? `${Math.min(100, (inProgressCount / stats.total) * 100)}%` : '0%',
              }}
            />
          </div>
        </div>

        <div className="stat-card">
          <span>Interviews</span>
          <strong>{stats.Interview || 0}</strong>
          <small>
            <b className="purple">{interviewRate}% interview rate</b>
          </small>
          <div className="mini-dots">
            <i />
            <i />
            <i />
            <i />
          </div>
        </div>

        <div className="stat-card">
          <span>Offers received</span>
          <strong>{stats.Offer || 0}</strong>
          <small>
            <b className="orange">{offerRate}% offer conversion</b>
          </small>
          <div className="offer-line">
            ✦ <span>{stats.Rejected || 0} rejected</span>
          </div>
        </div>
      </section>

      {/* Distribution visual breakdown */}
      {stats.total > 0 && (
        <section className="pipeline-breakdown-card">
          <div className="breakdown-header">
            <h3>Pipeline Distribution</h3>
            <span className="breakdown-total">{stats.total} total tracking</span>
          </div>
          <div className="multi-progress-bar">
            <div
              className="bar-segment applied"
              style={{ width: `${((stats.Applied || 0) / stats.total) * 100}%` }}
              title={`Applied: ${stats.Applied}`}
            />
            <div
              className="bar-segment interview"
              style={{ width: `${((stats.Interview || 0) / stats.total) * 100}%` }}
              title={`Interview: ${stats.Interview}`}
            />
            <div
              className="bar-segment offer"
              style={{ width: `${((stats.Offer || 0) / stats.total) * 100}%` }}
              title={`Offer: ${stats.Offer}`}
            />
            <div
              className="bar-segment rejected"
              style={{ width: `${((stats.Rejected || 0) / stats.total) * 100}%` }}
              title={`Rejected: ${stats.Rejected}`}
            />
          </div>
          <div className="breakdown-legend">
            <span className="legend-item">
              <i className="dot-applied" /> Applied: <strong>{stats.Applied || 0}</strong>
            </span>
            <span className="legend-item">
              <i className="dot-interview" /> Interview: <strong>{stats.Interview || 0}</strong>
            </span>
            <span className="legend-item">
              <i className="dot-offer" /> Offer: <strong>{stats.Offer || 0}</strong>
            </span>
            <span className="legend-item">
              <i className="dot-rejected" /> Rejected: <strong>{stats.Rejected || 0}</strong>
            </span>
          </div>
        </section>
      )}

      {/* Recent applications section */}
      <div className="section-heading">
        <div>
          <h2>Recent Applications</h2>
          <p>Latest active entries retrieved directly from the database.</p>
        </div>
        <button
          type="button"
          className="view-all"
          onClick={onNavigateToApplications}
        >
          View all applications →
        </button>
      </div>

      <section className="table-card">
        <div className="table-head">
          <span>COMPANY / ROLE</span>
          <span>APPLIED ON</span>
          <span>STATUS</span>
          <span>ACTION</span>
        </div>

        {loading ? (
          <div className="empty-row">Loading recent applications…</div>
        ) : recentApplications.length === 0 ? (
          <div className="empty-row">
            No applications in the pipeline yet. Click "+ Add application" to get started.
          </div>
        ) : (
          recentApplications.map((app) => (
            <div
              className="application-row"
              key={app.id}
              onClick={() => setViewingId(app.id)}
              style={{ cursor: 'pointer' }}
            >
              <div className="company-cell">
                <div className="company-mark">
                  {(app.company_name || 'C')[0].toUpperCase()}
                </div>
                <div>
                  <strong>{app.company_name}</strong>
                  <small>{app.job_title}</small>
                </div>
              </div>
              <span className="date-cell">{formatDate(app.applied_date)}</span>
              <span className={`status-pill ${app.status.toLowerCase()}`}>
                {app.status}
              </span>
              <button
                type="button"
                className="row-action-view"
                onClick={(e) => {
                  e.stopPropagation();
                  setViewingId(app.id);
                }}
              >
                View
              </button>
            </div>
          ))
        )}
      </section>

      {/* Bottom informational cards */}
      <section className="bottom-grid">
        <div className="tip-card">
          <div className="tip-icon">✦</div>
          <div>
            <p className="eyebrow">BACKEND PIPELINE</p>
            <h3>FastAPI & PostgreSQL Synced</h3>
            <p>
              Every action directly performs atomic operations against your PostgreSQL database
              via asynchronous SQLAlchemy sessions.
            </p>
          </div>
          <button type="button" onClick={onNavigateToApplications}>
            Manage Pipeline →
          </button>
        </div>

        <div className="week-card">
          <div className="section-heading compact">
            <div>
              <h2>Quick Actions</h2>
              <p>Common tasks</p>
            </div>
          </div>
          <div className="focus-item" onClick={() => setIsCreateOpen(true)} style={{ cursor: 'pointer' }}>
            <span className="focus-dot purple-dot" />
            <div>
              <strong>Record New Application</strong>
              <small>Log company, role, link & notes</small>
            </div>
            <span className="focus-arrow">+</span>
          </div>
          <div className="focus-item" onClick={onNavigateToApplications} style={{ cursor: 'pointer' }}>
            <span className="focus-dot orange-dot" />
            <div>
              <strong>Browse & Filter Pipeline</strong>
              <small>Filter by status or company name</small>
            </div>
            <span className="focus-arrow">→</span>
          </div>
        </div>
      </section>

      {/* Modals */}
      <ApplicationModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={() => {
          fetchDashboardData();
        }}
      />

      <ApplicationModal
        isOpen={Boolean(editingApp)}
        application={editingApp}
        onClose={() => setEditingApp(null)}
        onSuccess={() => {
          fetchDashboardData();
        }}
      />

      <ApplicationDetailModal
        isOpen={Boolean(viewingId)}
        applicationId={viewingId}
        onClose={() => setViewingId(null)}
        onEdit={(app) => {
          setViewingId(null);
          setEditingApp(app);
        }}
        onDelete={(app) => {
          setViewingId(null);
          setDeletingApp(app);
        }}
      />

      <DeleteConfirmModal
        isOpen={Boolean(deletingApp)}
        application={deletingApp}
        onClose={() => setDeletingApp(null)}
        onDeleted={() => {
          fetchDashboardData();
        }}
      />
    </div>
  );
}
