/**
 * DeleteConfirmMenu Component
 *
 * Portal-based confirmation dialog for deleting items (tasks, tabs, options). Handles keyboard and click events.
 */
import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

type Props = {
  x: number;
  y: number;
  itemName: string;
  itemType: string;
  onConfirm: () => void;
  onClose: () => void;
};

/**
 * Renders a confirmation menu for delete actions. Used for safe destructive operations.
 */
export const DeleteConfirmMenu: React.FC<Props> = ({ x, y, itemName, itemType, onConfirm, onClose }) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const content = (
    <>
      <div className="dropdown-backdrop" onClick={onClose} />
      <div className="dd-menu delete-confirm-menu" style={{ position: 'absolute', top: y, left: x }}>
        <div className="dd-sec">
          <p className="dd-title">Delete {itemType}?</p>
          <p style={{ color: 'var(--muted)', fontSize: '0.875rem', margin: '0.5rem 0 1rem' }}>
            "{itemName}"
          </p>
          <div className="dd-actions" style={{ gap: '0.5rem' }}>
            <button className="btn small primary" onClick={onClose}>Cancel</button>
            <button className="btn small" style={{ background: 'var(--danger)', color: 'white' }} onClick={handleConfirm}>Delete</button>
          </div>
        </div>
      </div>
    </>
  );

  return createPortal(content, document.body);
};
