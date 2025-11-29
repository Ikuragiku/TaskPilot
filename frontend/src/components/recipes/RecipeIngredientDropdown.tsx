/**
 * RecipeIngredientDropdown Component
 * 
 * A reusable portal-based dropdown for managing list items (ingredients or recipe steps).
 * Supports add, edit, delete, and drag-to-reorder operations.
 * 
 * Features:
 * - Add new items with inline form
 * - Edit existing items inline
 * - Delete items via right-click context menu
 * - Drag to reorder items
 * - Configurable labels (Ingredients, Recipe, etc.)
 * - Optimistic updates with API sync
 * 
 * @component
 * @example
 * <RecipeIngredientDropdown
 *   anchorEl={cellElement}
 *   recipeId="recipe-123"
 *   items={recipe.ingredients}
 *   onClose={() => setAnchor(null)}
 *   updateRecipe={updateRecipe}
 *   label="Ingredients"
 *   fieldKey="ingredients"
 * />
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { TabContextMenu } from '../common/TabContextMenu';

/** Ingredient/item type definition */
type Ingredient = { id: string; name: string };

/**
 * Props for RecipeIngredientDropdown component
 */
type Props = {
  anchorEl: HTMLElement | null;
  recipeId: string | null;
  items: Ingredient[];
  onClose: () => void;
  updateRecipe: (id: string, input: any) => Promise<void> | void;
  label?: string;
  fieldKey?: string;
};
/**
 * RecipeIngredientDropdown component - manages ingredient/recipe item lists
 * @param {Props} props - Component props
 * @returns {JSX.Element} Portal-rendered dropdown with list management UI
 */
const RecipeIngredientDropdown: React.FC<Props> = ({ anchorEl, recipeId, items, onClose, updateRecipe, label = 'Ingredients', fieldKey = 'ingredients' }) => {
  const [list, setList] = useState<Ingredient[]>(() => [...items]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [addText, setAddText] = useState('');
  const [ctx, setCtx] = useState<{ x: number; y: number; item: Ingredient } | null>(null);

  useEffect(() => setList([...items]), [items]);

  const pos = useMemo(() => {
    if (!anchorEl) return { top: 0, left: 0 };
    const rect = anchorEl.getBoundingClientRect();
    // position closer to the item: use the top of the anchor (less vertical offset)
    return { top: rect.top + window.scrollY + 6, left: rect.left + window.scrollX };
  }, [anchorEl]);

  const saveList = async (next: Ingredient[]) => {
    setList(next);
    if (!recipeId) return;
    const payload: any = {};
    payload[fieldKey] = next;
    await Promise.resolve(updateRecipe(recipeId, payload));
  };

  const onAdd = async () => {
    const text = addText.trim();
    if (!text) return;
    const id = Math.random().toString(36).slice(2, 9);
    const next = [...list, { id, name: text }];
    await saveList(next);
    setAddText('');
  };

  const onStartEdit = (it: Ingredient) => {
    setEditingId(it.id);
    setEditText(it.name);
  };

  const onSaveEdit = async () => {
    if (!editingId) return;
    const text = editText.trim();
    if (!text) return;
    const next = list.map(i => (i.id === editingId ? { ...i, name: text } : i));
    await saveList(next);
    setEditingId(null);
  };

  const onDeleteConfirm = async () => {
    if (!ctx) return;
    const next = list.filter(i => i.id !== ctx.item.id);
    await saveList(next);
    setCtx(null);
  };

  // drag/reorder
  const dragIdx = useRef<number | null>(null);
  const onDragStart = (idx: number, e: React.DragEvent<HTMLLIElement>) => {
    dragIdx.current = idx;
    e.dataTransfer.effectAllowed = 'move';
    e.currentTarget.classList.add('dragging');
  };
  const onDragEnd = (e: React.DragEvent<HTMLLIElement>) => {
    e.currentTarget.classList.remove('dragging');
    dragIdx.current = null;
    document.querySelectorAll('.dd-item.drop-target').forEach(el => el.classList.remove('drop-target'));
  };
  const onDragOver = (idx: number, e: React.DragEvent<HTMLLIElement>) => {
    e.preventDefault();
    const cur = dragIdx.current;
    if (cur != null && cur !== idx) {
      (e.currentTarget as HTMLElement).classList.add('drop-target');
    }
  };
  const onDrop = async (idx: number, e: React.DragEvent<HTMLLIElement>) => {
    e.preventDefault();
    const from = dragIdx.current;
    if (from == null) return;
    const copy = [...list];
    const [moved] = copy.splice(from, 1);
    copy.splice(idx, 0, moved);
    await saveList(copy);
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
            <p className="dd-title">Edit {label}</p>
          <ul className="dd-list">
              {list.length === 0 && <li className="dd-item" style={{ cursor: 'default' }}>No {label.toLowerCase()}</li>}
            {list.map((it, idx) => (
              <li
                key={it.id}
                className={`dd-item${editingId === it.id ? ' editing' : ''}`}
                draggable={editingId === null}
                onDragStart={(e) => onDragStart(idx, e)}
                onDragEnd={onDragEnd}
                onDragOver={(e) => onDragOver(idx, e)}
                onDrop={(e) => onDrop(idx, e)}
                onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); setCtx({ x: e.clientX + window.scrollX, y: e.clientY + window.scrollY, item: it }); }}
              >
                {editingId === it.id ? (
                  <div className="dd-edit">
                    <input className="dd-input name" value={editText} onChange={e => setEditText(e.target.value)} />
                    <div className="dd-actions">
                      <button className="btn small primary" onClick={onSaveEdit}>Save</button>
                      <button className="btn small" onClick={() => setEditingId(null)}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <span className="grip" title="Drag">⋮⋮</span>
                    <span className="label">{it.name}</span>
                    <span className="grow" />
                    <button className="icon-btn" onClick={(e) => { e.stopPropagation(); onStartEdit(it); }} title="Edit">Edit</button>
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
        <div className="dd-sec dd-add">
          <p className="dd-title">Add new {label.toLowerCase()}</p>
          <div className="dd-input-row">
            <input className="dd-input name" value={addText} onChange={e => setAddText(e.target.value)} placeholder={`e.g. example ${label.toLowerCase()}`} />
            <div className="dd-actions">
              <button className="btn small primary" onClick={onAdd}>+ Add</button>
            </div>
          </div>
        </div>
      </div>
      {ctx && (
        <TabContextMenu
          x={ctx.x}
          y={ctx.y}
          tab={`Delete ${label}`}
          onDelete={onDeleteConfirm}
          onClose={() => setCtx(null)}
        />
      )}
    </>
  );

  return createPortal(content, document.body);
};

export default RecipeIngredientDropdown;
