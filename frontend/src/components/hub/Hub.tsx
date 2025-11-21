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
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import '../../styles/Hub.css';

const Hub: React.FC = () => {
  const { logout } = useAuthStore();

  const icons: Record<string, JSX.Element> = {
    Tasks: (
      <svg width="64" height="64" viewBox="0 0 32 32" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="7" width="24" height="18" rx="4" fill="none" />
        <line x1="9" y1="12" x2="23" y2="12" />
        <line x1="9" y1="18" x2="17" y2="18" />
      </svg>
    ),
    Groceries: (
      <svg width="64" height="64" viewBox="0 0 32 32" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
        <rect x="6" y="10" width="20" height="14" rx="2" fill="none" />
        <path d="M10 10c0-3 2.5-5 6-5s6 2 6 5" fill="none" />
        <line x1="8" y1="24" x2="24" y2="24" />
      </svg>
    ),
  };

  const modules = [
    { to: '/tasks', title: 'Tasks', desc: '' },
    { to: '/grocery', title: 'Groceries', desc: '' },
    { to: '/', title: '', desc: '' },
    { to: '/', title: '', desc: '' },
    { to: '/', title: '', desc: '' },
    { to: '/', title: '', desc: '' },
    { to: '/', title: '', desc: '' },
    { to: '/', title: '', desc: '' },
  ];

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
        {modules.map((m) => (
          <Link key={m.title} to={m.to} className="hub-tile">
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