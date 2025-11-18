/**
 * ============================================
 * TASKPILOT APPLICATION
 * Material Design Task Management System
 * ============================================
 * 
 * @description Full-featured task manager with inline editing, multi-select fields,
 *              drag-and-drop reordering, and advanced filtering/sorting
 * @version 1.0.0
 * @author Organize-Me Team
 * 
 * Features:
 * - Multi-select status and project fields (array-based)
 * - Drag-and-drop column reordering with visual feedback
 * - Multi-criteria filtering (status, project, done state)
 * - Multi-field sorting with priority ordering
 * - Inline contenteditable text fields
 * - Project-based tab navigation
 * - localStorage persistence
 * - Material Design UI with ripple effects
 * 
 * Architecture:
 * - IIFE pattern for namespace encapsulation
 * - Event delegation for performance
 * - Modular function design for maintainability
 * - Ready for migration to full-stack webapp
 */

(function() {
  'use strict';

  // ============================================
  // CONSTANTS & CONFIGURATION
  // ============================================
  
  /** LocalStorage keys for data persistence */
  const STORAGE_KEY = 'organize_me_tasks_v1';
  const STATUS_OPT_KEY = 'organize_me_status_options_v1';
  const PROJECT_OPT_KEY = 'organize_me_project_options_v1';
  const COLUMNS_KEY = 'organize_me_col_order_v1';
  const TABS_KEY = 'organize_me_tabs_v1';
  const ACTIVE_TAB_KEY = 'organize_me_active_tab_v1';
  const FILTERS_KEY = 'organize_me_filters_v1';
  const SORTS_KEY = 'organize_me_sorts_v1';
  
  /** Default column configuration */
  const DEFAULT_COLUMNS = ['done','name','description','status','deadline','project'];
  
  /** Color palette for status and project options */
  const PALETTE = [
    { name: 'Blue', color: '#2f81f7' },
    { name: 'Green', color: '#3fb950' },
    { name: 'Purple', color: '#a371f7' },
    { name: 'Orange', color: '#d29922' },
  ];
  
  /**
   * @typedef {Object} Task
   * @property {string} id - Unique identifier
   * @property {string} name - Task title
   * @property {boolean} done - Completion status
   * @property {string} [description] - Task description
   * @property {string} [deadline] - Due date (YYYY-MM-DD format)
   * @property {Array<string>} status - Status values (multi-select)
   * @property {Array<string>} project - Project values (multi-select)
   */
  
  /** @type {Array<Task>} */
  let tasks = [];

  // ============================================
  // DOM REFERENCES & UTILITIES
  // ============================================
  
  /** Shorthand DOM selectors */
  /** Shorthand DOM selectors */
  const $ = sel => document.querySelector(sel);
  const $$ = sel => Array.from(document.querySelectorAll(sel));

  /** Cached DOM element references */
  const addRowBtn = $('#addRowBtn');
  const filterBtn = $('#filterBtn');
  const sortBtn = $('#sortBtn');
  const tbody = $('#taskTbody');
  const search = $('#search');
  const filterChipsContainer = $('#filterChipsContainer');
  const sortChipsContainer = $('#sortChipsContainer');
  const criteriaRow = $('#criteriaRow');
  
  // ============================================
  // APPLICATION STATE
  // ============================================
  
  /** Status options (customizable by user) */
  let statusOptions = [];
  
  /** Project options (customizable by user) */
  let projectOptions = [];
  
  /** Flag for dropdown event listeners initialization */
  let dropdownListenersReady = false;
  
  /** Current column display order (drag-to-reorder) */
  let columnOrder = [];
  
  /** Available project tabs */
  let tabs = ['All Tasks'];
  
  /** Currently active tab */
  let activeTab = 'All Tasks';
  
  /** Active filter configuration */
  let activeFilters = { status: [], project: [], done: null };
  
  /** Active sort configuration (multi-field with priority) */
  let activeSorts = [];

  // ============================================
  // UTILITY FUNCTIONS
  // ============================================
  
  /**
   * Generate unique ID for new tasks
   * @returns {string} Timestamp-based unique identifier
   */
  const uid = () => Date.now().toString(36) + Math.random().toString(36).substr(2);
  
  /**
   * Format ISO date string for human-readable display
   * @param {string} dateStr - Date in YYYY-MM-DD format
   * @returns {string} Formatted date (e.g., "Today", "Tomorrow", "Mar 15, 2024")
   */
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffDays = Math.floor((d - today) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';
    if (diffDays > 0 && diffDays <= 7) return `In ${diffDays} days`;
    if (diffDays < 0 && diffDays >= -7) return `${Math.abs(diffDays)} days ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };
  
  /**
   * Generate HTML for colored badge element
   * @param {string} text - Badge label
   * @param {string} color - Hex color code
   * @returns {string} HTML string for badge
   */
  const badgeHtml = (text, color) => {
    const c = color || '#2f81f7';
    return `<span class="badge" style="background:${c}20;border-color:${c}50;color:${c}">${text}</span>`;
  };
  
  /**
   * Find option by name (case-insensitive)
   * @param {Array} options - Array of option objects {name, color}
   * @param {string} name - Option name to search for
   * @returns {Object|null} Found option or null
   */
  const findOption = (options, name) => {
    if (!name) return null;
    return options.find(o => o.name.toLowerCase() === name.toLowerCase()) || null;
  };

  // ============================================
  // LOCALSTORAGE OPERATIONS
  // ============================================
  
  /**
   * Load tasks from localStorage with data migration
   * Converts old single-value status/project fields to arrays
   */
  /**
   * Load tasks from localStorage with data migration
   * Converts old single-value status/project fields to arrays
   */
  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      tasks = raw ? JSON.parse(raw) : [];
      // Migrate old single-value status/project to arrays
      tasks = tasks.map(t => ({
        ...t,
        status: Array.isArray(t.status) ? t.status : (t.status ? [t.status] : []),
        project: Array.isArray(t.project) ? t.project : (t.project ? [t.project] : [])
      }));
    } catch (e) {
      console.error('Failed to load tasks:', e);
      tasks = [];
    }
  }
  
  /**
   * Save tasks to localStorage
   */
  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }
  
  /**
   * Load status and project options from localStorage
   */
  function loadOptions() {
    try {
      statusOptions = JSON.parse(localStorage.getItem(STATUS_OPT_KEY) || '[]');
      projectOptions = JSON.parse(localStorage.getItem(PROJECT_OPT_KEY) || '[]');
    } catch { 
      statusOptions = []; 
      projectOptions = []; 
    }
  }
  
  /**
   * Save status and project options to localStorage
   */
  function saveOptions() {
    localStorage.setItem(STATUS_OPT_KEY, JSON.stringify(statusOptions));
    localStorage.setItem(PROJECT_OPT_KEY, JSON.stringify(projectOptions));
  }
  
  /**
   * Load column order configuration from localStorage
   * Preserves user's custom column arrangement
   */
  /**
   * Load column order configuration from localStorage
   * Preserves user's custom column arrangement
   */
  function loadColumns() {
    try {
      const saved = JSON.parse(localStorage.getItem(COLUMNS_KEY) || '[]');
      if (saved.length > 0) {
        // Use the saved order, and add any missing columns from DEFAULT_COLUMNS at the end
        const savedSet = new Set(saved);
        const missingColumns = DEFAULT_COLUMNS.filter(c => !savedSet.has(c));
        columnOrder = [...saved, ...missingColumns];
      } else {
        columnOrder = [...DEFAULT_COLUMNS];
      }
    } catch {
      columnOrder = [...DEFAULT_COLUMNS];
    }
  }
  
  /**
   * Save column order to localStorage
   */
  function saveColumns() {
    localStorage.setItem(COLUMNS_KEY, JSON.stringify(columnOrder));
  }
  
  /**
   * Load tabs configuration from localStorage
   * Handles migration from old "Alle Tickets" to "All Tasks"
   */
  function loadTabs() {
    try {
      const savedTabs = JSON.parse(localStorage.getItem(TABS_KEY) || '["All Tasks"]');
      tabs = savedTabs.length ? savedTabs : ['All Tasks'];
      // Migrate old "Alle Tickets" to "All Tasks"
      const alleTicketsIdx = tabs.indexOf('Alle Tickets');
      if (alleTicketsIdx !== -1) {
        tabs[alleTicketsIdx] = 'All Tasks';
      }
      activeTab = localStorage.getItem(ACTIVE_TAB_KEY) || 'All Tasks';
      // Migrate active tab
      if (activeTab === 'Alle Tickets') {
        activeTab = 'All Tasks';
      }
      if (!tabs.includes(activeTab)) activeTab = tabs[0];
      // Ensure All Tasks is always first
      if (!tabs.includes('All Tasks')) {
        tabs.unshift('All Tasks');
      }
    } catch {
      tabs = ['All Tasks'];
      activeTab = 'All Tasks';
    }
  }
  function saveTabs() {
    localStorage.setItem(TABS_KEY, JSON.stringify(tabs));
    localStorage.setItem(ACTIVE_TAB_KEY, activeTab);
  }
  function loadFilters() {
    try {
      const saved = JSON.parse(localStorage.getItem(FILTERS_KEY) || '{}');
      if (saved && typeof saved === 'object') {
        activeFilters = { status: saved.status || [], project: saved.project || [], done: saved.done ?? null };
      }
    } catch {}
  }
  function saveFilters() {
    localStorage.setItem(FILTERS_KEY, JSON.stringify(activeFilters));
  }
  function loadSorts() {
    try {
      activeSorts = JSON.parse(localStorage.getItem(SORTS_KEY) || '[]');
    } catch { activeSorts = []; }
  }
  function saveSorts() {
    localStorage.setItem(SORTS_KEY, JSON.stringify(activeSorts));
  }
  
  function hexToRgb(hex) {
    const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!m) return { r: 47, g: 129, b: 247 };
    return { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) };
  }

  // ============================================
  // OPTION MANAGEMENT (Status & Project)
  // ============================================
  
  /**
   * Rename a status or project option
   * Updates the option and all tasks that reference it
   * @param {string} type - 'status' or 'project'
   * @param {string} oldName - Current option name
   * @param {string} newName - New option name
   * @param {string} newColor - New color (hex code)
   * @returns {boolean} True if successful, false if name already exists
   */
  function renameOption(type, oldName, newName, newColor) {
    const optsRef = type === 'status' ? statusOptions : projectOptions;
    const opt = findOption(optsRef, oldName);
    if (!opt) return false;
    // Ensure no duplicate names (case-insensitive)
    const exists = findOption(optsRef, newName);
    if (exists && exists !== opt) return false;
    opt.name = newName;
    if (newColor) opt.color = newColor;
    saveOptions();
    // Update tasks referencing the old name (now handling arrays)
    for (const t of tasks) {
      if (Array.isArray(t[type])) {
        t[type] = t[type].map(item => 
          item.toLowerCase() === oldName.toLowerCase() ? newName : item
        );
      }
    }
    save();
    return true;
  }

  /**
   * Delete an option and remove it from all tasks
   * @param {string} type - 'status' or 'project'
   * @param {string} name - Option name to delete
   * @returns {boolean} True if successful
   */
  function deleteOptionValue(type, name) {
    const optsRef = type === 'status' ? statusOptions : projectOptions;
    const idx = optsRef.findIndex(o => (o.name || '').toLowerCase() === (name || '').toLowerCase());
    if (idx < 0) return false;
    optsRef.splice(idx, 1);
    saveOptions();
    // Clear the value from tasks (now handling arrays)
    for (const t of tasks) {
      if (Array.isArray(t[type])) {
        t[type] = t[type].filter(item => item.toLowerCase() !== (name || '').toLowerCase());
      }
    }
    save();
    return true;
  }

  // ============================================
  // TABLE CELL BUILDERS
  // Factory functions that create table cells based on column type
  // ============================================

  /**
   * Factory function to build table cell based on column type
   * Creates different cell types: checkbox, editable text, badges, date picker
   * @param {string} col - Column name ('done', 'name', 'description', 'status', 'project', 'deadline')
   * @param {Task} t - Task object
   * @returns {HTMLTableCellElement} Table cell element
   */
  function buildCell(col, t) {
    // Done column: checkbox for completion status
    if (col === 'done') {
      const td = document.createElement('td');
      td.classList.add('col-done');
      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.checked = !!t.done;
      cb.className = 'toggle-done';
      td.appendChild(cb);
      return td;
    }
    // Name column: contenteditable text field
    if (col === 'name') {
      const td = document.createElement('td');
      td.textContent = t.name || '';
      td.contentEditable = 'true';
      td.dataset.field = 'name';
      return td;
    }
    // Description column: contenteditable text field
    if (col === 'description') {
      const td = document.createElement('td');
      td.textContent = t.description || '';
      td.contentEditable = 'true';
      td.dataset.field = 'description';
      return td;
    }
    // Status column: multi-badge display with color-coded badges
    if (col === 'status') {
      const td = document.createElement('td');
      td.dataset.field = 'status';
      if (t.status && t.status.length > 0) {
        td.innerHTML = t.status.map(s => {
          const so = findOption(statusOptions, s);
          return badgeHtml(s, so?.color);
        }).join(' ');
      } else {
        td.innerHTML = '<span class="muted">Select…</span>';
      }
      return td;
    }
    // Deadline column: date picker with formatted display
    if (col === 'deadline') {
      const td = document.createElement('td');
      td.className = 'deadline-cell';
      td.textContent = t.deadline ? formatDate(t.deadline) : '';
      // Hidden date input that opens native picker
      const input = document.createElement('input');
      input.type = 'date';
      input.value = t.deadline || '';
      input.className = 'deadline-picker-hidden';
      td.appendChild(input);
      td.addEventListener('click', () => {
        input.showPicker?.();
      });
      input.addEventListener('change', () => {
        const idx = tasks.findIndex(task => task.id === t.id);
        if (idx >= 0) {
          tasks[idx].deadline = input.value;
          save();
          render();
        }
      });
      return td;
    }
    // Project column: multi-badge display (same pattern as status)
    if (col === 'project') {
      const td = document.createElement('td');
      td.dataset.field = 'project';
      if (t.project && t.project.length > 0) {
        td.innerHTML = t.project.map(p => {
          const po = findOption(projectOptions, p);
          return badgeHtml(p, po?.color);
        }).join(' ');
      } else {
        td.innerHTML = '<span class="muted">Select…</span>';
      }
      return td;
    }
    // Fallback for unknown column types
    const fallback = document.createElement('td');
    return fallback;
  }

  /**
   * Build a complete table row for a task
   * Iterates through columnOrder and creates cells using buildCell()
   * @param {Task} t - Task object
   * @returns {HTMLTableRowElement} Complete table row with all cells
   */
  function taskRow(t) {
    const tr = document.createElement('tr');
    tr.dataset.id = t.id;
    if (t.done) tr.style.opacity = 0.65;
    for (const col of columnOrder) {
      tr.appendChild(buildCell(col, t));
    }
    return tr;
  }

  // ============================================
  // RENDERING FUNCTIONS
  // Functions that update the DOM with current state
  // ============================================

  /**
   * Render table header with column labels and sort indicators
   * Creates draggable column headers that show active sort state
   * @returns {void}
   */
  function renderHeader() {
    const thead = document.querySelector('.tasks-table thead');
    if (!thead) return;
    const tr = document.createElement('tr');
    const labelMap = { done: 'Done', name: 'Name', description: 'Description', status: 'Status', deadline: 'Deadline', project: 'Project', actions: 'Actions' };
    columnOrder.forEach(col => {
      const th = document.createElement('th');
      if (col === 'done') th.classList.add('col-done');
      if (col === 'actions') th.classList.add('col-actions');
      th.draggable = true;
      th.dataset.col = col;
      const label = labelMap[col] || col;
      const sIdx = activeSorts.findIndex(s => s.field === col);
      if (sIdx >= 0) {
        const arrow = activeSorts[sIdx].asc ? '↑' : '↓';
        th.innerHTML = `${label}<span class="sort-ind">${arrow}<span class="idx">${sIdx+1}</span></span>`;
      } else {
        th.textContent = label;
      }
      tr.appendChild(th);
    });
    thead.innerHTML = '';
    thead.appendChild(tr);
  }

  // State for drag-and-drop column reordering
  let dragCol = null;

  /**
   * Setup drag-and-drop handlers for column reordering
   * Called once at initialization to enable column reordering by dragging headers
   * Also handles click-to-sort functionality (with Shift for multi-sort)
   * @returns {void}
   */
  function setupHeaderDragDrop() {
    const thead = document.querySelector('.tasks-table thead');
    if (!thead) return;
    
    // Dragstart: Store which column is being dragged
    thead.addEventListener('dragstart', (e) => {
      const th = e.target.closest('th');
      if (!th) return;
      dragCol = th.dataset.col;
      th.classList.add('th-dragging');
      e.dataTransfer.effectAllowed = 'move';
      try { e.dataTransfer.setData('text/plain', dragCol); } catch {}
    });
    // Dragend: Clean up drag styling
    thead.addEventListener('dragend', (e) => {
      const th = e.target.closest('th');
      if (th) th.classList.remove('th-dragging');
      thead.querySelectorAll('.th-drop-target').forEach(el => el.classList.remove('th-drop-target'));
      dragCol = null;
    });
    // Dragover: Show drop target highlighting
    thead.addEventListener('dragover', (e) => {
      e.preventDefault();
      const th = e.target.closest('th');
      if (!th) return;
      thead.querySelectorAll('.th-drop-target').forEach(el => el.classList.remove('th-drop-target'));
      if (th.dataset.col !== dragCol) {
        th.classList.add('th-drop-target');
      }
      e.dataTransfer.dropEffect = 'move';
    });
    thead.addEventListener('dragleave', (e) => {
      const th = e.target.closest('th');
      if (th) th.classList.remove('th-drop-target');
    });
    // Drop: Swap column positions in columnOrder array
    thead.addEventListener('drop', (e) => {
      e.preventDefault();
      const th = e.target.closest('th');
      if (!th) return;
      const toCol = th.dataset.col;
      if (!dragCol || dragCol === toCol) return;
      const fromIdx = columnOrder.indexOf(dragCol);
      const toIdx = columnOrder.indexOf(toCol);
      if (fromIdx < 0 || toIdx < 0) return;
      // Swap the two columns
      [columnOrder[fromIdx], columnOrder[toIdx]] = [columnOrder[toIdx], columnOrder[fromIdx]];
      saveColumns();
      render();
    });

    // Click to sort: Single-click toggles sort, Shift+click adds multi-sort
    thead.addEventListener('click', (e) => {
      const th = e.target.closest('th');
      if (!th) return;
      const field = th.dataset.col;
      if (!field || field === 'actions') return;
      const existingIdx = activeSorts.findIndex(s => s.field === field);
      const shift = e.shiftKey;
      if (!shift) {
        if (existingIdx === -1) {
          activeSorts = [{ field, asc: true }];
        } else if (activeSorts[existingIdx].asc) {
          activeSorts = [{ field, asc: false }];
        } else {
          activeSorts = [];
        }
      } else {
        if (existingIdx === -1) {
          activeSorts.push({ field, asc: true });
        } else {
          activeSorts[existingIdx].asc = !activeSorts[existingIdx].asc;
        }
      }
      saveSorts();
      render();
    });
  }

  // ============================================
  // FILTERING & SORTING
  // Functions that filter and sort tasks based on active criteria
  // ============================================

  /**
   * Filter tasks based on active tab, filters, and search query
   * Applies filters in sequence: tab → status → project → done → search
   * @param {string} q - Search query string (optional)
   * @returns {Task[]} Filtered array of tasks
   */
  function filterTasks(q) {
    let list = tasks;
    // Filter by active tab (project)
    if (activeTab !== 'All Tasks') {
      list = list.filter(t => {
        const taskProjects = Array.isArray(t.project) ? t.project : [];
        return taskProjects.some(p => p.toLowerCase() === activeTab.toLowerCase());
      });
    }
    // Apply active filters
    if (activeFilters.status.length) {
      list = list.filter(t => {
        const taskStatuses = Array.isArray(t.status) ? t.status : [];
        return activeFilters.status.some(s => taskStatuses.some(ts => ts.toLowerCase() === s.toLowerCase()));
      });
    }
    if (activeFilters.project.length) {
      list = list.filter(t => {
        const taskProjects = Array.isArray(t.project) ? t.project : [];
        return activeFilters.project.some(p => taskProjects.some(tp => tp.toLowerCase() === p.toLowerCase()));
      });
    }
    if (activeFilters.done !== null) {
      list = list.filter(t => !!t.done === activeFilters.done);
    }
    // Filter by search query
    const s = (q || '').trim().toLowerCase();
    if (!s) return list;
    return list.filter(t => {
      // Convert arrays to strings for searching
      const statusStr = Array.isArray(t.status) ? t.status.join(' ') : (t.status || '');
      const projectStr = Array.isArray(t.project) ? t.project.join(' ') : (t.project || '');
      return [t.name, t.description, statusStr, projectStr]
        .map(v => (v || '').toLowerCase())
        .some(v => v.includes(s));
    });
  }

  /**
   * Render project tabs in the tabs container
   * Creates tab buttons for "All Tasks" and each project
   * Includes right-click menu for tab deletion and + button to add tabs
   * @returns {void}
   */
  function renderTabs() {
    const container = document.querySelector('.tabs-container');
    if (!container) return;
    container.innerHTML = '';
    tabs.forEach(tab => {
      const btn = document.createElement('button');
      btn.className = 'tab' + (tab === activeTab ? ' active' : '');
      btn.textContent = tab;
      btn.addEventListener('click', () => {
        activeTab = tab;
        saveTabs();
        render();
      });
      // Right-click to delete tab (except "All Tasks")
      btn.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        if (tab === 'All Tasks') {
          return; // Can't delete "All Tasks"
        }
        openTabMenu(e.pageX, e.pageY, tab);
      });
      container.appendChild(btn);
    });
    const addBtn = document.createElement('button');
    addBtn.className = 'tab add-tab';
    addBtn.textContent = '+';
    addBtn.title = 'Add project tab';
    addBtn.addEventListener('click', () => {
      openAddTabMenu(addBtn);
    });
    container.appendChild(addBtn);
  }

  // ============================================
  // DROPDOWN MENUS
  // Functions that create and manage dropdown menus for various actions
  // ============================================

  /**
   * Open menu to add a new project tab
   * Shows list of available projects and option to create new project
   * @param {HTMLElement} btn - Button to anchor menu to
   * @returns {void}
   */
  function openAddTabMenu(btn) {
    const existing = document.querySelector('.dd-menu');
    if (existing) existing.remove();
    const rect = btn.getBoundingClientRect();
    const menu = document.createElement('div');
    menu.className = 'dd-menu';
    menu.style.top = `${rect.bottom + 6}px`;
    menu.style.left = `${rect.left}px`;
    const availableProjects = projectOptions.filter(p => !tabs.includes(p.name));
    const listHtml = availableProjects.map(p => `
      <li class="dd-item" data-name="${p.name}">
        <span class="dot" style="background:${p.color}"></span>
        <span>${p.name}</span>
      </li>
    `).join('');
    menu.innerHTML = `
      <div class="dd-sec">
        <p class="dd-title">Add project tab</p>
        <ul class="dd-list">${listHtml || '<li class="dd-item" style="cursor:default;">No projects available</li>'}</ul>
      </div>
      <div class="dd-sec dd-add">
        <p class="dd-title">Add new project</p>
        <div class="dd-input-row">
          <input type="text" class="dd-input name" placeholder="Project name" />
        </div>
        <div class="swatches">
          ${PALETTE.map((p,i)=>`<div class="swatch" data-color="${p.color}" title="${p.name}" style="background:${p.color}"></div>`).join('')}
        </div>
        <button class="btn small add-btn">Add</button>
      </div>
    `;
    document.body.appendChild(menu);
    ensureDropdownListeners();
    
    // Color picker: Track selected color for new project
    let selectedColor = PALETTE[0].color;
    menu.querySelectorAll('.swatch').forEach((el, idx) => {
      if (idx === 0) el.classList.add('selected');
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        menu.querySelectorAll('.swatch').forEach(s => s.classList.remove('selected'));
        el.classList.add('selected');
        selectedColor = el.dataset.color;
      });
    });
    
    const ul = menu.querySelector('.dd-list');
    if (ul) {
      ul.addEventListener('click', (e) => {
        const li = e.target.closest('.dd-item');
        if (!li || !li.dataset.name) return;
        const projectName = li.dataset.name;
        if (!tabs.includes(projectName)) {
          tabs.push(projectName);
          saveTabs();
          activeTab = projectName;
          render();
        }
        if (menu.isConnected) menu.remove();
      });
    }
    
    menu.querySelector('.add-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      const name = menu.querySelector('.dd-input.name').value.trim();
      if (!name) return;
      if (projectOptions.find(o => o.name.toLowerCase() === name.toLowerCase())) {
        alert('Project already exists.');
        return;
      }
      projectOptions.push({ name, color: selectedColor });
      saveOptions();
      // Add as tab and switch to it
      if (!tabs.includes(name)) {
        tabs.push(name);
        saveTabs();
        activeTab = name;
        render();
      }
      if (menu.isConnected) menu.remove();
    });
  }

  /**
   * Main rendering function - filters, sorts, and displays tasks
   * This is the central function that updates the entire UI
   * Steps: filter tasks → apply sorts → clear tbody → create rows → add "Add task" button
   * @returns {void}
   */
  function render() {
    const q = search.value;
    const list = filterTasks(q);
    tbody.innerHTML = '';
    renderTabs();
    renderHeader();
    renderChips();
    // Apply sorting: default (done last, deadline ascending) or custom multi-field
    if (activeSorts.length === 0) {
      // Default: not done first, then upcoming deadlines
      list.sort((a,b) => {
        if (a.done !== b.done) return a.done ? 1 : -1;
        const ad = a.deadline || ''; const bd = b.deadline || '';
        return ad.localeCompare(bd);
      });
    } else {
      list.sort((a, b) => {
        for (const sort of activeSorts) {
          let aVal, bVal;
          // Handle array fields (status, project)
          if (Array.isArray(a[sort.field])) {
            aVal = a[sort.field].join(', ').toLowerCase();
          } else {
            aVal = (a[sort.field] || '').toString().toLowerCase();
          }
          if (Array.isArray(b[sort.field])) {
            bVal = b[sort.field].join(', ').toLowerCase();
          } else {
            bVal = (b[sort.field] || '').toString().toLowerCase();
          }
          const cmp = aVal.localeCompare(bVal);
          if (cmp !== 0) return sort.asc ? cmp : -cmp;
        }
        return 0;
      });
    }
    for (const t of list) tbody.appendChild(taskRow(t));
    
    // Add "Add new task" row at the bottom
    const addRow = document.createElement('tr');
    addRow.className = 'add-task-row';
    const addCell = document.createElement('td');
    addCell.colSpan = columnOrder.length;
    const addButton = document.createElement('button');
    addButton.className = 'btn small';
    addButton.textContent = '+ Add task';
    addButton.addEventListener('click', () => {
      const t = { id: uid(), name: '', description: '', status: [], deadline: '', project: [], done: false };
      tasks.push(t);
      save();
      render();
      focusCell(t.id, 'name');
    });
    addCell.appendChild(addButton);
    addRow.appendChild(addCell);
    tbody.appendChild(addRow);
  }

  /**
   * Render active filter and sort chips
   * Creates removable chips that show current filtering and sorting criteria
   * @returns {void}
   */
  function renderChips() {
      if (!filterChipsContainer || !sortChipsContainer || !criteriaRow) return;
      filterChipsContainer.innerHTML = '';
      sortChipsContainer.innerHTML = '';
      const filterChips = [];
      const sortChips = [];
      
      // Status filters
      for (const s of activeFilters.status) {
        const opt = findOption(statusOptions, s);
        const chip = document.createElement('span');
        chip.className = 'chip';
        chip.dataset.type = 'status';
        chip.dataset.value = s;
        chip.innerHTML = `<span class="prop">Status</span><span class="sep">:</span><span class="dot" style="background:${opt?.color || '#263241'}"></span><span>${s}</span><button class="remove" title="Remove">×</button>`;
        filterChips.push(chip);
      }
      
      // Project filters
      for (const p of activeFilters.project) {
        const opt = findOption(projectOptions, p);
        const chip = document.createElement('span');
        chip.className = 'chip';
        chip.dataset.type = 'project';
        chip.dataset.value = p;
        chip.innerHTML = `<span class="prop">Project</span><span class="sep">:</span><span class="dot" style="background:${opt?.color || '#263241'}"></span><span>${p}</span><button class="remove" title="Remove">×</button>`;
        filterChips.push(chip);
      }
      
      // Done filter
      if (activeFilters.done !== null) {
        const chip = document.createElement('span');
        chip.className = 'chip';
        chip.dataset.type = 'done';
        chip.dataset.value = String(activeFilters.done);
        chip.innerHTML = `<span class="prop">Done</span><span class="sep">:</span><span>${activeFilters.done ? 'Yes' : 'No'}</span><button class="remove" title="Remove">×</button>`;
        filterChips.push(chip);
      }
      
      // Sort chips
      activeSorts.forEach((s, i) => {
        const chip = document.createElement('span');
        chip.className = 'chip sort';
        chip.dataset.type = 'sort';
        chip.dataset.value = s.field;
        const arrow = s.asc ? '↑' : '↓';
        const label = s.field.charAt(0).toUpperCase() + s.field.slice(1);
        chip.innerHTML = `<span class="prop">Sort ${i+1}</span><span class="sep">:</span><span>${label} ${arrow}</span><button class="remove" title="Remove">×</button>`;
        sortChips.push(chip);
      });
      
      // Add filter chips
      filterChips.forEach(c => filterChipsContainer.appendChild(c));
      if (filterChips.length > 0) {
        // Show + button to add more filters
        const addBtn = document.createElement('button');
        addBtn.className = 'add-chip-btn';
        addBtn.textContent = '+ Add filter';
        addBtn.title = 'Add filter';
        addBtn.onclick = () => openFilterMenu(filterBtn);
        filterChipsContainer.appendChild(addBtn);
        
        const clearBtn = document.createElement('button');
        clearBtn.className = 'clear-all-btn';
        clearBtn.textContent = 'Clear filters';
        clearBtn.title = 'Clear all filters';
        clearBtn.onclick = () => {
          activeFilters = { status: [], project: [], done: null };
          saveFilters();
          render();
        };
        filterChipsContainer.appendChild(clearBtn);
      } else {
        // Show + button when no filters
        const addBtn = document.createElement('button');
        addBtn.className = 'add-chip-btn';
        addBtn.textContent = '+ Add filter';
        addBtn.title = 'Add filter';
        addBtn.onclick = () => openFilterMenu(filterBtn);
        filterChipsContainer.appendChild(addBtn);
      }
      
      // Add sort chips
      sortChips.forEach(c => sortChipsContainer.appendChild(c));
      if (sortChips.length > 0) {
        // Show + button to add more sorts
        const addBtn = document.createElement('button');
        addBtn.className = 'add-chip-btn';
        addBtn.textContent = '+ Add sort';
        addBtn.title = 'Add sort';
        addBtn.onclick = () => openSortMenu(sortBtn);
        sortChipsContainer.appendChild(addBtn);
        
        const clearBtn = document.createElement('button');
        clearBtn.className = 'clear-all-btn';
        clearBtn.textContent = 'Clear sorts';
        clearBtn.title = 'Clear all sorts';
        clearBtn.onclick = () => {
          activeSorts = [];
          saveSorts();
          render();
        };
        sortChipsContainer.appendChild(clearBtn);
      } else {
        // Show + button when no sorts
        const addBtn = document.createElement('button');
        addBtn.className = 'add-chip-btn';
        addBtn.textContent = '+ Add sort';
        addBtn.title = 'Add sort';
        addBtn.onclick = () => openSortMenu(sortBtn);
        sortChipsContainer.appendChild(addBtn);
      }
      
      // Update button active states
      const hasFilters = filterChips.length > 0;
      const hasSorts = sortChips.length > 0;
      if (filterBtn) filterBtn.classList.toggle('active', hasFilters);
      if (sortBtn) sortBtn.classList.toggle('active', hasSorts);
      
      // Handle chip clicks and removals for filters
      filterChipsContainer.onclick = (e) => {
        const btn = e.target.closest('.remove');
        const chip = e.target.closest('.chip');
        if (!btn && !chip) return;
        
        const type = chip.dataset.type;
        const val = chip.dataset.value;
        
        if (btn) {
          if (type === 'status' || type === 'project') {
            const list = activeFilters[type];
            const i = list.findIndex(v => v.toLowerCase() === (val || '').toLowerCase());
            if (i >= 0) list.splice(i, 1);
            saveFilters();
          } else if (type === 'done') {
            activeFilters.done = null;
            saveFilters();
          }
          render();
          return;
        }
        
        openFilterMenu(filterBtn);
      };
      
      // Handle chip clicks and removals for sorts
      sortChipsContainer.onclick = (e) => {
        const btn = e.target.closest('.remove');
        const chip = e.target.closest('.chip');
        if (!btn && !chip) return;
        
        const val = chip.dataset.value;
        
        if (btn) {
          const i = activeSorts.findIndex(s => s.field === val);
          if (i >= 0) activeSorts.splice(i, 1);
          saveSorts();
          render();
          return;
        }
        
        openSortMenu(sortBtn);
      };
    }

  // ============================================
  // EVENT HANDLERS
  // Event listeners for user interactions
  // ============================================

  // Event: add new inline row
  addRowBtn.addEventListener('click', () => {
    const t = { id: uid(), name: '', description: '', status: [], deadline: '', project: [], done: false };
    tasks.push(t);
    save();
    render();
    focusCell(t.id, 'name');
  });

  // Event: Filter button - toggle filter chips visibility
  filterBtn.addEventListener('click', () => {
    if (!filterChipsContainer) return;
    const isVisible = filterChipsContainer.style.display !== 'none';
    filterChipsContainer.style.display = isVisible ? 'none' : '';
  });

  // Event: Sort button - toggle sort chips visibility
  sortBtn.addEventListener('click', () => {
    if (!sortChipsContainer) return;
    const isVisible = sortChipsContainer.style.display !== 'none';
    sortChipsContainer.style.display = isVisible ? 'none' : '';
  });

  /**
   * Open filter menu to configure active filters
   * Shows checkboxes for status/project and radio buttons for done state
   * @param {HTMLElement} btn - Button to anchor menu to
   * @returns {void}
   */
  function openFilterMenu(btn) {
    const existing = document.querySelector('.dd-menu');
    if (existing) existing.remove();
    // Position below the filter chips container if visible, otherwise below button
    const targetEl = filterChipsContainer && filterChipsContainer.style.display !== 'none' ? filterChipsContainer : btn;
    const rect = targetEl.getBoundingClientRect();
    const menu = document.createElement('div');
    menu.className = 'dd-menu filter-menu';
    menu.style.top = `${rect.bottom + 6}px`;
    menu.style.left = `${rect.left}px`;
    
    const statusHtml = statusOptions.map(s => `
      <label class="filter-option">
        <input type="checkbox" value="${s.name}" data-field="status" ${activeFilters.status.includes(s.name)?'checked':''}>
        <span class="dot" style="background:${s.color}"></span>
        <span>${s.name}</span>
      </label>
    `).join('');
    
    const projectHtml = projectOptions.map(p => `
      <label class="filter-option">
        <input type="checkbox" value="${p.name}" data-field="project" ${activeFilters.project.includes(p.name)?'checked':''}>
        <span class="dot" style="background:${p.color}"></span>
        <span>${p.name}</span>
      </label>
    `).join('');
    
    menu.innerHTML = `
      <div class="dd-sec">
        <p class="dd-title">Filter by Status</p>
        <div class="filter-list">${statusHtml || '<p class="muted">No status options</p>'}</div>
      </div>
      <div class="dd-sec">
        <p class="dd-title">Filter by Project</p>
        <div class="filter-list">${projectHtml || '<p class="muted">No project options</p>'}</div>
      </div>
      <div class="dd-sec">
        <p class="dd-title">Filter by Done</p>
        <div class="filter-list">
          <label class="filter-option">
            <input type="radio" name="done-filter" value="all" ${activeFilters.done===null?'checked':''}>
            <span>All</span>
          </label>
          <label class="filter-option">
            <input type="radio" name="done-filter" value="done" ${activeFilters.done===true?'checked':''}>
            <span>Done</span>
          </label>
          <label class="filter-option">
            <input type="radio" name="done-filter" value="notdone" ${activeFilters.done===false?'checked':''}>
            <span>Not Done</span>
          </label>
        </div>
      </div>
      <div class="dd-sec">
        <div class="dd-actions">
          <button class="btn small clear-filter">Reset</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(menu);
    ensureDropdownListeners();
    // Live apply listeners
    menu.querySelectorAll('input[data-field="status"]').forEach(cb => {
      cb.addEventListener('change', () => {
        const val = cb.value;
        const i = activeFilters.status.findIndex(v => v.toLowerCase() === val.toLowerCase());
        if (cb.checked && i < 0) activeFilters.status.push(val);
        if (!cb.checked && i >= 0) activeFilters.status.splice(i,1);
        saveFilters();
        render();
      });
    });
    menu.querySelectorAll('input[data-field="project"]').forEach(cb => {
      cb.addEventListener('change', () => {
        const val = cb.value;
        const i = activeFilters.project.findIndex(v => v.toLowerCase() === val.toLowerCase());
        if (cb.checked && i < 0) activeFilters.project.push(val);
        if (!cb.checked && i >= 0) activeFilters.project.splice(i,1);
        saveFilters();
        render();
      });
    });
    menu.querySelectorAll('input[name="done-filter"]').forEach(rb => {
      rb.addEventListener('change', () => {
        const v = menu.querySelector('input[name="done-filter"]:checked').value;
        activeFilters.done = v === 'done' ? true : v === 'notdone' ? false : null;
        saveFilters();
        render();
      });
    });
    menu.querySelector('.clear-filter').addEventListener('click', (e) => {
      e.stopPropagation();
      activeFilters = { status: [], project: [], done: null };
      saveFilters();
      render();
    });
  }

  /**
   * Open sort menu to configure multi-field sorting
   * Shows checkboxes for fields and dropdowns for direction (asc/desc)
   * @param {HTMLElement} btn - Button to anchor menu to
   * @returns {void}
   */
  function openSortMenu(btn) {
    const existing = document.querySelector('.dd-menu');
    if (existing) existing.remove();
    // Position below the sort chips container if visible, otherwise below button
    const targetEl = sortChipsContainer && sortChipsContainer.style.display !== 'none' ? sortChipsContainer : btn;
    const rect = targetEl.getBoundingClientRect();
    const menu = document.createElement('div');
    menu.className = 'dd-menu sort-menu';
    menu.style.top = `${rect.bottom + 6}px`;
    menu.style.left = `${rect.left}px`;
    
    const fields = ['name', 'status', 'project', 'deadline', 'done'];
    const sortHtml = fields.map(field => {
      const existing = activeSorts.find(s => s.field === field);
      return `
        <label class="filter-option">
          <input type="checkbox" value="${field}" ${existing?'checked':''} data-sort-field>
          <span>${field.charAt(0).toUpperCase() + field.slice(1)}</span>
          <select class="sort-direction" data-field="${field}" ${!existing?'disabled':''}>
            <option value="asc" ${existing?.asc?'selected':''}>Ascending</option>
            <option value="desc" ${!existing?.asc?'selected':''}>Descending</option>
          </select>
        </label>
      `;
    }).join('');
    
    menu.innerHTML = `
      <div class="dd-sec">
        <p class="dd-title">Sort by (in order)</p>
        <div class="filter-list">${sortHtml}</div>
      </div>
      <div class="dd-sec">
        <div class="dd-actions"><button class="btn small clear-sort">Reset</button></div>
      </div>
    `;
    
    document.body.appendChild(menu);
    ensureDropdownListeners();
    
    // Live apply
    menu.querySelectorAll('input[data-sort-field]').forEach(cb => {
      cb.addEventListener('change', (e) => {
        e.stopPropagation();
        const field = cb.value;
        const select = menu.querySelector(`select[data-field="${field}"]`);
        if (select) select.disabled = !cb.checked;
        const idx = activeSorts.findIndex(s => s.field === field);
        if (cb.checked && idx < 0) {
          activeSorts.push({ field, asc: (select?.value||'asc') === 'asc' });
        } else if (!cb.checked && idx >= 0) {
          activeSorts.splice(idx, 1);
        }
        saveSorts();
        render();
      });
    });
    menu.querySelectorAll('.sort-direction').forEach(sel => {
      sel.addEventListener('change', (e) => {
        e.stopPropagation();
        const field = sel.dataset.field;
        const s = activeSorts.find(x => x.field === field);
        if (s) s.asc = sel.value === 'asc';
        saveSorts();
        render();
      });
    });
    menu.querySelector('.clear-sort').addEventListener('click', (e) => {
      e.stopPropagation();
      activeSorts = [];
      saveSorts();
      render();
    });
  }

  // Event: search/filter - real-time filtering as user types
  search.addEventListener('input', () => render());

  // Event delegation: Single tbody listener handles all row interactions (performance optimization)
  tbody.addEventListener('click', (e) => {
    const target = e.target;
    const tr = target.closest('tr');
    if (!tr) return;
    const id = tr.dataset.id;
    const idx = tasks.findIndex(t => t.id === id);
    if (idx < 0) return;

    if (target.matches('input.toggle-done')) {
      tasks[idx].done = target.checked;
      save();
      render();
      return;
    }

    // Open dropdown on status/project cell click or toggle filter on badge
    const td = target.closest('td');
    if (!td) return;
    const field = td.dataset.field;
    if (field === 'status' || field === 'project') {
      const currentCellId = `${id}-${field}`;
      
      // Check if this cell was just closed by the mousedown handler
      if (tbody._getLastClosedCell && tbody._getLastClosedCell() === currentCellId) {
        return; // Don't reopen immediately
      }
      
      // Check if dropdown is already open for this cell
      const existingMenu = document.querySelector('.dd-menu');
      if (existingMenu && existingMenu.dataset.cellId === currentCellId) {
        // Clicking the same cell - this shouldn't happen due to mousedown handler
        existingMenu.remove();
        return;
      }
      
      // Open dropdown for editing
      const currentArray = Array.isArray(tasks[idx][field]) ? tasks[idx][field] : [];
      openDropdown(td, field, currentArray, (newArray) => {
        tasks[idx][field] = newArray;
        save();
        render();
      }, currentCellId);
      return;
    }
  });

  // Right-click to open row context menu
  tbody.addEventListener('contextmenu', (e) => {
    const tr = e.target.closest('tr');
    if (!tr) return;
    e.preventDefault();
    const id = tr.dataset.id;
    const idx = tasks.findIndex(t => t.id === id);
    if (idx < 0) return;
    openRowMenu(e.pageX, e.pageY, idx);
  });

  /**
   * Commit inline edit to a task field
   * Helper function for contenteditable cells
   * @param {string} id - Task ID
   * @param {string} field - Field name to update
   * @param {string} value - New value
   * @returns {void}
   */
  function commitEdit(id, field, value) {
    const idx = tasks.findIndex(t => t.id === id);
    if (idx < 0) return;
    const updated = { ...tasks[idx] };
    if (field === 'deadline') {
      updated.deadline = value; // store raw string (expects YYYY-MM-DD if date)
    } else if (field in updated) {
      updated[field] = value;
    }
    tasks[idx] = updated;
    save();
    render();
  }

  /**
   * Focus and place cursor at end of a contenteditable cell
   * Used after creating new tasks to focus the name field
   * @param {string} id - Task ID
   * @param {string} field - Field name to focus
   * @returns {void}
   */
  function focusCell(id, field) {
    const tr = tbody.querySelector(`tr[data-id="${id}"]`);
    if (!tr) return;
    const td = tr.querySelector(`td[data-field="${field}"]`);
    if (td) {
      td.focus();
      // place caret at end
      const sel = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(td);
      range.collapse(false);
      sel.removeAllRanges();
      sel.addRange(range);
    }
  }

  /**
   * Setup global listeners for dropdown menu behavior (once)
   * Handles: close on outside click, close on Escape, prevent immediate reopen
   * @returns {void}
   */
  function ensureDropdownListeners() {
    if (dropdownListenersReady) return;
    let lastClosedCell = null;
    let closeTimeout = null;
    
    document.addEventListener('mousedown', (ev) => {
      const menu = document.querySelector('.dd-menu');
      if (!menu) return;
      // Don't close if clicking inside the menu
      if (menu.contains(ev.target)) return;
      
      // Check if clicking on a status/project cell
      const td = ev.target.closest('td');
      if (td && (td.dataset.field === 'status' || td.dataset.field === 'project')) {
        const tr = td.closest('tr');
        if (tr) {
          const cellId = `${tr.dataset.id}-${td.dataset.field}`;
          // Store the cell ID to prevent immediate reopen
          lastClosedCell = cellId;
          clearTimeout(closeTimeout);
          closeTimeout = setTimeout(() => {
            lastClosedCell = null;
          }, 100);
        }
      }
      
      menu.remove();
    });
    
    // Make lastClosedCell accessible to tbody click handler
    tbody.dataset.dropdownHelper = 'ready';
    tbody._getLastClosedCell = () => lastClosedCell;
    
    document.addEventListener('keydown', (ev) => {
      if (ev.key === 'Escape') {
        const menu = document.querySelector('.dd-menu');
        if (menu) menu.remove();
      }
    });
    dropdownListenersReady = true;
  }

  /**
   * Open context menu for row actions (right-click menu)
   * Currently only shows "Delete" option
   * @param {number} x - Mouse X position
   * @param {number} y - Mouse Y position
   * @param {number} idx - Task index in tasks array
   * @returns {void}
   */
  function openRowMenu(x, y, idx) {
    const existing = document.querySelector('.dd-menu');
    if (existing) existing.remove();
    const menu = document.createElement('div');
    menu.className = 'dd-menu row-menu';
    menu.style.top = `${y}px`;
    menu.style.left = `${x}px`;
    menu.innerHTML = `
      <div class="dd-sec">
        <ul class="dd-list">
          <li class="dd-item del-row"><span>Delete Task</span></li>
        </ul>
      </div>
    `;
    document.body.appendChild(menu);
    ensureDropdownListeners();
    const del = menu.querySelector('.del-row');
    del.addEventListener('click', (ev) => {
      ev.stopPropagation();
      tasks.splice(idx, 1);
      save();
      render();
      if (menu.isConnected) menu.remove();
    });
  }

  /**
   * Open context menu for tab actions (right-click on tab)
   * Shows "Delete Tab" option (except for "All Tasks")
   * @param {number} x - Mouse X position
   * @param {number} y - Mouse Y position
   * @param {string} tabName - Name of the tab
   * @returns {void}
   */
  function openTabMenu(x, y, tabName) {
    const existing = document.querySelector('.dd-menu');
    if (existing) existing.remove();
    const menu = document.createElement('div');
    menu.className = 'dd-menu tab-menu';
    menu.style.top = `${y}px`;
    menu.style.left = `${x}px`;
    menu.innerHTML = `
      <div class="dd-sec">
        <ul class="dd-list">
          <li class="dd-item del-tab"><span>Delete Tab</span></li>
        </ul>
      </div>
    `;
    document.body.appendChild(menu);
    ensureDropdownListeners();
    const del = menu.querySelector('.del-tab');
    del.addEventListener('click', (ev) => {
      ev.stopPropagation();
      const idx = tabs.indexOf(tabName);
      if (idx >= 0) {
        tabs.splice(idx, 1);
        // If deleted tab was active, switch to "All Tasks"
        if (activeTab === tabName) {
          activeTab = 'All Tasks';
        }
        saveTabs();
        render();
      }
      if (menu.isConnected) menu.remove();
    });
  }

  // Contenteditable event handlers for inline editing
  // focusin: Store original value for Escape revert
  tbody.addEventListener('focusin', (e) => {
    const t = e.target;
    if (t.isContentEditable) {
      t.dataset.prev = t.textContent;
    }
  });

  // blur: Commit changes when focus leaves contenteditable field
  tbody.addEventListener('blur', (e) => {
    const t = e.target;
    if (!t.isContentEditable) return;
    const rowMenuOpen = document.querySelector('.dd-menu.row-menu');
    if (rowMenuOpen) return;
    const tr = t.closest('tr');
    if (!tr) return;
    const id = tr.dataset.id;
    const field = t.dataset.field;
    commitEdit(id, field, (t.textContent || '').trim());
  }, true);

  // keydown: Handle Enter (commit) and Escape (revert) for contenteditable
  tbody.addEventListener('keydown', (e) => {
    const t = e.target;
    if (!t.isContentEditable) return;
    if (e.key === 'Enter') {
      e.preventDefault();
      t.blur();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      const prev = t.dataset.prev ?? '';
      t.textContent = prev;
      t.blur();
    }
  });

  /**
   * Open dropdown menu for multi-select status/project editing
   * Features: checkboxes for multi-select, drag-to-reorder, inline edit, color picker, add/delete options
   * @param {HTMLElement} cell - Table cell to anchor menu to
   * @param {string} type - 'status' or 'project'
   * @param {string[]} currentArray - Currently selected values
   * @param {Function} onPick - Callback function with new array when changed
   * @param {string} cellId - Unique cell identifier for toggle behavior
   * @returns {void}
   */
  function openDropdown(cell, type, currentArray, onPick, cellId) {
    // Close any existing menu
    const existing = document.querySelector('.dd-menu');
    if (existing) existing.remove();
    const rect = cell.getBoundingClientRect();
    const scrollY = window.scrollY || document.documentElement.scrollTop;
    const scrollX = window.scrollX || document.documentElement.scrollLeft;
    const menu = document.createElement('div');
    menu.className = 'dd-menu';
    menu.style.top = `${rect.bottom + scrollY + 6}px`;
    menu.style.left = `${rect.left + scrollX}px`;
    if (cellId) {
      menu.dataset.cellId = cellId;
    }

    const list = type === 'status' ? statusOptions : projectOptions;
    const selected = Array.isArray(currentArray) ? currentArray : [];

    const listHtml = list.map((o, idx) => {
      const isChecked = selected.some(s => s.toLowerCase() === o.name.toLowerCase());
      return `
      <li class="dd-item" data-name="${o.name}" data-idx="${idx}" draggable="true">
        <span class="grip" title="Drag">⋮⋮</span>
        <input type="checkbox" class="select-option" value="${o.name}" ${isChecked ? 'checked' : ''}>
        <span class="dot" style="background:${o.color}"></span>
        <span class="label">${o.name}</span>
        <span class="grow"></span>
        <button class="icon-btn opt-edit" title="Edit" aria-label="Edit ${o.name}">✏</button>
        <button class="icon-btn opt-del" title="Delete" aria-label="Delete ${o.name}">🗑</button>
      </li>
    `;
    }).join('');

    menu.innerHTML = `
      <div class="dd-sec">
        <p class="dd-title">Select ${type}</p>
        <ul class="dd-list">${listHtml || '<li class="dd-item" style="cursor:default;">No options yet</li>'}</ul>
      </div>
      <div class="dd-sec dd-add">
        <p class="dd-title">Add new ${type}</p>
        <div class="dd-add-row">
          <input class="dd-input" type="text" placeholder="Name" />
        </div>
        <div class="swatches">
          ${PALETTE.map((p,i)=>`<div class="swatch" data-color="${p.color}" title="${p.name}" style="background:${p.color}"></div>`).join('')}
        </div>
        <div class="dd-actions">
          <button class="btn small">Add</button>
          <button class="btn small">Close</button>
        </div>
      </div>
    `;

    document.body.appendChild(menu);

    // interactions
    const ul = menu.querySelector('.dd-list');
    if (ul) {
      let dragIdx = null;
      ul.addEventListener('dragstart', (e) => {
        const li = e.target.closest('.dd-item');
        if (!li) return;
        dragIdx = Number(li.dataset.idx);
        li.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        try { e.dataTransfer.setData('text/plain', String(dragIdx)); } catch {}
      });
      ul.addEventListener('dragend', (e) => {
        const li = e.target.closest('.dd-item');
        if (li) li.classList.remove('dragging');
        ul.querySelectorAll('.drop-before').forEach(el => el.classList.remove('drop-before'));
        dragIdx = null;
      });
      ul.addEventListener('dragover', (e) => {
        e.preventDefault();
        const li = e.target.closest('.dd-item');
        if (!li) return;
        ul.querySelectorAll('.drop-before').forEach(el => el.classList.remove('drop-before'));
        li.classList.add('drop-before');
        e.dataTransfer.dropEffect = 'move';
      });
      ul.addEventListener('dragleave', (e) => {
        const li = e.target.closest('.dd-item');
        if (li) li.classList.remove('drop-before');
      });
      ul.addEventListener('drop', (e) => {
        e.preventDefault();
        const li = e.target.closest('.dd-item');
        if (!li) return;
        const toIdx = Number(li.dataset.idx);
        if (dragIdx === null || isNaN(toIdx) || dragIdx === toIdx) return;
        const optsRef = type === 'status' ? statusOptions : projectOptions;
        const [moved] = optsRef.splice(dragIdx, 1);
        optsRef.splice(toIdx, 0, moved);
        saveOptions();
        if (menu.isConnected) menu.remove();
        openDropdown(cell, type, currentArray, onPick);
      });
      ul.addEventListener('click', (ev) => {
        // Handle checkbox changes
        const checkbox = ev.target.closest('.select-option');
        if (checkbox) {
          ev.stopPropagation();
          setTimeout(() => {
            const newSelected = Array.from(ul.querySelectorAll('.select-option:checked')).map(cb => cb.value);
            onPick(newSelected);
          }, 0);
          return;
        }
        // Handle edit/delete first
        const editBtn = ev.target.closest('.opt-edit');
        const delBtn = ev.target.closest('.opt-del');
        const li = ev.target.closest('.dd-item');
        if (!li) return;
        const name = li.dataset.name;
        if (editBtn) {
          ev.stopPropagation();
          const opt = findOption(list, name);
          if (!opt) return;
          // render inline editor
          li.innerHTML = `
            <div class="dd-edit">
              <input class="dd-input name" type="text" value="${opt.name}" />
              <div class="swatches">
                ${PALETTE.map(p => `<div class="swatch${p.color===opt.color?' selected':''}" data-color="${p.color}" title="${p.name}" style="background:${p.color}"></div>`).join('')}
              </div>
              <div class="dd-actions">
                <button class="btn small primary save">Save</button>
                <button class="btn small cancel">Cancel</button>
              </div>
            </div>
          `;
          let selectedColor = opt.color || PALETTE[0].color;
          const inputField = li.querySelector('.dd-input.name');
          inputField.addEventListener('click', (e) => e.stopPropagation());
          inputField.addEventListener('focus', (e) => e.stopPropagation());
          inputField.addEventListener('input', (e) => e.stopPropagation());
          li.querySelectorAll('.swatch').forEach(el => {
            el.addEventListener('click', (e) => {
              e.stopPropagation();
              li.querySelectorAll('.swatch').forEach(s => s.classList.remove('selected'));
              el.classList.add('selected');
              selectedColor = el.dataset.color;
            });
          });
          li.querySelector('.save').addEventListener('click', (e) => {
            e.stopPropagation();
            const newName = li.querySelector('.dd-input.name').value.trim();
            if (!newName) return;
            const ok = renameOption(type, name, newName, selectedColor);
            if (!ok) {
              alert('Name already exists.');
              return;
            }
            // Update current array if the renamed item is selected
            const updatedArray = currentArray.map(item => 
              item.toLowerCase() === name.toLowerCase() ? newName : item
            );
            // Update the task immediately
            onPick(updatedArray);
            if (menu.isConnected) menu.remove();
          });
          li.querySelector('.cancel').addEventListener('click', (e) => {
            e.stopPropagation();
            if (menu.isConnected) menu.remove();
            openDropdown(cell, type, currentArray, onPick);
          });
          return;
        }
        if (delBtn) {
          ev.stopPropagation();
          if (confirm(`Delete ${type} option "${name}"?`)) {
            deleteOptionValue(type, name);
            // Remove deleted item from current selection
            const updatedArray = currentArray.filter(item => item.toLowerCase() !== name.toLowerCase());
            // Update the task and trigger re-render
            onPick(updatedArray);
            if (menu.isConnected) menu.remove();
            openDropdown(cell, type, updatedArray, onPick);
          }
          return;
        }
      });
    }

    let selectedColor = PALETTE[0].color;
    menu.querySelectorAll('.swatch').forEach((el, idx) => {
      if (idx === 0) el.classList.add('selected');
      el.addEventListener('click', () => {
        menu.querySelectorAll('.swatch').forEach(s => s.classList.remove('selected'));
        el.classList.add('selected');
        selectedColor = el.dataset.color;
      });
    });

    const [addBtn, closeBtn] = menu.querySelectorAll('.dd-actions .btn');
    const input = menu.querySelector('.dd-input');
    addBtn.addEventListener('click', () => {
      const name = (input.value || '').trim();
      if (!name) { input.focus(); return; }
      const optsRef = type === 'status' ? statusOptions : projectOptions;
      if (!findOption(optsRef, name)) {
        optsRef.push({ name, color: selectedColor });
        saveOptions();
      }
      // Add the new option to current selection
      const newSelected = [...selected, name];
      onPick(newSelected);
      if (menu.isConnected) menu.remove();
    });
    closeBtn.addEventListener('click', () => { if (menu.isConnected) menu.remove(); });
    ensureDropdownListeners();
  }

  // ============================================
  // INITIALIZATION
  // Load data and setup event handlers on page load
  // ============================================

  // Load all persisted data from localStorage
  load();
  loadOptions();
  loadColumns();
  loadTabs();
  loadFilters();
  loadSorts();
  
  // Setup drag-and-drop for column reordering (once)
  setupHeaderDragDrop();
  
  // Initial render of the UI
  render();
})();
