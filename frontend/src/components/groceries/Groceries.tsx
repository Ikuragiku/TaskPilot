import { OptionDropdown } from '../taskboard/OptionDropdown';
import { useStatusOptions, useCreateStatusOption, useUpdateStatusOption, useDeleteStatusOption } from '../../hooks/useOptions';
import React, { useState, useRef } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';
import '../../styles/taskboard.css';
import { Filters } from '../../utils/taskFilters';
import { Sort } from '../../utils/taskSort';

// Reuse Taskboard UI components
import { TabsBar } from '../taskboard/TabsBar';
import { TaskToolbar } from '../taskboard/TaskToolbar';
import { FilterChips } from '../taskboard/FilterChips';
import { TaskTableHeader } from '../taskboard/TaskTableHeader';

const DEFAULT_COLUMNS = ['done', 'name', 'menge', 'kategorie'];

export const Groceries: React.FC = () => {
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  const [columns, setColumns] = useState<string[]>(DEFAULT_COLUMNS);
  const [tabs, setTabs] = useState<string[]>(['All Groceries']);
  const [activeTab, setActiveTab] = useState<string>('All Groceries');
  const [items, setItems] = useState<any[]>([]);
  const [newItem, setNewItem] = useState({ name: '', menge: '', kategorie: '', done: false });
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Filters>({ status: [], project: [], done: null });
  const [sorts, setSorts] = useState<Sort[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showSorts, setShowSorts] = useState(false);
  const tbodyRef = useRef<HTMLTableSectionElement>(null);

  // Move hooks here
  const { data: statusOptions = [] } = useStatusOptions();
  const createStatus = useCreateStatusOption();
  const updateStatus = useUpdateStatusOption();
  const deleteStatus = useDeleteStatusOption();
  const [optionMenu, setOptionMenu] = useState<{ anchor: HTMLElement | null; item: any | null } | null>(null);

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  const addItem = () => {
    setItems([...items, { name: '', menge: '', kategorie: '', done: false, id: Date.now().toString() }]);
  };

  const updateItem = (id: string, field: string, value: any) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  // Filtering, sorting, searching logic can be added here for items

  return (
    <div>
      <header className="app-header">
        <div className="logout-wrap">
          <button className="btn small hub-btn" onClick={() => navigate('/')} title="Go to Hub" style={{marginRight: '0.5rem'}}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <rect x="3" y="7" width="18" height="10" rx="3" stroke="currentColor" strokeWidth="2" fill="none"/>
              <line x1="7" y1="12" x2="17" y2="12" stroke="currentColor" strokeWidth="2"/>
            </svg>
            Hub
          </button>
          <button className="btn small logout-btn" onClick={handleLogout}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M16 17l5-5-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Logout
          </button>
        </div>
      </header>
      <main className="container">
        <section className="card">
          <div className="tabs-toolbar-row">
            <TabsBar
              tabs={tabs}
              activeTab={activeTab}
              onTabClick={setActiveTab}
              onTabContextMenu={() => {}}
              onAddTabClick={() => {}}
            />
            <TaskToolbar
              onAddTask={addItem}
              onFilterClick={() => setShowFilters(f => !f)}
              onSortClick={() => setShowSorts(s => !s)}
              searchValue={search}
              onSearchChange={setSearch}
              hasActiveFilters={!!filters.done}
              hasActiveSorts={sorts.length > 0}
              isFilterOpen={showFilters}
              isSortOpen={showSorts}
              addLabel="+ Add Grocerie"
            />
          </div>
          {(showFilters || showSorts) && (
            <FilterChips
              filters={filters}
              sorts={sorts}
              statusOptions={[]}
              projectOptions={[]}
              onRemoveStatusFilter={() => {}}
              onRemoveProjectFilter={() => {}}
              onRemoveDoneFilter={() => setFilters(f => ({ ...f, done: null }))}
              onRemoveSort={() => setSorts([])}
              onClearFilters={() => setFilters({ status: [], project: [], done: null })}
              onClearSorts={() => setSorts([])}
              onAddFilterClick={() => setShowFilters(f => !f)}
              onAddSortClick={() => setShowSorts(s => !s)}
              showFilters={showFilters}
              showSorts={showSorts}
            />
          )}
          <div className="table-wrap">
            <table className="tasks-table">
              <TaskTableHeader
                columns={columns}
                sorts={sorts}
                setColumns={setColumns}
                setSorts={setSorts}
              />
              <tbody ref={tbodyRef}>
                {items.length === 0 && (
                  <tr>
                    <td colSpan={columns.length} className="muted">No groceries found</td>
                  </tr>
                )}
                {items.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <input type="checkbox" checked={!!item.done} onChange={() => updateItem(item.id, 'done', !item.done)} />
                    </td>
                    <td
                      contentEditable
                      suppressContentEditableWarning
                      data-field="name"
                      tabIndex={0}
                      onBlur={e => updateItem(item.id, 'name', e.currentTarget.textContent || '')}
                    >
                      {item.name}
                    </td>
                    <td
                      contentEditable
                      suppressContentEditableWarning
                      data-field="menge"
                      tabIndex={0}
                      onBlur={e => updateItem(item.id, 'menge', e.currentTarget.textContent || '')}
                    >
                      {item.menge}
                    </td>
                    <td
                      data-field="kategorie"
                      tabIndex={0}
                      onClick={e => setOptionMenu({ anchor: e.currentTarget, item })}
                      style={{ cursor: 'pointer' }}
                    >
                      {item.kategorie ? (
                        <span className="badge">{item.kategorie}</span>
                      ) : (
                        <span className="muted">Select…</span>
                      )}
                    </td>
                  </tr>
                ))}
                    {optionMenu && optionMenu.item && (
                      <OptionDropdown
                        anchorEl={optionMenu.anchor}
                        type="status"
                        task={{
                          id: optionMenu.item.id,
                          title: optionMenu.item.name,
                          createdAt: '',
                          updatedAt: '',
                          statuses: optionMenu.item.kategorie ? [{ value: optionMenu.item.kategorie, color: '#888', id: 'custom', order: 0, createdAt: '' }] : [],
                          projects: [],
                        }}
                        options={statusOptions}
                        onClose={() => setOptionMenu(null)}
                        updateTask={async (_id, input) => {
                          updateItem(optionMenu.item.id, 'kategorie', input.statuses?.[0]?.value || '');
                        }}
                        createOption={async (data) => { await createStatus.mutateAsync(data); }}
                        deleteOption={async (id) => { await deleteStatus.mutateAsync(id); }}
                        updateOption={async (id, data) => { await updateStatus.mutateAsync({ id, data }); }}
                      />
                    )}
                <tr className="add-task-row">
                  <td colSpan={columns.length}>
                    <input
                      type="text"
                      placeholder="Name"
                      value={newItem.name}
                      onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                      style={{ marginRight: 8 }}
                    />
                    <input
                      type="text"
                      placeholder="Menge"
                      value={newItem.menge}
                      onChange={e => setNewItem({ ...newItem, menge: e.target.value })}
                      style={{ marginRight: 8 }}
                    />
                    <input
                      type="text"
                      placeholder="Kategorie"
                      value={newItem.kategorie}
                      onChange={e => setNewItem({ ...newItem, kategorie: e.target.value })}
                      style={{ marginRight: 8 }}
                    />
                    <button className="btn small" onClick={addItem}>Add</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
};
