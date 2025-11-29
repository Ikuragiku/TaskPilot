/**
 * OptionDropdown Component
 *
 * Dropdown for selecting, adding, editing, and deleting status/project options. Supports drag-and-drop, color picking, and context menus.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Task, StatusOption, ProjectOption } from '../../types';
import { PALETTE } from '../../utils/constants';
import { ColorPalettePicker } from './ColorPalettePicker';
import { TabContextMenu } from './TabContextMenu';

type Opt = StatusOption | ProjectOption;

type Props = {
  anchorEl: HTMLElement | null;
  type: 'status' | 'project';
  task: Task;
  options: Opt[];
  onClose: () => void;
  updateTask: (id: string, input: any) => Promise<void>;
  createOption: (data: { value: string; color: string }) => Promise<void>;
  deleteOption: (id: string) => Promise<void>;
  updateOption: (id: string, data: { value?: string; color?: string; order?: number }) => Promise<void>;
  onOptionDeleted?: (opt: Opt) => void;
};

/**
 * Renders the option dropdown UI for status/project selection and management.
 */
export const OptionDropdown: React.FC<Props> = ({
  anchorEl,
  type,
  task,
  options,
  onClose,
  updateTask,
  createOption,
  deleteOption,
  updateOption,
  onOptionDeleted
}) => {
  const [selected, setSelected] = useState<Set<string>>(() => {
    const set = new Set<string>();
    const arr = type === 'status' ? (task.statuses || []) : (task.projects || []);
    arr.forEach(o => set.add(o.value));
    return set;
  });

  const [addName, setAddName] = useState('');
  const [addColor, setAddColor] = useState(PALETTE[0].color);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState(PALETTE[0].color);
  const [optionContextMenu, setOptionContextMenu] = useState<{ x: number; y: number; opt: Opt } | null>(null);

  const sortedOptions = useMemo(() => {
    return [...options].sort((a, b) => a.order - b.order);
  }, [options]);

  const pos = useMemo(() => {
    if (!anchorEl) return { top: 0, left: 0 };
    const rect = anchorEl.getBoundingClientRect();
    return { top: rect.bottom + window.scrollY + 6, left: rect.left + window.scrollX };
  }, [anchorEl]);

  const applySelection = async (nextSelected: Set<string>) => {
    const checkedValues = Array.from(nextSelected);
    const ids = options.filter(o => checkedValues.includes(o.value)).map(o => o.id);
    await updateTask(task.id, { [type === 'status' ? 'statusIds' : 'projectIds']: ids });
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
    await createOption({ value: name, color: addColor });
    setAddName('');
    setAddColor(PALETTE[0].color);
  };

  const startEdit = (opt: Opt) => {
    setEditingId(opt.id);
    setEditName(opt.value);
    setEditColor(opt.color);
  };

  const saveEdit = async () => {
    if (!editingId) return;
    const name = editName.trim();
    if (!name) return;
    await updateOption(editingId, { value: name, color: editColor });
    setEditingId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const handleDelete = (opt: Opt, e: React.MouseEvent<HTMLLIElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setOptionContextMenu({
      x: e.clientX + window.scrollX,
      y: e.clientY + window.scrollY,
      opt
    });
  };

  const confirmDelete = async () => {
    if (!optionContextMenu) return;
    const opt = optionContextMenu.opt;
    await deleteOption(opt.id);
    await applySelection(selected);
    setOptionContextMenu(null);
    if (onOptionDeleted) {
      onOptionDeleted(opt);
    }
  };

  // Drag reorder
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
    if (dragIdxRef.current !== null && dragIdxRef.current !== idx) {
      e.currentTarget.classList.add('drop-target');
    }
  };

  const onDragLeave = (e: React.DragEvent<HTMLLIElement>) => {
    e.currentTarget.classList.remove('drop-target');
  };

  const onDrop = async (idx: number, e: React.DragEvent<HTMLLIElement>) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drop-target');
    const from = dragIdxRef.current;
    if (from == null || from === idx) return;
    
    const listCopy = [...sortedOptions];
    const [moved] = listCopy.splice(from, 1);
    listCopy.splice(idx, 0, moved);
    
    // Update all orders
    await Promise.all(listCopy.map((opt, i) => updateOption(opt.id, { order: i })));
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const content = (
    <>
      <div className="dropdown-backdrop" onClick={onClose} />
      <div className="dd-menu" style={{ position: 'absolute', top: pos.top, left: pos.left }}>
        <div className="dd-sec">
          <p className="dd-title">Select {type}</p>
          <ul className="dd-list">
            {sortedOptions.length === 0 && (
              <li className="dd-item" style={{ cursor: 'default' }}>No options yet</li>
            )}
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
          <p className="dd-title">Add new {type}</p>
          <div className="dd-input-row">
            <input type="text" className="dd-input name" placeholder="Option name" value={addName} onChange={e => setAddName(e.target.value)} />
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
          tab={`Delete ${type}`}
          onDelete={confirmDelete}
          onClose={() => setOptionContextMenu(null)}
        />
      )}
    </>
  );
};

export default OptionDropdown;
