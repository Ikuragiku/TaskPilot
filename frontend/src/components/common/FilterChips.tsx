/**
 * FilterChips Component
 *
 * Renders active filter and sort chips for the dashboard. Supports removal, clearing, and adding filters/sorts.
 */
import React from 'react';
import { Filters } from '../../utils/taskFilters';
import { Sort } from '../../utils/taskSort';

interface Option {
  id: string;
  value: string;
  color: string;
}

interface FilterChipsProps {
  filters: Filters;
  sorts: Sort[];
  statusOptions: Option[];
  projectOptions: Option[];
  onRemoveStatusFilter: (status: string) => void;
  onRemoveProjectFilter: (project: string) => void;
  onRemoveDoneFilter: () => void;
  onRemoveSort: (index: number) => void;
  onClearFilters: () => void;
  onClearSorts: () => void;
  onAddFilterClick: (element: HTMLElement) => void;
  onAddSortClick: (element: HTMLElement) => void;
  showFilters?: boolean;
  showSorts?: boolean;
}

/**
 * Displays filter and sort chips with remove/clear actions and add buttons.
 */
export const FilterChips: React.FC<FilterChipsProps> = ({
  filters,
  sorts,
  statusOptions,
  projectOptions,
  onRemoveStatusFilter,
  onRemoveProjectFilter,
  onRemoveDoneFilter,
  onRemoveSort,
  onClearFilters,
  onClearSorts,
  onAddFilterClick,
  onAddSortClick,
  showFilters = true,
  showSorts = true
}) => {
  const filterChips: JSX.Element[] = [];
  const sortChips: JSX.Element[] = [];

  filters.status.forEach(s => {
    const opt = statusOptions.find(o => o.value.toLowerCase() === s.toLowerCase());
    filterChips.push(
      <span key={`status-${s}`} className="chip" data-type="status" data-value={s}>
        <span className="prop">Status</span>
        <span className="sep">:</span>
        <span className="dot" style={{ background: opt?.color || '#263241' }}></span>
        <span>{s}</span>
        <button
          className="remove"
          title="Remove"
          onClick={() => onRemoveStatusFilter(s)}
        >
          ×
        </button>
      </span>
    );
  });

  filters.project.forEach(p => {
    const opt = projectOptions.find(o => o.value.toLowerCase() === p.toLowerCase());
    filterChips.push(
      <span key={`project-${p}`} className="chip" data-type="project" data-value={p}>
        <span className="prop">Project</span>
        <span className="sep">:</span>
        <span className="dot" style={{ background: opt?.color || '#263241' }}></span>
        <span>{p}</span>
        <button
          className="remove"
          title="Remove"
          onClick={() => onRemoveProjectFilter(p)}
        >
          ×
        </button>
      </span>
    );
  });

  if (filters.done !== null) {
    filterChips.push(
      <span key="done" className="chip" data-type="done">
        <span className="prop">Done</span>
        <span className="sep">:</span>
        <span>{filters.done ? 'Yes' : 'No'}</span>
        <button
          className="remove"
          title="Remove"
          onClick={onRemoveDoneFilter}
        >
          ×
        </button>
      </span>
    );
  }

  sorts.forEach((s, i) => {
    const arrow = s.asc ? '↑' : '↓';
    const label = s.field.charAt(0).toUpperCase() + s.field.slice(1);
    sortChips.push(
      <span key={`sort-${i}`} className="chip sort">
        <span className="prop">Sort {i + 1}</span>
        <span className="sep">:</span>
        <span>{label} {arrow}</span>
        <button
          className="remove"
          title="Remove"
          onClick={() => onRemoveSort(i)}
        >
          ×
        </button>
      </span>
    );
  });

  const hasFilters = filterChips.length > 0;
  const hasSorts = sortChips.length > 0;

  return (
    <div className={`active-criteria${hasFilters || hasSorts ? ' has-chips' : ''}`}>
      {showFilters && (
        <div className="chips-compact">
          {filterChips}
          {hasFilters && (
            <>
              <button
                className="add-chip-btn"
                onClick={(e) => onAddFilterClick(e.currentTarget)}
              >
                + Add filter
              </button>
              <button
                className="clear-all-btn"
                onClick={onClearFilters}
              >
                Clear filters
              </button>
            </>
          )}
          {!hasFilters && (
            <button
              className="add-chip-btn"
              onClick={(e) => onAddFilterClick(e.currentTarget)}
            >
              + Add filter
            </button>
          )}
        </div>
      )}
      {showSorts && (
        <div className="chips-compact sort-chips">
          {sortChips}
          {hasSorts && (
            <>
              <button
                className="add-chip-btn"
                onClick={(e) => onAddSortClick(e.currentTarget)}
              >
                + Add sort
              </button>
              <button
                className="clear-all-btn"
                onClick={onClearSorts}
              >
                Clear sorts
              </button>
            </>
          )}
          {!hasSorts && (
            <button
              className="add-chip-btn"
              onClick={(e) => onAddSortClick(e.currentTarget)}
            >
              + Add sort
            </button>
          )}
        </div>
      )}
    </div>
  );
};
