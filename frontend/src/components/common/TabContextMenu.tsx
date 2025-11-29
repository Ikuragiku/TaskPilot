/**
 * TabContextMenu Component
 *
 * Portal-based context menu for tab actions (delete). Handles keyboard and click events.
 */
import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

type Props = {
  x: number;
  y: number;
  tab: string;
  onDelete: () => void;
  onClose: () => void;
};

/**
 * Renders a context menu for tab actions (currently delete only).
 */
export const TabContextMenu: React.FC<Props> = ({ x, y, tab: _tab, onDelete, onClose }) => {
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
