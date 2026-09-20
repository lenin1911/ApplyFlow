import React from 'react';

export default function Pagination({
  currentPage,
  pageSize,
  itemCount,
  onPageChange,
  onPageSizeChange,
  hasMore = false,
}) {
  const isFirstPage = currentPage <= 1;
  const isLastPage = !hasMore && itemCount < pageSize;

  return (
    <div className="pagination-bar">
      <div className="pagination-size">
        <label htmlFor="per-page-select">Per page:</label>
        <select
          id="per-page-select"
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
      </div>

      <div className="pagination-controls">
        <span className="page-indicator">
          Page <strong>{currentPage}</strong> {itemCount > 0 ? `(${itemCount} items)` : ''}
        </span>
        <div className="btn-group">
          <button
            type="button"
            className="btn-page"
            disabled={isFirstPage}
            onClick={() => onPageChange(currentPage - 1)}
            aria-label="Previous page"
          >
            ← Prev
          </button>
          <button
            type="button"
            className="btn-page"
            disabled={isLastPage}
            onClick={() => onPageChange(currentPage + 1)}
            aria-label="Next page"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}
