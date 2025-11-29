/**
 * RecipeIngredientsModal Component
 * 
 * A portal-based modal for viewing the full list of ingredients or recipe steps.
 * Displays all items in a scrollable view with an edit button to switch to edit mode.
 * 
 * Features:
 * - Full-height scrollable list
 * - Edit button to open the ingredient dropdown editor
 * - Smart positioning near anchor element when provided
 * - Close button and backdrop dismiss
 * - Configurable label (Ingredients, Recipe, etc.)
 * 
 * @component
 * @example
 * <RecipeIngredientsModal
 *   recipeId="recipe-123"
 *   items={recipe.ingredients}
 *   onClose={() => setModal(null)}
 *   onEdit={(id) => openEditor(id)}
 *   label="Ingredients"
 * />
 */
import React from 'react';
import { createPortal } from 'react-dom';

/** Ingredient/item type definition */
type Ingredient = { id: string; name: string };

/**
 * Props for RecipeIngredientsModal component
 */
type Props = {
  recipeId: string;
  items: Ingredient[];
  onClose: () => void;
  onEdit: (recipeId: string) => void;
  anchorEl?: HTMLElement | null;
  label?: string;
};

/**
 * RecipeIngredientsModal component - displays full ingredient/recipe item list
 * @param {Props} props - Component props
 * @returns {JSX.Element} Portal-rendered modal with item list
 */
const RecipeIngredientsModal: React.FC<Props> = ({ recipeId, items, onClose, onEdit, anchorEl = null, label = 'Ingredients' }) => {
  // Compute modal position: if anchorEl provided, position near it (closer to the item).
  const style: React.CSSProperties = {};
  if (anchorEl) {
    try {
      const rect = anchorEl.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const width = Math.min(760, Math.max(520, vw * 0.6));
      // place modal to the right of the anchor if space, otherwise align left and slightly above the anchor
      let left = rect.right + window.scrollX + 8;
      if (left + width > window.scrollX + vw - 12) {
        left = Math.max(12, rect.left + window.scrollX - width - 8);
      }
      // try to align vertically near the anchor top, but clamp to viewport
      let top = rect.top + window.scrollY - 12;
      top = Math.max(12 + window.scrollY, Math.min(top, window.scrollY + vh - 120));
      style.position = 'absolute';
      style.top = top;
      style.left = left;
      style.minWidth = width;
      style.maxWidth = '90vw';
      style.zIndex = 1201;
    } catch (err) {
      // fallback to centered if something fails
    }
  }

  const content = (
    <>
      <div className="modal-backdrop" onClick={onClose} />
      <div className="modal-window" style={style}>
        <div style={{ padding: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ margin: 0, fontSize: '1.125rem' }}>All {label}</h3>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn small" onClick={() => onEdit(recipeId)}>Edit</button>
              <button className="icon-btn close" onClick={onClose} aria-label="Close ingredients" title="Close">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>
          <div style={{ maxHeight: '60vh', overflow: 'auto' }}>
            <ul style={{ listStyle: 'none', paddingLeft: 0, margin: 0 }}>
              {items.length === 0 && <li className="muted">No ingredients</li>}
              {items.map(i => (
                <li key={i.id} style={{ padding: '0.6rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  {i.name}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  );

  return createPortal(content, document.body);
};

export default RecipeIngredientsModal;
