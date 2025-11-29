/**
 * Hub Component
 *
 * Renders the application hub with navigation tiles for each module (Tasks, Groceries, etc.).
 * - Displays module tiles with icons and links.
 * - Provides a logout button via `useAuthStore()`.
 * - Styles are imported from `../../styles/Hub.css`.
 *
 * Usage:
 * <Hub /> mounted at the root route to let users navigate to app modules.
 */
import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import '../../styles/Hub.css';
import TasksDoneIcon from '../icons/TasksDone';
import GroceriesIcon from '../icons/Groceries';
import RecipesIcon from '../icons/Recipes';

/**
 * Hub
 * - Renders a grid of module tiles that link into app sections.
 * - Tiles are reorderable with drag-and-drop; order is persisted in localStorage
 *   under the key `organize_me_hub_tiles_v1`.
 */
const Hub: React.FC = () => {
  const { logout } = useAuthStore();

  // localStorage key for hub tiles order
  const HUB_TILES_KEY = 'organize_me_hub_tiles_v1';

  const icons: Record<string, JSX.Element> = {
    Tasks: <TasksDoneIcon width={64} height={64} fill="#fff" />,
    Groceries: <GroceriesIcon width={64} height={64} fill="#fff" />,
    Recipes: <RecipesIcon width={64} height={64} fill="#fff" />
  };

  // Default tile definitions; include stable ids so keys remain unique.
  const defaultModules = [
    { id: 'tasks', to: '/tasks', title: 'Tasks', desc: '' },
    { id: 'groceries', to: '/groceries', title: 'Groceries', desc: '' },
    { id: 'recipes', to: '/recipes', title: 'Recipes', desc: '' },
    { id: 'placeholder-1', to: '/', title: '', desc: '' },
    { id: 'placeholder-2', to: '/', title: '', desc: '' },
    { id: 'placeholder-3', to: '/', title: '', desc: '' },
    { id: 'placeholder-4', to: '/', title: '', desc: '' },
    { id: 'placeholder-5', to: '/', title: '', desc: '' },
  ];

  const [modules, setModules] = useState<typeof defaultModules>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(HUB_TILES_KEY) || 'null');
      if (Array.isArray(saved) && saved.length === defaultModules.length) {
        // Normalize routes so tiles lead to the correct paths even if titles changed
        const normalize = (mods: typeof defaultModules) => mods.map(m => {
          if (m.id === 'tasks') return { ...m, to: '/tasks' };
          if (m.id === 'groceries') return { ...m, to: '/groceries' };
          if (m.id === 'recipes') return { ...m, to: '/recipes' };
          return m;
        });
        return normalize(saved);
      }
    } catch {}
    return defaultModules;
  });

  // persist order
  useEffect(() => {
    try {
      localStorage.setItem(HUB_TILES_KEY, JSON.stringify(modules));
    } catch {}
  }, [modules]);

  // drag index ref (avoids re-renders while dragging)
  const dragIdxRef = useRef<number | null>(null);

  const onDragStart = (e: React.DragEvent<HTMLAnchorElement>, idx: number) => {
    dragIdxRef.current = idx;
    e.dataTransfer.effectAllowed = 'move';
    try { e.dataTransfer.setData('text/plain', String(idx)); } catch {}
    try { (e.currentTarget as HTMLElement).classList.add('dragging'); } catch {}
  };

  const onDragOver = (e: React.DragEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    try { (e.currentTarget as HTMLElement).classList.add('drop-target'); } catch {}
  };

  const onDrop = (e: React.DragEvent<HTMLAnchorElement>, targetIdx: number) => {
    e.preventDefault();
    const src = dragIdxRef.current ?? Number(e.dataTransfer.getData('text/plain'));
    const dst = targetIdx;
    if (isNaN(src) || src === dst) return;
    const next = [...modules];
    const [moved] = next.splice(src, 1);
    next.splice(dst, 0, moved);
    setModules(next);
    // cleanup classes
    try {
      const root = document.querySelector('.hub-tiles');
      root?.querySelectorAll('.hub-tile').forEach(el => el.classList.remove('dragging', 'drop-target'));
    } catch {}
    dragIdxRef.current = null;
  };

  const onDragEnd = () => {
    dragIdxRef.current = null;
    try {
      const root = document.querySelector('.hub-tiles');
      root?.querySelectorAll('.hub-tile').forEach(el => el.classList.remove('dragging', 'drop-target'));
    } catch {}
  };

  return (
    <div className="hub-container">
      <div className="logout-wrap">
        <button className="btn small logout-btn" onClick={logout} title="Logout">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path d="M16 17l5-5-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Logout
        </button>
      </div>
      <div className="hub-tiles">
        {modules.map((m, idx) => (
          <Link
            key={m.id}
            to={m.to}
            className="hub-tile"
            draggable
            onDragStart={(e) => onDragStart(e, idx)}
            onDragOver={(e) => onDragOver(e)}
            onDrop={(e) => onDrop(e, idx)}
            onDragEnd={onDragEnd}
          >
            <div className="tile-content">
              <div className="hub-icon">
                {icons[m.title] ?? (
                  <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                    <circle cx="32" cy="32" r="28" fill="#fff" fillOpacity="0.12" />
                    <line x1="32" y1="20" x2="32" y2="44" stroke="#fff" strokeWidth="5" strokeLinecap="round" />
                    <line x1="20" y1="32" x2="44" y2="32" stroke="#fff" strokeWidth="5" strokeLinecap="round" />
                  </svg>
                )}
              </div>
              <h2>{m.title}</h2>
              <p className="hub-desc">{m.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Hub;