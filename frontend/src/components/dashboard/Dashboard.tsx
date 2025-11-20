/**
 * Dashboard Component
 *
 * Main workspace for TaskPilot. Handles task CRUD, filtering, sorting, tab management, and option editing.
 * Integrates all dashboard UI components and manages state, persistence, and server sync.
 */
import React, { useEffect, useRef, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask, useTaskRealtime } from '../../hooks/useTasks';
import { useStatusOptions, useProjectOptions, useCreateStatusOption, useCreateProjectOption, useUpdateStatusOption, useUpdateProjectOption, useDeleteStatusOption, useDeleteProjectOption } from '../../hooks/useOptions';
import { Task } from '../../types';
import { filterTasks, Filters } from '../../utils/taskFilters';
import { sortTasks, Sort } from '../../utils/taskSort';
import { COLUMNS_KEY, TABS_KEY, ACTIVE_TAB_KEY, FILTERS_KEY, SORTS_KEY, DEFAULT_COLUMNS, SEARCH_KEY, SHOW_FILTERS_KEY, SHOW_SORTS_KEY } from '../../utils/constants';
import { TabsBar } from './TabsBar';
import { FilterChips } from './FilterChips';
import { TaskToolbar } from './TaskToolbar';
import { TaskTableHeader } from './TaskTableHeader';
import { TaskCell } from './TaskCell';
import { OptionDropdown } from './OptionDropdown';
import { FilterDropdown } from './FilterDropdown';
import { SortDropdown } from './SortDropdown';
import { AddTabDropdown } from './AddTabDropdown';
import { TabContextMenu } from './TabContextMenu';
import '../../styles/dashboard.css';
import { useNavigate } from 'react-router-dom';

/**
 * Renders the main dashboard UI, including tabs, toolbar, table, and dropdowns.
 */
export const Dashboard: React.FC = () => {
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  const { data: tasks = [], isLoading } = useTasks();
  const { data: statusOptions = [] } = useStatusOptions();
  const { data: projectOptions = [] } = useProjectOptions();
  const closeAllMenus = () => {
    setFilterAnchor(null);
    setSortAnchor(null);
    setAddTabAnchor(null);
    setOptionMenu(null);
    setTabMenu(null);
  };
  
  useTaskRealtime();

  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const createStatus = useCreateStatusOption();
  const createProject = useCreateProjectOption();
  const updateStatus = useUpdateStatusOption();
  const updateProject = useUpdateProjectOption();
  const deleteStatus = useDeleteStatusOption();
  const deleteProject = useDeleteProjectOption();

  // State matching original app.js
  const [search, setSearch] = useState<string>(() => {
    try {
      return localStorage.getItem(SEARCH_KEY) || '';
    } catch {
      return '';
    }
  });
  const [columns, setColumns] = useState<string[]>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(COLUMNS_KEY) || '[]');
      if (saved.length > 0) {
        const savedSet = new Set(saved);
        const missing = DEFAULT_COLUMNS.filter(c => !savedSet.has(c));
        return [...saved, ...missing];
      }
      return [...DEFAULT_COLUMNS];
    } catch {
      return [...DEFAULT_COLUMNS];
    }
  });

  const [filters, setFilters] = useState<Filters>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(FILTERS_KEY) || '{}');
      return {
        status: saved.status || [],
        project: saved.project || [],
        done: saved.done ?? null
      };
    } catch {
      return { status: [], project: [], done: null };
    }
  });

  const [sorts, setSorts] = useState<Sort[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(SORTS_KEY) || '[]');
    } catch {
      return [];
    }
  });

  const [tabs, setTabs] = useState<string[]>(() => {
    try {
      const savedTabs = JSON.parse(localStorage.getItem(TABS_KEY) || '["All Tasks"]');
      const t = savedTabs.length ? savedTabs : ['All Tasks'];
      if (!t.includes('All Tasks')) {
        t.unshift('All Tasks');
      }
      return t;
    } catch {
      return ['All Tasks'];
    }
  });

  const [activeTab, setActiveTab] = useState<string>(() => {
    const saved = localStorage.getItem(ACTIVE_TAB_KEY) || 'All Tasks';
    return saved;
  });

  const tbodyRef = useRef<HTMLTableSectionElement>(null);
  // retained ref no longer needed after header extraction

  const [optionMenu, setOptionMenu] = useState<{
    anchor: HTMLElement | null;
    type: 'status' | 'project';
    task: Task | null;
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
  const [taskContextMenu, setTaskContextMenu] = useState<{ x: number; y: number; taskId: string } | null>(null);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(COLUMNS_KEY, JSON.stringify(columns));
  }, [columns]);

  useEffect(() => {
    localStorage.setItem(FILTERS_KEY, JSON.stringify(filters));
  }, [filters]);

  useEffect(() => {
    localStorage.setItem(SORTS_KEY, JSON.stringify(sorts));
  }, [sorts]);

  useEffect(() => {
    localStorage.setItem(SEARCH_KEY, search);
  }, [search]);

  useEffect(() => {
    localStorage.setItem(TABS_KEY, JSON.stringify(tabs));
  }, [tabs]);

  useEffect(() => {
    localStorage.setItem(ACTIVE_TAB_KEY, activeTab);
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem(SHOW_FILTERS_KEY, JSON.stringify(showFilters));
  }, [showFilters]);

  useEffect(() => {
    localStorage.setItem(SHOW_SORTS_KEY, JSON.stringify(showSorts));
  }, [showSorts]);

  // Filter and sort tasks
  const filteredTasks = filterTasks(tasks, activeTab, filters, search);
  const sortedTasks = sortTasks(filteredTasks, sorts);

  // Update helper for child cells
  const updateTaskField = async (id: string, input: any) => {
    await updateTask.mutateAsync({ id, input });
  };

  // Open React portal option dropdown
  const openOptionDropdown = (cell: HTMLElement, type: 'status' | 'project', task: Task) => {
    closeAllMenus();
    setOptionMenu({ anchor: cell, type, task });
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
            />
            <TaskToolbar
              onAddTask={async () => {
                try {
                  await createTask.mutateAsync({
                    title: 'New Task',
                    projectIds: activeTab !== 'All Tasks'
                      ? projectOptions
                          .filter(p => p.value === activeTab)
                          .map(p => p.id)
                      : undefined
                  });
                } catch (error) {
                  console.error('Failed to create task:', error);
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
              projectOptions={projectOptions}
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
              <TaskTableHeader
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
                      No tasks found
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
                    {columns.map((col, colIdx) => (
                      <TaskCell
                        key={col}
                        col={col}
                        task={task}
                        updateTaskField={updateTaskField}
                        onOpenOptionDropdown={(cell, type) => openOptionDropdown(cell, type, task)}
                        rowIdx={rowIdx}
                        colIdx={colIdx}
                        editableCols={columns.filter(c => c === 'name' || c === 'description' || c === 'status' || c === 'deadline' || c === 'project')}
                        totalRows={sortedTasks.length}
                        focusCell={(r, c) => {
                          // Find the correct cell and focus it
                          const tbody = tbodyRef.current;
                          if (!tbody) return;
                          const rows = Array.from(tbody.querySelectorAll('tr:not(.add-task-row)'));
                          if (r >= rows.length) r = 0;
                          const row = rows[r];
                          if (!row) return;
                          const editableCols = columns.filter(col => col === 'name' || col === 'description' || col === 'status' || col === 'deadline' || col === 'project');
                          const colName = editableCols[c];
                            let dataField = colName;
                          const cell = Array.from(row.children).find(td => td.getAttribute('data-field') === dataField);
                          if (cell) {
                            (cell as HTMLElement).focus();
                          }
                        }}
                      />
                    ))}
                  </tr>
                ))}
                <tr className="add-task-row">
                  <td colSpan={columns.length}>
                    <button
                      className="btn small"
                      onClick={async () => {
                        await createTask.mutateAsync({
                          title: 'New Task',
                          projectIds: activeTab !== 'All Tasks'
                            ? projectOptions
                                .filter(p => p.value === activeTab)
                                .map(p => p.id)
                            : undefined
                        });
                      }}
                    >
                      + Add task
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
        {addTabAnchor && (
          <AddTabDropdown
            anchorEl={addTabAnchor}
            projectOptions={projectOptions}
            tabs={tabs}
            setTabs={setTabs}
            setActiveTab={setActiveTab}
            createProject={(data) => createProject.mutateAsync(data).then(() => undefined)}
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
            statusOptions={statusOptions}
            projectOptions={projectOptions}
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
            onClose={() => setSortAnchor(null)}
          />
        )}
        {optionMenu?.task && (
          <OptionDropdown
            anchorEl={optionMenu.anchor}
            type={optionMenu.type}
            task={optionMenu.task}
            options={optionMenu.type === 'status' ? statusOptions : projectOptions}
            onClose={() => setOptionMenu(null)}
            updateTask={(id, input) => updateTask.mutateAsync({ id, input }).then(() => undefined)}
            createOption={(data) =>
              (optionMenu.type === 'status' ? createStatus.mutateAsync(data) : createProject.mutateAsync(data)).then(() => undefined)
            }
            deleteOption={(id) =>
              (optionMenu.type === 'status' ? deleteStatus.mutateAsync(id) : deleteProject.mutateAsync(id)).then(() => undefined)
            }
            updateOption={(id, data) =>
              (optionMenu.type === 'status'
                ? updateStatus.mutateAsync({ id, data })
                : updateProject.mutateAsync({ id, data })).then(() => undefined)
            }
            onOptionDeleted={(opt) => {
              // remove any tab that matches the deleted project's value
              setTabs(t => t.filter(x => x !== opt.value));
              if (activeTab === opt.value) setActiveTab('All Tasks');
            }}
          />
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
            await deleteTask.mutateAsync(taskContextMenu.taskId);
            setTaskContextMenu(null);
          }}
          onClose={() => setTaskContextMenu(null)}
        />
      )}
    </div>
  );
};
