/**
 * TabsBar Component
 *
 * Renders the tab navigation for projects. Supports tab selection, context menu, and adding new tabs.
 */
import React from 'react';

interface TabsBarProps {
  tabs: string[];
  activeTab: string;
  onTabClick: (tab: string) => void;
  onTabContextMenu: (x: number, y: number, tab: string) => void;
  onAddTabClick: (element: HTMLElement) => void;
}

/**
 * Tab navigation bar for switching between project views.
 */
export const TabsBar: React.FC<TabsBarProps> = ({
  tabs,
  activeTab,
  onTabClick,
  onTabContextMenu,
  onAddTabClick
}) => {
  return (
    <div className="tabs-container">
      {tabs.map(tab => (
        <button
          key={tab}
          className={`tab${tab === activeTab ? ' active' : ''}`}
          onClick={() => onTabClick(tab)}
          onContextMenu={(e) => {
            e.preventDefault();
            if (tab === 'All Tasks') return;
            onTabContextMenu(e.pageX, e.pageY, tab);
          }}
        >
          {tab}
        </button>
      ))}
      <button
        className="tab add-tab"
        title="Add project tab"
        onClick={(e) => onAddTabClick(e.currentTarget)}
      >
        +
      </button>
    </div>
  );
};
