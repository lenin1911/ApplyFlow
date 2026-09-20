import React from 'react';

const STATUSES = ['All', 'Applied', 'Interview', 'Offer', 'Rejected'];

export default function FilterBar({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  sortOption,
  onSortChange,
  onAddClick,
  onRefresh,
  loading = false,
}) {
  return (
    <div className="filter-bar">
      <div className="filter-search-group">
        <div className="search-input-wrap">
          <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search by company..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="filter-search-input"
          />
          {searchQuery && (
            <button
              type="button"
              className="clear-search"
              onClick={() => onSearchChange('')}
              title="Clear search"
            >
              ×
            </button>
          )}
        </div>
      </div>

      <div className="filter-tabs">
        {STATUSES.map((status) => (
          <button
            key={status}
            type="button"
            className={`filter-tab ${statusFilter === status ? 'active' : ''}`}
            onClick={() => onStatusChange(status)}
          >
            {status}
          </button>
        ))}
      </div>

      <div className="filter-actions-group">
        <div className="sort-wrap">
          <label htmlFor="sort-select">Sort:</label>
          <select
            id="sort-select"
            value={sortOption}
            onChange={(e) => onSortChange(e.target.value)}
            className="filter-select"
          >
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="company-asc">Company (A-Z)</option>
            <option value="company-desc">Company (Z-A)</option>
            <option value="status">Status</option>
          </select>
        </div>

        <button
          type="button"
          className="btn-icon"
          onClick={onRefresh}
          title="Refresh applications"
          disabled={loading}
        >
          <svg className={loading ? 'spin-icon' : ''} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
          </svg>
        </button>

        <button
          type="button"
          className="btn-add-primary"
          onClick={onAddClick}
        >
          <span>+</span> Add Application
        </button>
      </div>
    </div>
  );
}
