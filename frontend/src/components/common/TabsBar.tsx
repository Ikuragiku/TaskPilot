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
  onReorder?: (newTabs: string[]) => void;
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
  , onReorder
}) => {
  // drag state
  let dragIndex: number | null = null;

  const onDragStart = (e: React.DragEvent<HTMLButtonElement>, idx: number, tab: string) => {
    // prevent dragging the reserved 'All' tab
    if (tab === 'All') {
      e.preventDefault();
      return;
    }
    dragIndex = idx;
    e.dataTransfer.effectAllowed = 'move';
    try {
      e.dataTransfer.setData('text/plain', String(idx));
    } catch {
      // ignore if unavailable
    }
    // add dragging class for visual feedback
    try { e.currentTarget.classList.add('dragging'); } catch {}
  };

  const onDragOver = (e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    // mark this button as a potential drop target
    try { e.currentTarget.classList.add('drop-target'); } catch {}
  };

  const onDrop = (e: React.DragEvent<HTMLButtonElement>, targetIdx: number, targetTab: string) => {
    e.preventDefault();
    if (!onReorder) return;
    if (targetTab === 'All') return; // don't allow dropping onto reserved

    const src = dragIndex !== null ? dragIndex : Number(e.dataTransfer.getData('text/plain'));
    const dst = targetIdx;
    if (isNaN(src) || src === dst) return;

    const next = [...tabs];
    const [moved] = next.splice(src, 1);
    // if removing an earlier index shifts target, adjust
    const insertIdx = src < dst ? dst : dst;
    next.splice(insertIdx, 0, moved);
    onReorder(next);
    // cleanup classes
    try {
      const parent = e.currentTarget.parentElement;
      parent?.querySelectorAll('.tab').forEach(el => el.classList.remove('drop-target', 'dragging'));
    } catch {}
  };

  const onDragEnd = (e?: React.DragEvent<HTMLButtonElement>) => {
    dragIndex = null;
    // remove dragging class from all tabs
    try {
      const root = e?.currentTarget?.parentElement || document.querySelector('.tabs-container');
      root?.querySelectorAll('.tab').forEach(el => el.classList.remove('dragging', 'drop-target'));
    } catch {}
  };

  return (
    <div className="tabs-container">
      {tabs.map((tab, idx) => (
        <button
          key={tab}
          className={`tab${tab === activeTab ? ' active' : ''}`}
          onClick={() => onTabClick(tab)}
          onContextMenu={(e) => {
            e.preventDefault();
            if (tab === 'All') return;
            onTabContextMenu(e.pageX, e.pageY, tab);
          }}
          draggable={tab !== 'All'}
          onDragStart={(e) => onDragStart(e, idx, tab)}
          onDragOver={onDragOver}
          onDrop={(e) => onDrop(e, idx, tab)}
          onDragEnd={onDragEnd}
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
