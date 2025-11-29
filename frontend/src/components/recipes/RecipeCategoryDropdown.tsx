/**
 * RecipeCategoryDropdown Component
 * 
 * Provides a portal-based dropdown for managing recipe categories.
 * Supports multi-select, add/edit/delete, drag-to-reorder, and color customization.
 * 
 * Features:
 * - Multi-select categories for a recipe
 * - Add new categories with color selection
 * - Edit existing category names and colors inline
 * - Delete categories via right-click context menu
 * - Drag to reorder categories
 * - Optimistic UI updates with API sync
 * 
 * @component
 * @example
 * <RecipeCategoryDropdown
 *   anchorEl={buttonElement}
 *   recipeId="recipe-123"
 *   options={categories}
 *   currentCategoryIds={["cat-1", "cat-2"]}
 *   onClose={() => setAnchor(null)}
 *   updateRecipe={updateRecipe}
 *   createCategory={createCategory}
 *   updateCategory={updateCategory}
 *   deleteCategory={deleteCategory}
 * />
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { PALETTE } from '../../utils/constants';
import { ColorPalettePicker } from '../common/ColorPalettePicker';
import { TabContextMenu } from '../common/TabContextMenu';

/** Category type definition */
type Category = { id: string; value: string; color: string; order: number };

/**
 * Props for RecipeCategoryDropdown component
 */
type Props = {
  anchorEl: HTMLElement | null;
  recipeId: string | null;
  options: Category[];
  onClose: () => void;
  updateRecipe: (id: string, input: any) => Promise<void> | void;
  createCategory: (data: { value: string; color: string }) => Promise<void> | void;
  deleteCategory: (id: string) => Promise<void> | void;
  updateCategory: (id: string, data: { value?: string; color?: string; order?: number }) => Promise<void> | void;
  onOptionDeleted?: (opt: Category) => void;
  currentCategoryIds?: string[] | null;
};

/**
 * RecipeCategoryDropdown component - manages recipe category selection and CRUD
 * @param {Props} props - Component props
 * @returns {JSX.Element} Portal-rendered dropdown menu
 */
const RecipeCategoryDropdown: React.FC<Props> = ({
  anchorEl,
  recipeId,
  options,
  onClose,
  updateRecipe,
  createCategory,
  deleteCategory,
  updateCategory,
  onOptionDeleted,
  currentCategoryIds
}) => {
  const [addName, setAddName] = useState('');
  const [addColor, setAddColor] = useState(PALETTE[0].color);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState(PALETTE[0].color);
  const [optionContextMenu, setOptionContextMenu] = useState<{ x: number; y: number; opt: Category } | null>(null);

  const [selected, setSelected] = useState<Set<string>>(() => {
    const s = new Set<string>();
    if (currentCategoryIds && currentCategoryIds.length > 0) {
      (currentCategoryIds || []).forEach((id: string) => {
        const opt = options.find(o => o.id === id);
        if (opt) s.add(opt.value);
      });
    }
    return s;
  });

  const sortedOptions = useMemo(() => [...options].sort((a, b) => a.order - b.order), [options]);

  const pos = useMemo(() => {
    if (!anchorEl) return { top: 0, left: 0 };
    const rect = anchorEl.getBoundingClientRect();
    return { top: rect.bottom + window.scrollY + 6, left: rect.left + window.scrollX };
  }, [anchorEl]);

  const applySelection = async (nextSelected: Set<string>) => {
    if (!recipeId) return;
    const checkedValues = Array.from(nextSelected);
    const ids = options.filter(o => checkedValues.includes(o.value)).map(o => o.id);
    await Promise.resolve(updateRecipe(recipeId, { categoryIds: ids }));
  };

  const toggleValue = async (value: string) => {
    const next = new Set(selected);
    if (next.has(value)) next.delete(value); else next.add(value);
    setSelected(next);
    await applySelection(next);
  };

  const handleAdd = async () => {
    const name = addName.trim();
    if (!name) return;
    await Promise.resolve(createCategory({ value: name, color: addColor }));
    setAddName('');
    setAddColor(PALETTE[0].color);
  };

  const startEdit = (opt: Category) => {
    setEditingId(opt.id);
    setEditName(opt.value);
    setEditColor(opt.color);
  };

  const saveEdit = async () => {
    if (!editingId) return;
    const name = editName.trim();
    if (!name) return;
    await Promise.resolve(updateCategory(editingId, { value: name, color: editColor }));
    setEditingId(null);
  };

  const cancelEdit = () => setEditingId(null);

  const handleDelete = (opt: Category, e: React.MouseEvent<HTMLLIElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setOptionContextMenu({ x: e.clientX + window.scrollX, y: e.clientY + window.scrollY, opt });
  };

  const confirmDelete = async () => {
    if (!optionContextMenu) return;
    const opt = optionContextMenu.opt;
    await Promise.resolve(deleteCategory(opt.id));
    // remove it from local selection if present
    const s = new Set(selected);
    if (s.has(opt.value)) {
      s.delete(opt.value);
      setSelected(s);
      await applySelection(s);
    }
    setOptionContextMenu(null);
    if (onOptionDeleted) onOptionDeleted(opt);
  };

  // drag reorder
  const dragIdxRef = useRef<number | null>(null);
  const onDragStart = (idx: number, e: React.DragEvent<HTMLLIElement>) => {
    dragIdxRef.current = idx;
    e.currentTarget.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
  };
  const onDragEnd = (e: React.DragEvent<HTMLLIElement>) => {
    e.currentTarget.classList.remove('dragging');
    const ul = e.currentTarget.parentElement;
    ul?.querySelectorAll('.drop-target').forEach(el => el.classList.remove('drop-target'));
    dragIdxRef.current = null;
  };
  const onDragOver = (idx: number, e: React.DragEvent<HTMLLIElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const ul = e.currentTarget.parentElement;
    ul?.querySelectorAll('.drop-target').forEach(el => el.classList.remove('drop-target'));
    if (dragIdxRef.current !== null && dragIdxRef.current !== idx) e.currentTarget.classList.add('drop-target');
  };
  const onDragLeave = (e: React.DragEvent<HTMLLIElement>) => e.currentTarget.classList.remove('drop-target');
  const onDrop = async (idx: number, e: React.DragEvent<HTMLLIElement>) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drop-target');
    const from = dragIdxRef.current;
    if (from == null || from === idx) return;
    const listCopy = [...sortedOptions];
    const [moved] = listCopy.splice(from, 1);
    listCopy.splice(idx, 0, moved);
    await Promise.all(listCopy.map((opt, i) => Promise.resolve(updateCategory(opt.id, { order: i }))));
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const content = (
    <>
      <div className="dropdown-backdrop" onClick={onClose} />
      <div className="dd-menu" style={{ position: 'absolute', top: pos.top, left: pos.left }}>
        <div className="dd-sec">
          <p className="dd-title">Select Category</p>
          <ul className="dd-list">
            {sortedOptions.length === 0 && <li className="dd-item" style={{ cursor: 'default' }}>No categories</li>}
                    {sortedOptions.map((o, idx) => (
                      <li
                        key={o.id}
                        className={`dd-item${selected.has(o.value) ? ' selected' : ''}`}
                draggable={!editingId}
                onDragStart={(e) => onDragStart(idx, e)}
                onDragEnd={onDragEnd}
                onDragOver={(e) => onDragOver(idx, e)}
                onDragLeave={onDragLeave}
                onDrop={(e) => onDrop(idx, e)}
                        onClick={() => !editingId && toggleValue(o.value)}
                onContextMenu={(e) => handleDelete(o, e)}
              >
                {editingId === o.id ? (
                  <div className="dd-edit">
                    <input className="dd-input name" type="text" value={editName} onChange={e => setEditName(e.target.value)} />
                    <ColorPalettePicker selectedColor={editColor} onColorSelect={setEditColor} />
                    <div className="dd-actions">
                      <button className="btn small primary save" onClick={saveEdit}>Save</button>
                      <button className="btn small cancel" onClick={cancelEdit}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <span className="grip" title="Drag">⋮⋮</span>
                    <span className="dot" style={{ background: o.color }} />
                    <span className="label">{o.value}</span>
                    <span className="grow" />
                    <button className="icon-btn opt-edit" title="Edit" onClick={(e) => { e.stopPropagation(); startEdit(o); }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" fill="currentColor"/>
                        <path d="M20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="currentColor"/>
                      </svg>
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
          </div>
          <ColorPalettePicker selectedColor={addColor} onColorSelect={setAddColor} />
          <div className="dd-actions">
            <button className="btn small primary" onClick={handleAdd}>+ Add</button>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      {createPortal(content, document.body)}
      {optionContextMenu && (
        <TabContextMenu
          x={optionContextMenu.x}
          y={optionContextMenu.y}
          tab={`Delete Category`}
          onDelete={confirmDelete}
          onClose={() => setOptionContextMenu(null)}
        />
      )}
    </>
  );
};

export default RecipeCategoryDropdown;
