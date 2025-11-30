/**
 * TabContextMenu Component
 *
 * Portal-based context menu for tab/item actions. Handles keyboard and click events.
 * Supports multiple custom actions beyond just delete.
 */
import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

type MenuAction = {
  label: string;
  onClick: () => void;
  className?: string;
};

type Props = {
  x: number;
  y: number;
  tab: string;
  onDelete: () => void;
  onClose: () => void;
  actions?: MenuAction[]; // Additional actions before delete
};

/**
 * Renders a context menu for tab/item actions with customizable action list.
 */
export const TabContextMenu: React.FC<Props> = ({ x, y, tab: _tab, onDelete, onClose, actions }) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const content = (
    <>
      <div className="dropdown-backdrop" onClick={onClose} />
      <div className="dd-menu tab-menu" style={{ position: 'absolute', top: y, left: x }}>
        <div className="dd-sec">
          <ul className="dd-list">
            {actions?.map((action, idx) => (
              <li key={idx} className={`dd-item ${action.className || ''}`} onClick={action.onClick}>
                <span>{action.label}</span>
              </li>
            ))}
            <li className="dd-item del-tab" onClick={onDelete}>
              <span>{_tab.startsWith('Delete') ? _tab : 'Delete Tab'}</span>
            </li>
          </ul>
        </div>
      </div>
    </>
  );

  return createPortal(content, document.body);
};

export default TabContextMenu;
