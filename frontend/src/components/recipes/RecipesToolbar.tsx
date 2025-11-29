/**
 * RecipesToolbar Component
 * 
 * Provides toolbar controls for the recipes dashboard including add, filter, sort, and search.
 * Mirrors the TaskToolbar design with recipe-specific labeling.
 * 
 * Features:
 * - Add recipe button
 * - Filter toggle with active state indicator
 * - Sort toggle with active state indicator
 * - Search input with placeholder
 * - Active state highlighting for filter/sort buttons
 * 
 * @component
 * @example
 * <RecipesToolbar
 *   onAddRecipe={createRecipe}
 *   onFilterClick={(el) => setFilterAnchor(el)}
 *   onSortClick={(el) => setSortAnchor(el)}
 *   searchValue={search}
 *   onSearchChange={setSearch}
 *   hasActiveFilters={filters.length > 0}
 *   hasActiveSorts={sorts.length > 0}
 * />
 */
import React from 'react';

/**
 * Props for RecipesToolbar component
 */
interface RecipesToolbarProps {
  onAddRecipe: () => void;
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
 * RecipesToolbar component - renders toolbar controls for recipes dashboard
 * @param {RecipesToolbarProps} props - Component props
 * @returns {JSX.Element} Toolbar with add, filter, sort, and search controls
 */
export const RecipesToolbar: React.FC<RecipesToolbarProps> = ({
  onAddRecipe,
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
        id="addRecipeBtn"
        className="btn primary"
        title="Add recipe"
        onClick={onAddRecipe}
      >
        + Add recipe
      </button>
      <button
        id="filterBtn"
        className={`btn small icon-btn-toolbar${hasActiveFilters || isFilterOpen ? ' active' : ''}`}
        title="Filter recipes"
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
        title="Sort recipes"
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
        placeholder="Search recipes..."
        value={searchValue}
        onChange={(e) => onSearchChange(e.target.value)}
      />
    </div>
  );
};

export default RecipesToolbar;
