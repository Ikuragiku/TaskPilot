/**
 * GroceryToolbar Component
 *
 * Renders toolbar actions for the dashboard: add Grocery, filter, sort, and search input.
 */
import React from 'react';

interface GroceryToolbarProps {
  onAddGrocery: () => void;
  onFilterClick: (element: HTMLElement) => void;
  onSortClick: (element: HTMLElement) => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
  hasActiveFilters?: boolean;
  hasActiveSorts?: boolean;
  isFilterOpen?: boolean;
  isSortOpen?: boolean;
}

/**
 * Toolbar for Grocery actions and search/filter/sort controls.
 */
export const GroceryToolbar: React.FC<GroceryToolbarProps> = ({
  onAddGrocery,
  onFilterClick,
  onSortClick,
  searchValue,
  onSearchChange,
  hasActiveFilters = false,
  hasActiveSorts = false,
  isFilterOpen = false,
  isSortOpen = false
}) => {
  return (
    <div className="table-actions">
      <button
        id="addRowBtn"
        className="btn primary"
        title="Add Grocery"
        onClick={onAddGrocery}
      >
        + Add Grocery
      </button>
      <button
        id="filterBtn"
        className={`btn small icon-btn-toolbar${hasActiveFilters || isFilterOpen ? ' active' : ''}`}
        title="Filter Grocerys"
        onClick={(e) => onFilterClick(e.currentTarget)}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
        </svg>
      </button>
      <button
        id="sortBtn"
        className={`btn small icon-btn-toolbar${hasActiveSorts || isSortOpen ? ' active' : ''}`}
        title="Sort Grocerys"
        onClick={(e) => onSortClick(e.currentTarget)}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <polyline points="19 12 12 19 5 12"></polyline>
        </svg>
      </button>
      <input
        type="text"
        id="searchInput"
        className="search-input"
        placeholder="Search Grocerys..."
        value={searchValue}
        onChange={(e) => onSearchChange(e.target.value)}
      />
    </div>
  );
};
