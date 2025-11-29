/**
 * GroceryDashboard Component
 *
 * Main workspace for TaskPilot. Handles task CRUD, filtering, sorting, tab management, and option editing.
 * Integrates all GroceryDashboard UI components and manages state, persistence, and server sync.
 */
import React, { useEffect, useRef, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useGroceries, useCreateGrocery, useUpdateGrocery, useDeleteGrocery } from '../../hooks/useGroceries';
import { useStatusOptions, useCreateStatusOption, useUpdateStatusOption, useDeleteStatusOption } from '../../hooks/useOptions';
import { useGroceryCategories, useCreateGroceryCategory, useUpdateGroceryCategory, useDeleteGroceryCategory } from '../../hooks/useGroceryCategories';
import { Grocery } from '../../types';
import { Filters } from '../../utils/taskFilters';
import { SEARCH_KEY, SHOW_FILTERS_KEY, SHOW_SORTS_KEY } from '../../utils/constants';
import { TabsBar } from '../common/TabsBar';
import { FilterChips } from '../common/FilterChips';
import { GroceryToolbar } from './GroceryToolbar';
import { GroceryTableHeader } from './GroceryTableHeader';
import { TaskCell } from './GroceryCell';
import { OptionDropdown } from '../common/OptionDropdown';
import GroceryOptionDropdown from './GroceryOptionDropdown';
import { FilterDropdown } from '../common/FilterDropdown';
import { SortDropdown } from '../common/SortDropdown';
import { AddTabDropdown } from '../common/AddTabDropdown';
import { TabContextMenu } from '../common/TabContextMenu';
import '../../styles/dashboard.css';
import { useNavigate } from 'react-router-dom';

/**
 * Renders the main GroceryDashboard UI, including tabs, toolbar, table, and dropdowns.
 */
export const GroceryDashboard: React.FC = () => {
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  const { data: tasks = [], isLoading } = useGroceries();
  const { data: statusOptions = [] } = useStatusOptions();
  const { data: groceryCategories = [] } = useGroceryCategories();
  const closeAllMenus = () => {
    setFilterAnchor(null);
    setSortAnchor(null);
    setAddTabAnchor(null);
    setOptionMenu(null);
    setTabMenu(null);
  };
  
  const createGrocery = useCreateGrocery();
  const updateGrocery = useUpdateGrocery();
  const deleteGrocery = useDeleteGrocery();
  const createStatus = useCreateStatusOption();
  const updateStatus = useUpdateStatusOption();
  const deleteStatus = useDeleteStatusOption();
  const createGroceryCategory = useCreateGroceryCategory();
  const updateGroceryCategory = useUpdateGroceryCategory();
  const deleteGroceryCategory = useDeleteGroceryCategory();

  // State matching original app.js
  const [search, setSearch] = useState<string>(() => {
    try {
      return localStorage.getItem(SEARCH_KEY) || '';
    } catch {
      return '';
    }
  });
  const GROCERY_COLUMNS_KEY = 'organize_me_grocery_col_order_v1';
  const [columns, setColumns] = useState<string[]>(() => {
    // Use a grocery-specific columns key so grocery columns are independent from tasks
    const defaultCols = ['done', 'name', 'menge', 'kategorie'];
    try {
      const saved = JSON.parse(localStorage.getItem(GROCERY_COLUMNS_KEY) || '[]');
      if (saved.length > 0) {
        const savedSet = new Set(saved);
        const missing = defaultCols.filter(c => !savedSet.has(c));
        return [...saved, ...missing];
      }
      return [...defaultCols];
    } catch {
      return [...defaultCols];
    }
  });

  const [filters, setFilters] = useState<Filters>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('organize_me_grocery_filters_v1') || '{}');
      return {
        status: saved.status || [],
        project: saved.project || [],
        done: saved.done ?? null
      };
    } catch {
      return { status: [], project: [], done: null };
    }
  });

  const [sorts, setSorts] = useState<any[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('organize_me_grocery_sorts_v1') || '[]');
    } catch {
      return [];
    }
  });

  // Namespace tabs/active tab keys so groceries don't share tabs with tasks
  const GROCERY_TABS_KEY = 'organize_me_grocery_tabs_v1';
  const GROCERY_ACTIVE_TAB_KEY = 'organize_me_grocery_active_tab_v1';

  const [tabs, setTabs] = useState<string[]>(() => {
    try {
      const savedTabs = JSON.parse(localStorage.getItem(GROCERY_TABS_KEY) || '["All"]');
      const t = savedTabs.length ? savedTabs : ['All'];
      if (!t.includes('All')) {
        t.unshift('All');
      }
      return t;
    } catch {
      return ['All'];
    }
  });

  const [activeTab, setActiveTab] = useState<string>(() => {
    const saved = localStorage.getItem(GROCERY_ACTIVE_TAB_KEY) || 'All';
    return saved;
  });

  const tbodyRef = useRef<HTMLTableSectionElement>(null);
  // retained ref no longer needed after header extraction

  const [optionMenu, setOptionMenu] = useState<{
    anchor: HTMLElement | null;
    type: 'status' | 'project';
    task: any | null;
  } | null>(null);
  const [filterAnchor, setFilterAnchor] = useState<HTMLElement | null>(null);
  const [sortAnchor, setSortAnchor] = useState<HTMLElement | null>(null);
  const [addTabAnchor, setAddTabAnchor] = useState<HTMLElement | null>(null);
  const [tabMenu, setTabMenu] = useState<{ x: number; y: number; tab: string } | null>(null);
  const [showFilters, setShowFilters] = useState<boolean>(() => {
    try {
      return JSON.parse(localStorage.getItem(SHOW_FILTERS_KEY) || 'false');
    } catch {
      return false;
    }
  });
  const [showSorts, setShowSorts] = useState<boolean>(() => {
    try {
      return JSON.parse(localStorage.getItem(SHOW_SORTS_KEY) || 'false');
    } catch {
      return false;
    }
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [taskContextMenu, setTaskContextMenu] = useState<{ x: number; y: number; taskId: string } | null>(null);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(GROCERY_COLUMNS_KEY, JSON.stringify(columns));
  }, [columns]);

  useEffect(() => {
    localStorage.setItem('organize_me_grocery_filters_v1', JSON.stringify(filters));
  }, [filters]);

  useEffect(() => {
    localStorage.setItem('organize_me_grocery_sorts_v1', JSON.stringify(sorts));
  }, [sorts]);

  useEffect(() => {
    localStorage.setItem(SEARCH_KEY, search);
  }, [search]);

  useEffect(() => {
    localStorage.setItem(GROCERY_TABS_KEY, JSON.stringify(tabs));
  }, [tabs]);

  useEffect(() => {
    localStorage.setItem(GROCERY_ACTIVE_TAB_KEY, activeTab);
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem(SHOW_FILTERS_KEY, JSON.stringify(showFilters));
  }, [showFilters]);

  useEffect(() => {
    localStorage.setItem(SHOW_SORTS_KEY, JSON.stringify(showSorts));
  }, [showSorts]);

  // Filter and sort groceries (simple implementation separate from tasks)
  const filteredTasks = (tasks || []).filter((g) => {
    // active tab (tabs are category values)
            if (activeTab && activeTab !== 'All') {
      const cat = groceryCategories.find(c => c.value === activeTab);
      if (!cat) return false;
      if (!g.kategorieIds || !g.kategorieIds.includes(cat.id)) return false;
    }

    // project filters map to kategorie values
    if (filters.project && filters.project.length > 0) {
      const ids = groceryCategories.filter(c => filters.project.includes(c.value)).map(c => c.id);
      if (!g.kategorieIds || !g.kategorieIds.some(id => ids.includes(id))) return false;
    }

    // done filter
    if (filters.done !== null) {
      if (Boolean(g.done) !== Boolean(filters.done)) return false;
    }

    // search in title or menge
    if (search && search.trim()) {
      const s = search.toLowerCase();
      if (!((g.title || '').toLowerCase().includes(s) || (g.menge || '').toLowerCase().includes(s))) return false;
    }

    return true;
  });

  // basic sorting using existing sort definitions (if any) — default: by createdAt desc
  // Apply grocery-specific sorts: supported fields: 'name' (title), 'menge', 'kategorie', 'done'
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (!sorts || sorts.length === 0) return 0;
    for (const s of sorts) {
      const field = s.field;
      const asc = s.asc;
      let aVal: any = undefined;
      let bVal: any = undefined;
      if (field === 'name') {
        aVal = (a.title || '').toLowerCase();
        bVal = (b.title || '').toLowerCase();
      } else if (field === 'menge') {
        aVal = (a.menge || '').toLowerCase();
        bVal = (b.menge || '').toLowerCase();
      } else if (field === 'kategorie') {
        const aNames = (a.kategorieIds || []).map(id => groceryCategories.find(c => c.id === id)?.value || '').join(',').toLowerCase();
        const bNames = (b.kategorieIds || []).map(id => groceryCategories.find(c => c.id === id)?.value || '').join(',').toLowerCase();
        aVal = aNames;
        bVal = bNames;
      } else if (field === 'done') {
        aVal = a.done ? 1 : 0;
        bVal = b.done ? 1 : 0;
      } else {
        // Fallback: read property dynamically from the grocery object in a type-safe way
        const aRec = a as unknown as Record<string, unknown>;
        const bRec = b as unknown as Record<string, unknown>;
        // Ensure the dynamic field is a string key before indexing the records
        const key = String(field);
        const aFieldVal = aRec[key];
        const bFieldVal = bRec[key];
        aVal = String(aFieldVal ?? '').toLowerCase();
        bVal = String(bFieldVal ?? '').toLowerCase();
      }

      if (aVal < bVal) return asc ? -1 : 1;
      if (aVal > bVal) return asc ? 1 : -1;
      // equal -> continue to next sort
    }
    return 0;
  });

  // Update helper for child cells
  const updateTaskField = async (id: string, input: any) => {
    try {
      await updateGrocery.mutateAsync({ id, input });
    } catch (err: any) {
      console.error('Update failed', err);
      setErrorMessage(err?.message || 'Failed to update grocery');
    }
  };

  // Open React portal option dropdown
  const openOptionDropdown = (cell: HTMLElement, type: 'status' | 'project', task: Grocery) => {
    closeAllMenus();
    // Build a task-like object for OptionDropdown so it can read .projects/.statuses
    const taskLike: any = { ...task };
    if (type === 'project') {
      taskLike.projects = groceryCategories.filter(c => (task.kategorieIds || []).includes(c.id));
      taskLike.statuses = [];
    } else {
      taskLike.statuses = [];
      taskLike.projects = [];
    }
    setOptionMenu({ anchor: cell, type, task: taskLike });
  };

  const openFilterMenu = (btn: HTMLElement) => {
    closeAllMenus();
    setFilterAnchor(btn);
  };

  const openSortMenu = (btn: HTMLElement) => {
    closeAllMenus();
    setSortAnchor(btn);
  };

  const toggleFilters = () => {
    setShowFilters(prev => !prev);
  };

  const toggleSorts = () => {
    setShowSorts(prev => !prev);
  };

  const openAddTabMenu = (btn: HTMLElement) => {
    closeAllMenus();
    setAddTabAnchor(btn);
  };

  const openTabMenu = (x: number, y: number, tab: string) => {
    closeAllMenus();
    setTabMenu({ x, y, tab });
  };

  // dropdown listeners handled within portal components

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  return (
    <div>
      {errorMessage && (
        <div className="error-banner" style={{ background: '#ffe6e6', color: '#900', padding: '0.5rem 1rem', borderRadius: 6, margin: '0.5rem 0' }}>
          <strong>Error:</strong>&nbsp;{errorMessage}
          <button style={{ float: 'right' }} className="btn small" onClick={() => setErrorMessage(null)}>Dismiss</button>
        </div>
      )}
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
      </header>

      <main className="container">
        <section className="card">
          <div className="tabs-toolbar-row">
            <TabsBar
              tabs={tabs}
              activeTab={activeTab}
              onTabClick={setActiveTab}
              onTabContextMenu={openTabMenu}
              onAddTabClick={openAddTabMenu}
              onReorder={(newTabs) => setTabs(newTabs)}
            />
            <GroceryToolbar
              onAddGrocery={async () => {
                try {
                  const selectedCategoryIds = (() => {
                    const fromTab = activeTab !== 'All' ? groceryCategories.filter(c => c.value === activeTab).map(c => c.id) : [];
                    const fromFilters = (filters.project || []).map(val => groceryCategories.find(c => c.value === val)?.id).filter(Boolean) as string[];
                    return Array.from(new Set([ ...fromTab, ...fromFilters ]));
                  })();
                  const doneValue = filters.done !== null ? Boolean(filters.done) : undefined;
                  await createGrocery.mutateAsync({
                    title: 'New Grocery',
                    projectIds: selectedCategoryIds.length ? selectedCategoryIds : undefined,
                    done: doneValue,
                  });
                } catch (error) {
                  console.error('Failed to create grocery:', error);
                }
              }}
              onFilterClick={toggleFilters}
              onSortClick={toggleSorts}
              searchValue={search}
              onSearchChange={setSearch}
              hasActiveFilters={filters.status.length > 0 || filters.project.length > 0 || filters.done !== null}
              hasActiveSorts={sorts.length > 0}
              isFilterOpen={showFilters}
              isSortOpen={showSorts}
            />
          </div>

          {(showFilters || showSorts) && (
            <FilterChips
              filters={filters}
              sorts={sorts}
              statusOptions={statusOptions}
              projectOptions={groceryCategories}
              onRemoveStatusFilter={(s: string) => setFilters(f => ({ ...f, status: f.status.filter(x => x !== s) }))}
              onRemoveProjectFilter={(p: string) => setFilters(f => ({ ...f, project: f.project.filter(x => x !== p) }))}
              onRemoveDoneFilter={() => setFilters(f => ({ ...f, done: null }))}
              onRemoveSort={(i: number) => setSorts(old => old.filter((_, idx) => idx !== i))}
              onClearFilters={() => setFilters({ status: [], project: [], done: null })}
              onClearSorts={() => setSorts([])}
              onAddFilterClick={openFilterMenu}
              onAddSortClick={openSortMenu}
              showFilters={showFilters}
              showSorts={showSorts}
            />
          )}

          <div className="table-wrap">
            <table className="tasks-table">
              <GroceryTableHeader
                columns={columns}
                sorts={sorts}
                setColumns={setColumns}
                setSorts={setSorts}
              />
              <tbody ref={tbodyRef}>
                {isLoading && (
                  <tr>
                    <td colSpan={columns.length}>
                      <div className="loading" style={{ height: 40 }} />
                    </td>
                  </tr>
                )}
                {!isLoading && sortedTasks.length === 0 && (
                  <tr>
                    <td colSpan={columns.length} className="muted">
                      No groceries found
                    </td>
                  </tr>
                )}
                {sortedTasks.map((task, rowIdx) => (
                  <tr
                    key={task.id}
                    data-id={task.id}
                    className={task.done ? 'is-done' : undefined}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      setTaskContextMenu({
                        x: e.clientX + window.scrollX,
                        y: e.clientY + window.scrollY,
                        taskId: task.id
                      });
                    }}
                  >
                    {columns.map((col) => (
                      <TaskCell
                        key={col}
                        col={col}
                        task={task}
                        updateTaskField={updateTaskField}
                        onOpenOptionDropdown={(cell, type) => openOptionDropdown(cell, type, task)}
                        rowIdx={rowIdx}
                        
                        editableCols={columns.filter(c => c === 'name' || c === 'menge' || c === 'kategorie')}
                        groceryCategories={groceryCategories}
                        totalRows={sortedTasks.length}
                        focusCell={(r, c) => {
                          // Find the correct cell and focus it
                          const tbody = tbodyRef.current;
                          if (!tbody) return;
                          const rows = Array.from(tbody.querySelectorAll('tr'));
                          if (r >= rows.length) r = 0;
                          const row = rows[r];
                          if (!row) return;
                          const editableCols = columns.filter(col => col === 'name' || col === 'menge' || col === 'kategorie');
                          const colName = editableCols[c];
                            let dataField: string = colName as string;
                          // map grocery column keys to the cell data-field attributes used in GroceryCell
                          if (dataField === 'name') dataField = 'title';
                          if (dataField === 'menge') dataField = 'description';
                          if (dataField === 'kategorie') dataField = 'project';
                          const cell = Array.from(row.children).find(td => td.getAttribute('data-field') === dataField);
                          if (cell) {
                            (cell as HTMLElement).focus();
                          }
                        }}
                      />
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        {addTabAnchor && (
            <AddTabDropdown
            anchorEl={addTabAnchor}
            projectOptions={groceryCategories}
            tabs={tabs}
            setTabs={setTabs}
            setActiveTab={setActiveTab}
            createProject={(data) => createGroceryCategory.mutateAsync(data).then(() => undefined)}
            onClose={() => setAddTabAnchor(null)}
          />
        )}
        {tabMenu && (
          <TabContextMenu
            x={tabMenu.x}
            y={tabMenu.y}
            tab={tabMenu.tab}
            onDelete={() => {
              setTabs(t => t.filter(x => x !== tabMenu.tab));
              if (activeTab === tabMenu.tab) setActiveTab('All Tasks');
              setTabMenu(null);
            }}
            onClose={() => setTabMenu(null)}
          />
        )}
        {filterAnchor && (
            <FilterDropdown
            anchorEl={filterAnchor}
            statusOptions={[]}
            projectOptions={groceryCategories}
            showStatus={false}
            projectLabel={'Kategorie'}
            filters={filters}
            setFilters={setFilters}
            onClose={() => setFilterAnchor(null)}
          />
        )}
        {sortAnchor && (
            <SortDropdown
            anchorEl={sortAnchor}
            sorts={sorts}
            setSorts={setSorts}
            fields={[ 'name', 'menge', 'kategorie', 'done' ]}
            onClose={() => setSortAnchor(null)}
          />
        )}
        {optionMenu?.task && (
          optionMenu.type === 'project' ? (
            <GroceryOptionDropdown
              anchorEl={optionMenu.anchor}
              task={optionMenu.task}
              options={groceryCategories}
              onClose={() => setOptionMenu(null)}
              updateTask={(id, input) => updateGrocery.mutateAsync({ id, input }).then(() => undefined)}
              createCategory={(data) => createGroceryCategory.mutateAsync(data).then(() => undefined)}
              deleteCategory={(id) => deleteGroceryCategory.mutateAsync(id).then(() => undefined)}
              updateCategory={(id, data) => updateGroceryCategory.mutateAsync({ id, data }).then(() => undefined)}
              onOptionDeleted={(opt) => {
                setTabs(t => t.filter(x => x !== opt.value));
                if (activeTab === opt.value) setActiveTab('All Tasks');
                // also clear any category filter using this value
                setFilters(f => ({ ...f, project: (f.project || []).filter(v => v !== opt.value) }));
              }}
            />
          ) : (
            <OptionDropdown
              anchorEl={optionMenu.anchor}
              type={optionMenu.type}
              task={optionMenu.task}
              options={statusOptions}
              onClose={() => setOptionMenu(null)}
              updateTask={(id, input) => updateGrocery.mutateAsync({ id, input }).then(() => undefined)}
              createOption={(data) => createStatus.mutateAsync(data).then(() => undefined)}
              deleteOption={(id) => deleteStatus.mutateAsync(id).then(() => undefined)}
              updateOption={(id, data) => updateStatus.mutateAsync({ id, data }).then(() => undefined)}
              onOptionDeleted={() => {}}
            />
          )
        )}
      </main>

      {tabMenu && (
        <TabContextMenu
          x={tabMenu.x}
          y={tabMenu.y}
          tab={tabMenu.tab}
          onDelete={() => {
            setTabs(tabs.filter(t => t.toLowerCase() !== tabMenu.tab.toLowerCase()));
            if (activeTab === tabMenu.tab) {
              setActiveTab('All Tasks');
            }
            setTabMenu(null);
          }}
          onClose={() => setTabMenu(null)}
        />
      )}

          {taskContextMenu && (
        <TabContextMenu
          x={taskContextMenu.x}
          y={taskContextMenu.y}
          tab="Delete Task"
          onDelete={async () => {
            await deleteGrocery.mutateAsync(taskContextMenu.taskId);
            setTaskContextMenu(null);
          }}
          onClose={() => setTaskContextMenu(null)}
        />
      )}
    </div>
  );
};
