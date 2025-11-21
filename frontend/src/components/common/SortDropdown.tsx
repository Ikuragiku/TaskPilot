/**
 * SortDropdown Component
 *
 * Dropdown for selecting sort fields and directions. Supports multi-field sorting and reset.
 */
import React, { useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Sort } from '../../utils/taskSort';

type Props = {
  anchorEl: HTMLElement | null;
  sorts: Sort[];
  setSorts: React.Dispatch<React.SetStateAction<Sort[]>>;
  onClose: () => void;
  fields?: readonly string[];
};

const FIELDS = ['title', 'status', 'project', 'deadline', 'done'] as const;

/**
 * Renders the sort dropdown UI for tasks. Allows field selection and direction control.
 */
export const SortDropdown: React.FC<Props> = ({ anchorEl, sorts, setSorts, onClose, fields }) => {
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

  const toggleField = (field: string, checked: boolean, dir: 'asc' | 'desc') => {
    setSorts(prev => {
      if (checked) {
        const exists = prev.find(s => s.field === field);
        if (!exists) return [...prev, { field, asc: dir === 'asc' }];
        return prev;
      } else {
        return prev.filter(s => s.field !== field);
      }
    });
  };

  const changeDir = (field: string, dir: 'asc' | 'desc') => {
    setSorts(prev => prev.map(s => (s.field === field ? { ...s, asc: dir === 'asc' } : s)));
  };

  const reset = () => setSorts([]);

  const usedFields = fields || FIELDS;

  const content = (
    <>
      <div className="dropdown-backdrop" onClick={onClose} />
      <div className="dd-menu sort-menu" style={{ position: 'absolute', top: pos.top, left: pos.left }}>
        <div className="dd-sec">
          <p className="dd-title">Sort by (in order)</p>
          <div className="filter-list">
            {usedFields.map(field => {
              const existing = sorts.find(s => s.field === field);
              const checked = !!existing;
              const dir: 'asc' | 'desc' = existing?.asc ? 'asc' : 'desc';
              return (
                <label key={field} className="filter-option">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={e => toggleField(field, e.currentTarget.checked, dir)}
                  />
                  <span>{field.charAt(0).toUpperCase() + field.slice(1)}</span>
                  <select
                    className="sort-direction"
                    value={dir}
                    disabled={!checked}
                    onChange={e => changeDir(field, e.currentTarget.value as 'asc' | 'desc')}
                  >
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                  </select>
                </label>
              );
            })}
          </div>
        </div>
        <div className="dd-sec">
          <div className="dd-actions"><button className="btn small clear-sort" onClick={reset}>Reset</button></div>
        </div>
      </div>
    </>
  );

  return createPortal(content, document.body);
};

export default SortDropdown;
