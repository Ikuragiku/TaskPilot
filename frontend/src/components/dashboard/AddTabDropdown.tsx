/**
 * AddTabDropdown Component
 *
 * Dropdown for adding a new project tab or selecting an existing one. Supports color selection and keyboard handling.
 */
import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { ProjectOption } from '../../types';
import { PALETTE } from '../../utils/constants';
import { ColorPalettePicker } from './ColorPalettePicker';

type Props = {
  anchorEl: HTMLElement | null;
  projectOptions: ProjectOption[];
  tabs: string[];
  setTabs: React.Dispatch<React.SetStateAction<string[]>>;
  setActiveTab: (tab: string) => void;
  createProject: (data: { value: string; color: string }) => Promise<void>;
  onClose: () => void;
};

/**
 * Renders the add tab dropdown UI for projects. Handles selection, creation, and color picking.
 */
export const AddTabDropdown: React.FC<Props> = ({
  anchorEl,
  projectOptions,
  tabs,
  setTabs,
  setActiveTab,
  createProject,
  onClose
}) => {
  const pos = useMemo(() => {
    if (!anchorEl) return { top: 0, left: 0 };
    const rect = anchorEl.getBoundingClientRect();
    return { top: rect.bottom + window.scrollY + 6, left: rect.left + window.scrollX };
  }, [anchorEl]);

  const available = useMemo(() => projectOptions.filter(p => !tabs.includes(p.value)), [projectOptions, tabs]);

  const [name, setName] = useState('');
  const [color, setColor] = useState(PALETTE[0].color);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const addExisting = (value: string) => {
    if (!tabs.includes(value)) setTabs(t => [...t, value]);
    setActiveTab(value);
    onClose();
  };

  const handleAddNew = async () => {
    const v = name.trim();
    if (!v) return;
    await createProject({ value: v, color });
    if (!tabs.includes(v)) setTabs(t => [...t, v]);
    setActiveTab(v);
    onClose();
  };

  const content = (
    <>
      <div className="dropdown-backdrop" onClick={onClose} />
      <div className="dd-menu" style={{ position: 'absolute', top: pos.top, left: pos.left }}>
        <div className="dd-sec">
          <p className="dd-title">Add project tab</p>
          <ul className="dd-list">
            {available.length === 0 && (
              <li className="dd-item" style={{ cursor: 'default' }}>No projects available</li>
            )}
            {available.map(p => (
              <li key={p.id} className="dd-item" onClick={() => addExisting(p.value)}>
                <span className="dot" style={{ background: p.color }} />
                <span>{p.value}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="dd-sec dd-add">
          <p className="dd-title">Add new project</p>
          <div className="dd-input-row">
            <input type="text" className="dd-input name" placeholder="Project name" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <ColorPalettePicker selectedColor={color} onColorSelect={setColor} />
          <button className="btn small add-btn" onClick={handleAddNew}>Add</button>
        </div>
      </div>
    </>
  );

  return createPortal(content, document.body);
};

export default AddTabDropdown;
