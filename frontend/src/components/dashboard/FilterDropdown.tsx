/**
 * FilterDropdown Component
 *
 * Dropdown for selecting status, project, and done filters. Supports keyboard and click handling.
 */
import React, { useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { StatusOption, ProjectOption } from '../../types';
import { Filters } from '../../utils/taskFilters';

type Props = {
  anchorEl: HTMLElement | null;
  statusOptions: StatusOption[];
  projectOptions: ProjectOption[];
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  onClose: () => void;
};

/**
 * Renders the filter dropdown UI for tasks. Allows multi-select and reset.
 */
export const FilterDropdown: React.FC<Props> = ({
  anchorEl,
  statusOptions,
  projectOptions,
  filters,
  setFilters,
  onClose
}) => {
  const pos = useMemo(() => {
    if (!anchorEl) return { top: 0, left: 0 };
    const rect = anchorEl.getBoundingClientRect();
    return { top: rect.bottom + window.scrollY + 6, left: rect.left + window.scrollX };
  }, [anchorEl]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const toggleStatus = (value: string, checked: boolean) => {
    setFilters(f => ({
      ...f,
      status: checked ? [...f.status, value] : f.status.filter(x => x !== value)
    }));
  };

  const toggleProject = (value: string, checked: boolean) => {
    setFilters(f => ({
      ...f,
      project: checked ? [...f.project, value] : f.project.filter(x => x !== value)
    }));
  };

  const setDone = (v: 'all' | 'done' | 'notdone') => {
    setFilters(f => ({ ...f, done: v === 'all' ? null : v === 'done' }));
  };

  const resetFilters = () => setFilters({ status: [], project: [], done: null });

  const content = (
    <>
      <div className="dropdown-backdrop" onClick={onClose} />
      <div className="dd-menu filter-menu" style={{ position: 'absolute', top: pos.top, left: pos.left }}>
        <div className="dd-sec">
          <p className="dd-title">Filter by Status</p>
          <div className="filter-list">
            {statusOptions.length === 0 && <p className="muted">No status options</p>}
            {statusOptions.map(s => (
              <label key={s.id} className="filter-option">
                <input
                  type="checkbox"
                  checked={filters.status.includes(s.value)}
                  onChange={e => toggleStatus(s.value, e.currentTarget.checked)}
                />
                <span className="dot" style={{ background: s.color }} />
                <span>{s.value}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="dd-sec">
          <p className="dd-title">Filter by Project</p>
          <div className="filter-list">
            {projectOptions.length === 0 && <p className="muted">No project options</p>}
            {projectOptions.map(p => (
              <label key={p.id} className="filter-option">
                <input
                  type="checkbox"
                  checked={filters.project.includes(p.value)}
                  onChange={e => toggleProject(p.value, e.currentTarget.checked)}
                />
                <span className="dot" style={{ background: p.color }} />
                <span>{p.value}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="dd-sec">
          <p className="dd-title">Filter by Done</p>
          <div className="filter-list">
            <label className="filter-option">
              <input type="radio" name="done-filter" checked={filters.done === null} onChange={() => setDone('all')} />
              <span>All</span>
            </label>
            <label className="filter-option">
              <input type="radio" name="done-filter" checked={filters.done === true} onChange={() => setDone('done')} />
              <span>Done</span>
            </label>
            <label className="filter-option">
              <input type="radio" name="done-filter" checked={filters.done === false} onChange={() => setDone('notdone')} />
              <span>Not Done</span>
            </label>
          </div>
        </div>
        <div className="dd-sec">
          <div className="dd-actions">
            <button className="btn small clear-filter" onClick={resetFilters}>Reset</button>
          </div>
        </div>
      </div>
    </>
  );

  return createPortal(content, document.body);
};

export default FilterDropdown;
