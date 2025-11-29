/**
 * CategoryDropdown Component
 * 
 * A portal-based dropdown for single-select category management.
 * Supports add, edit, delete operations with inline editing and context menu.
 * 
 * Features:
 * - Single-select category assignment
 * - Add new categories inline
 * - Edit category names inline
 * - Delete categories via right-click
 * - Sorted display by order field
 * - Clear selection option (— placeholder)
 * 
 * @component
 * @example
 * <CategoryDropdown
 *   anchorEl={buttonElement}
 *   recipeId="recipe-123"
 *   options={categories}
 *   selectedValue={recipe.categoryId}
 *   onClose={() => setAnchor(null)}
 *   onSelect={(id, catId) => updateCategory(id, catId)}
 *   createCategory={createCategory}
 *   updateCategory={updateCategory}
 *   deleteCategory={deleteCategory}
 * />
 */
import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import TabContextMenu from './TabContextMenu';

/** Category type definition */
type Category = { id: string; value: string; order?: number };

/**
 * Props for CategoryDropdown component
 */
type Props = {
  anchorEl: HTMLElement | null;
  recipeId: string;
  options: Category[];
  selectedValue: string | null; // currently selected category id or null
  onClose: () => void;
  onSelect: (recipeId: string, categoryId: string | null) => void;
  createCategory: (data: { value: string }) => void;
  updateCategory: (id: string, data: { value?: string; order?: number }) => void;
  deleteCategory: (id: string) => void;
};

/**
 * CategoryDropdown component - manages single-select category assignment
 * @param {Props} props - Component props
 * @returns {JSX.Element | null} Portal-rendered dropdown or null if no anchor
 */
const CategoryDropdown: React.FC<Props> = ({ anchorEl, recipeId, options, selectedValue, onClose, onSelect, createCategory, updateCategory, deleteCategory }) => {
  const [addName, setAddName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; id: string } | null>(null);

  const sorted = useMemo(() => [...options].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)), [options]);

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

  const handleAdd = () => {
    const name = addName.trim();
    if (!name) return;
    createCategory({ value: name });
    setAddName('');
  };

  const startEdit = (opt: Category) => { setEditingId(opt.id); setEditName(opt.value); };
  const saveEdit = () => { if (!editingId) return; const name = editName.trim(); if (!name) return; updateCategory(editingId, { value: name }); setEditingId(null); };
  const cancelEdit = () => setEditingId(null);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    setContextMenu({ x: e.clientX + window.scrollX, y: e.clientY + window.scrollY, id });
  };

  const confirmDelete = () => {
    if (!contextMenu) return;
    deleteCategory(contextMenu.id);
    setContextMenu(null);
  };

  if (!anchorEl) return null;

  const content = (
    <>
      <div className="dropdown-backdrop" onClick={onClose} />
      <div className="dd-menu" style={{ position: 'absolute', top: pos.top, left: pos.left, minWidth: 220 }}>
        <div className="dd-sec">
          <p className="dd-title">Select category</p>
          <ul className="dd-list">
            <li className={`dd-item${selectedValue === null ? ' selected' : ''}`} onClick={() => { onSelect(recipeId, null); onClose(); }}>—</li>
            {sorted.length === 0 && <li className="dd-item" style={{ cursor: 'default' }}>No categories yet</li>}
            {sorted.map(o => (
              <li key={o.id} className={`dd-item${selectedValue === o.id ? ' selected' : ''}`} onClick={() => { onSelect(recipeId, o.id); onClose(); }} onContextMenu={(e) => handleDelete(o.id, e)}>
                {editingId === o.id ? (
                  <div className="dd-edit">
                    <input className="dd-input name" value={editName} onChange={e => setEditName(e.target.value)} />
                    <div className="dd-actions">
                      <button className="btn small primary" onClick={saveEdit}>Save</button>
                      <button className="btn small cancel" onClick={cancelEdit}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <span className="label">{o.value}</span>
                    <span className="grow" />
                    <button className="icon-btn opt-edit" title="Edit" onClick={(e) => { e.stopPropagation(); startEdit(o); }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" fill="currentColor"/><path d="M20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="currentColor"/></svg>
                    </button>
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
        <div className="dd-sec dd-add">
          <p className="dd-title">Add new category</p>
          <div className="dd-input-row">
            <input type="text" className="dd-input name" placeholder="Category name" value={addName} onChange={e => setAddName(e.target.value)} />
            <div className="dd-actions">
              <button className="btn small primary" onClick={handleAdd}>+ Add</button>
            </div>
          </div>
        </div>
      </div>
      {contextMenu && (
        <TabContextMenu x={contextMenu.x} y={contextMenu.y} tab="Delete category" onDelete={confirmDelete} onClose={() => setContextMenu(null)} />
      )}
    </>
  );

  return createPortal(content, document.body);
};

export default CategoryDropdown;
