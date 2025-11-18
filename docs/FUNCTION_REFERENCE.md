# Function Reference Guide

Complete reference for all functions in `app.js` with examples and usage patterns.

---

## Table of Contents

1. [Utility Functions](#utility-functions)
2. [LocalStorage Operations](#localstorage-operations)
3. [Option Management](#option-management)
4. [Cell Builders](#cell-builders)
5. [Rendering Functions](#rendering-functions)
6. [Filtering & Sorting](#filtering--sorting)
7. [Event Handlers](#event-handlers)
8. [Dropdown Menus](#dropdown-menus)
9. [Initialization](#initialization)

---

## Utility Functions

### `uid()`
Generates a unique identifier for new tasks.

**Returns:** `string` - Timestamp-based unique ID

**Example:**
```javascript
const newTask = { id: uid(), name: '', status: [] };
// { id: "1704123456789", name: "", status: [] }
```

**Implementation:**
```javascript
function uid() {
  return Date.now().toString();
}
```

---

### `formatDate(dateStr)`
Formats ISO date strings into human-readable text.

**Parameters:**
- `dateStr` (string): ISO date string (YYYY-MM-DD)

**Returns:** `string` - Formatted date ("Today", "Tomorrow", "Mon 15 Jan", "15 Jan 24")

**Example:**
```javascript
formatDate('2024-01-15');  // "Today" (if today is 2024-01-15)
formatDate('2024-01-16');  // "Tomorrow" (if today is 2024-01-15)
formatDate('2024-02-20');  // "Tue 20 Feb"
formatDate('2025-03-10');  // "10 Mar 25"
```

**Logic:**
- Compares date to today/tomorrow
- Within current year: "Day DD Mon"
- Different year: "DD Mon YY"

---

### `badgeHtml(text, color)`
Generates HTML for colored badge elements.

**Parameters:**
- `text` (string): Text to display
- `color` (string): Hex color code

**Returns:** `string` - HTML string for badge

**Example:**
```javascript
badgeHtml('Doing', '#4CAF50');
// '<span class="badge" style="background:#4CAF50;color:#fff">Doing</span>'
```

**Usage:**
- Status badges
- Project badges
- Filter chips

---

### `findOption(options, name)`
Finds an option by name (case-insensitive).

**Parameters:**
- `options` (Array): Array of option objects
- `name` (string): Name to search for

**Returns:** `object|null` - Matching option or null

**Example:**
```javascript
const opt = findOption(statusOptions, 'doing');
// { name: 'Doing', color: '#4CAF50' }
```

---

## LocalStorage Operations

All storage functions follow this pattern:
- Try/catch for error handling
- JSON.parse/stringify
- Return defaults on error

### `load()`
Loads tasks from localStorage with data migration.

**Returns:** `void`

**Side Effects:**
- Sets global `tasks` array
- Migrates old format (string) to new format (array) for status/project

**Migration Logic:**
```javascript
// Old format: status: "Doing"
// New format: status: ["Doing"]

status: Array.isArray(t.status) ? t.status : (t.status ? [t.status] : [])
```

**Example:**
```javascript
load();  // tasks = [{ id: "123", status: ["Doing"], project: [] }]
```

---

### `save()`
Persists tasks to localStorage.

**Returns:** `void`

**Example:**
```javascript
tasks.push({ id: uid(), name: 'New Task', status: [] });
save();  // Writes to localStorage
```

---

### `loadOptions()`
Loads status and project options.

**Returns:** `void`

**Side Effects:**
- Sets `statusOptions` array
- Sets `projectOptions` array

**Default Values:**
```javascript
statusOptions = [
  { name: 'To Do', color: '#9E9E9E' },
  { name: 'Doing', color: '#4CAF50' },
  { name: 'Done', color: '#2196F3' }
];
projectOptions = [];
```

---

### `saveOptions()`
Saves options to localStorage.

**Returns:** `void`

---

### `loadColumns()` / `saveColumns()`
Manages column order persistence.

**Returns:** `void`

**Example:**
```javascript
columnOrder = ['done', 'name', 'status', 'project', 'deadline', 'description'];
saveColumns();  // Persisted across sessions
```

---

### `loadTabs()` / `saveTabs()`
Manages project tabs configuration.

**Returns:** `void`

**Default:**
```javascript
tabs = [{ name: 'All Tasks', project: null }];
```

---

### `loadFilters()` / `saveFilters()`
Manages active filter state.

**Returns:** `void`

**Example:**
```javascript
activeFilters = {
  status: ['Doing'],
  project: ['Work'],
  done: 'false'
};
saveFilters();
```

---

### `loadSorts()` / `saveSorts()`
Manages sort configuration.

**Returns:** `void`

**Example:**
```javascript
activeSorts = [
  { field: 'deadline', asc: true, priority: 0 },
  { field: 'name', asc: true, priority: 1 }
];
saveSorts();
```

---

## Option Management

### `renameOption(type, oldName, newName, newColor)`
Renames and recolors a status or project option.

**Parameters:**
- `type` (string): 'status' or 'project'
- `oldName` (string): Current name
- `newName` (string): New name
- `newColor` (string): New hex color

**Returns:** `boolean` - True if successful, false if name conflict

**Side Effects:**
- Updates option in options array
- Updates all tasks referencing old name
- Saves options and tasks

**Example:**
```javascript
renameOption('status', 'Doing', 'In Progress', '#FF9800');
// All tasks with status "Doing" now have "In Progress"
```

**Validation:**
- Prevents duplicate names (case-insensitive)
- Returns false if new name already exists

---

### `deleteOptionValue(type, name)`
Deletes a status or project option.

**Parameters:**
- `type` (string): 'status' or 'project'
- `name` (string): Option name to delete

**Returns:** `boolean` - True if successful

**Side Effects:**
- Removes from options array
- Removes from all tasks
- Saves options and tasks

**Example:**
```javascript
deleteOptionValue('status', 'Doing');
// Status "Doing" removed from all tasks
```

---

## Cell Builders

### `buildCell(col, t)`
Factory function that creates table cells based on column type.

**Parameters:**
- `col` (string): Column name ('done', 'name', 'status', etc.)
- `t` (object): Task object

**Returns:** `HTMLElement` - Table cell element

**Cell Types:**

#### 1. Done Checkbox
```javascript
if (col === 'done') {
  // Returns: <td><input type="checkbox" /></td>
}
```

#### 2. Editable Text (name, description)
```javascript
if (col === 'name') {
  // Returns: <td contenteditable="true">Task name</td>
}
```

#### 3. Multi-Badge (status, project)
```javascript
if (col === 'status') {
  // Returns: <td>
  //   <span class="badge">Doing</span>
  //   <span class="badge">Review</span>
  // </td>
}
```

#### 4. Date Picker (deadline)
```javascript
if (col === 'deadline') {
  // Returns: <td>
  //   Tomorrow
  //   <input type="date" class="deadline-picker-hidden" />
  // </td>
}
```

**Example:**
```javascript
const task = { id: '123', name: 'Test', status: ['Doing'], done: false };
const nameCell = buildCell('name', task);
const statusCell = buildCell('status', task);
```

---

### `taskRow(t)`
Builds a complete table row for a task.

**Parameters:**
- `t` (object): Task object

**Returns:** `HTMLElement` - Table row element

**Example:**
```javascript
const task = { id: '123', name: 'Test Task', status: ['Doing'] };
const row = taskRow(task);
// <tr data-id="123">
//   <td><input type="checkbox" /></td>
//   <td contenteditable="true">Test Task</td>
//   <td><span class="badge">Doing</span></td>
//   ...
// </tr>
```

**Features:**
- Iterates through `columnOrder`
- Calls `buildCell()` for each column
- Applies opacity for completed tasks

---

## Rendering Functions

### `render()`
Main rendering function - filters, sorts, and displays tasks.

**Returns:** `void`

**Steps:**
1. Filter tasks by active criteria
2. Apply search query
3. Sort by active sorts
4. Clear tbody
5. Create row for each task
6. Add "+ Add Task" row

**Example:**
```javascript
tasks.push(newTask);
render();  // Updates table display
```

**Dependencies:**
- `filterTasks(query)` - Filtering logic
- `taskRow(t)` - Row creation
- `activeSorts` - Sort configuration

---

### `renderHeader()`
Renders table header with sort indicators.

**Returns:** `void`

**Features:**
- Draggable columns
- Sort arrows (↑/↓)
- Sort priority numbers

**Example:**
```javascript
// Header with sort indicator:
// Name ↑1  Status  Deadline ↓2
```

---

### `renderTabs()`
Renders project tabs in toolbar.

**Returns:** `void`

**Features:**
- "All Tasks" tab (always present)
- Project-specific tabs
- Active tab highlighting
- "+ Add" button

**Example:**
```javascript
renderTabs();
// [All Tasks] [Work] [Personal] [+]
//  ^^^^^^^^^ (active)
```

---

### `renderChips()`
Renders active filter and sort chips.

**Returns:** `void`

**Features:**
- Removable chips (× button)
- Shows filter criteria
- Shows sort priority

**Example:**
```javascript
// Active filters: status=Doing, project=Work
// Active sorts: deadline↑ (priority 1), name↑ (priority 2)

renderChips();
// [Status: Doing ×] [Project: Work ×] [Sort: 1 Deadline ↑] [Sort: 2 Name ↑]
```

---

## Filtering & Sorting

### `filterTasks(query)`
Filters tasks based on active criteria and search query.

**Parameters:**
- `query` (string): Search text (optional)

**Returns:** `Array<Task>` - Filtered tasks

**Filter Steps:**

1. **Tab Filter** (All Tasks vs specific project)
```javascript
if (activeTab !== 'All Tasks') {
  // Only tasks with matching project
}
```

2. **Status Filter**
```javascript
if (activeFilters.status.length > 0) {
  // Task must have at least one matching status
  t.status.some(s => activeFilters.status.includes(s))
}
```

3. **Project Filter**
```javascript
if (activeFilters.project.length > 0) {
  // Task must have at least one matching project
  t.project.some(p => activeFilters.project.includes(p))
}
```

4. **Done Filter**
```javascript
if (activeFilters.done === 'true') {
  // Only completed tasks
}
```

5. **Search Query**
```javascript
if (query) {
  // Search in: name, description, status array, project array
  const searchText = [
    t.name,
    t.description,
    t.status.join(' '),
    t.project.join(' ')
  ].join(' ').toLowerCase();
  
  return searchText.includes(query.toLowerCase());
}
```

**Example:**
```javascript
const filtered = filterTasks('meeting');
// Returns tasks with "meeting" in name/description/status/project
```

---

### Sort Algorithm
Multi-field sorting with priority.

**Logic:**
```javascript
filtered.sort((a, b) => {
  for (const s of activeSorts) {
    let aVal = a[s.field];
    let bVal = b[s.field];
    
    // Handle arrays (join with ', ')
    if (Array.isArray(aVal)) aVal = aVal.join(', ');
    if (Array.isArray(bVal)) bVal = bVal.join(', ');
    
    // Normalize
    aVal = (aVal || '').toString().toLowerCase();
    bVal = (bVal || '').toString().toLowerCase();
    
    // Compare
    const cmp = aVal.localeCompare(bVal, undefined, { numeric: true });
    if (cmp !== 0) {
      return s.asc ? cmp : -cmp;
    }
  }
  return 0;
});
```

**Example:**
```javascript
// Sort by: 1) Deadline ascending, 2) Name ascending
activeSorts = [
  { field: 'deadline', asc: true, priority: 0 },
  { field: 'name', asc: true, priority: 1 }
];
render();
```

---

## Event Handlers

### Event Delegation Pattern
Single tbody listener handles all row interactions.

**Structure:**
```javascript
tbody.addEventListener('click', (e) => {
  const target = e.target;
  const row = target.closest('tr');
  if (!row) return;
  
  const taskId = row.dataset.id;
  const idx = tasks.findIndex(t => t.id === taskId);
  
  // Route to specific handlers
  if (target.classList.contains('toggle-done')) {
    // Handle checkbox
  }
  if (target.closest('.badge')) {
    // Handle badge click
  }
  // ... more handlers
});
```

**Benefits:**
- Single listener (better performance)
- Works with dynamic content
- Cleaner code

---

### Key Event Handlers

#### 1. Add Task Button
```javascript
addRowBtn.addEventListener('click', () => {
  const newTask = {
    id: uid(),
    name: '',
    description: '',
    status: [],
    project: [],
    deadline: '',
    done: false
  };
  tasks.push(newTask);
  save();
  render();
  // Focus name field
});
```

#### 2. Toggle Done Checkbox
```javascript
if (target.classList.contains('toggle-done')) {
  tasks[idx].done = target.checked;
  save();
  render();
}
```

#### 3. Badge Click (open dropdown)
```javascript
if (target.closest('.badge')) {
  const cell = target.closest('td');
  const field = cell.dataset.field;
  const currentArray = tasks[idx][field] || [];
  
  openDropdown(cell, field, currentArray, (newArray) => {
    tasks[idx][field] = newArray;
    save();
    render();
  });
}
```

#### 4. Contenteditable Inline Editing
```javascript
// focusin: store original value
td.addEventListener('focusin', (e) => {
  e.target.dataset.orig = e.target.textContent;
});

// keydown: Enter commits, Escape reverts
td.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    e.target.blur();
  }
  if (e.key === 'Escape') {
    e.target.textContent = e.target.dataset.orig;
    e.target.blur();
  }
});

// blur: save changes
td.addEventListener('blur', (e) => {
  const newValue = e.target.textContent.trim();
  tasks[idx][field] = newValue;
  save();
  render();
});
```

#### 5. Right-Click Context Menu
```javascript
tbody.addEventListener('contextmenu', (e) => {
  e.preventDefault();
  const row = e.target.closest('tr');
  if (!row) return;
  
  const idx = tasks.findIndex(t => t.id === row.dataset.id);
  openRowMenu(e.pageX, e.pageY, idx);
});
```

---

## Dropdown Menus

### `openDropdown(cell, type, currentArray, onPick, cellId)`
Opens a dropdown menu for multi-select (status/project).

**Parameters:**
- `cell` (HTMLElement): Cell to anchor dropdown to
- `type` (string): 'status' or 'project'
- `currentArray` (Array): Currently selected values
- `onPick` (Function): Callback with new array
- `cellId` (string): Unique cell identifier

**Features:**
1. Multi-select checkboxes
2. Add new option
3. Edit option (inline)
4. Delete option
5. Color picker
6. Drag to reorder

**Toggle Behavior:**
```javascript
// Prevent immediate reopen
if (Date.now() - lastClosedCell.time < 100 && lastClosedCell.id === cellId) {
  return;  // Don't reopen
}
```

**Example:**
```javascript
openDropdown(cell, 'status', ['Doing'], (newArray) => {
  task.status = newArray;  // ['Doing', 'Review']
  save();
  render();
});
```

---

### `openFilterMenu(btn)`
Opens filter configuration menu.

**Parameters:**
- `btn` (HTMLElement): Button to anchor to

**Features:**
- Status checkboxes
- Project checkboxes
- Done state radios (All/Done/Not Done)

**Example:**
```javascript
filterBtn.addEventListener('click', () => {
  openFilterMenu(filterBtn);
});
```

---

### `openSortMenu(btn)`
Opens sort configuration menu.

**Parameters:**
- `btn` (HTMLElement): Button to anchor to

**Features:**
- Field checkboxes
- Direction dropdowns (Ascending/Descending)
- Priority ordering

**Example:**
```javascript
sortBtn.addEventListener('click', () => {
  openSortMenu(sortBtn);
});
```

---

### `openRowMenu(x, y, idx)`
Opens context menu for task row.

**Parameters:**
- `x` (number): Mouse X position
- `y` (number): Mouse Y position
- `idx` (number): Task index

**Features:**
- Delete task option

**Example:**
```javascript
tbody.addEventListener('contextmenu', (e) => {
  e.preventDefault();
  openRowMenu(e.pageX, e.pageY, taskIndex);
});
```

---

### `openTabMenu(x, y, tabName)`
Opens context menu for tab.

**Parameters:**
- `x` (number): Mouse X position
- `y` (number): Mouse Y position
- `tabName` (string): Tab name

**Features:**
- Delete tab (except "All Tasks")

---

### `openAddTabMenu(btn)`
Opens menu to add new project tab.

**Parameters:**
- `btn` (HTMLElement): Button to anchor to

**Features:**
- List of available projects
- Create new project inline

**Example:**
```javascript
addTabBtn.addEventListener('click', () => {
  openAddTabMenu(addTabBtn);
});
```

---

## Initialization

### Startup Sequence
```javascript
(function() {
  // 1. Load all data from localStorage
  load();
  loadOptions();
  loadColumns();
  loadTabs();
  loadFilters();
  loadSorts();
  
  // 2. Setup event listeners (once)
  setupHeaderDragDrop();
  
  // 3. Initial render
  render();
})();
```

**Order Matters:**
- Load data before rendering
- Setup listeners before user interaction
- Render last to display initial state

---

## Common Patterns

### 1. Modify-Save-Render Pattern
```javascript
// Modify state
tasks[idx].name = 'New Name';

// Persist
save();

// Update UI
render();
```

### 2. Array Operations (Multi-Select)
```javascript
// Add to array
if (!task.status.includes('Doing')) {
  task.status.push('Doing');
}

// Remove from array
task.status = task.status.filter(s => s !== 'Doing');

// Check if array contains
const hasDoing = task.status.some(s => s === 'Doing');
```

### 3. Find and Update
```javascript
const idx = tasks.findIndex(t => t.id === taskId);
if (idx >= 0) {
  tasks[idx].done = true;
  save();
  render();
}
```

### 4. Dropdown Menu Pattern
```javascript
function openSomeMenu(anchor, callback) {
  // 1. Create menu element
  const menu = document.createElement('div');
  menu.className = 'dropdown-menu';
  
  // 2. Position relative to anchor
  const rect = anchor.getBoundingClientRect();
  menu.style.top = rect.bottom + 'px';
  menu.style.left = rect.left + 'px';
  
  // 3. Build content
  menu.innerHTML = `...`;
  
  // 4. Append to body
  document.body.appendChild(menu);
  
  // 5. Close on outside click
  setTimeout(() => {
    document.addEventListener('click', closeHandler, { once: true });
  }, 0);
}
```

---

## Performance Tips

1. **Cache DOM elements** - Select once, reuse
2. **Event delegation** - Single listener for multiple elements
3. **Early returns** - Exit loops/functions ASAP
4. **Batch operations** - Update state, then render once
5. **Fixed table layout** - Prevent costly reflows

---

This reference guide provides all the information needed to understand, modify, and extend the application's functionality.
