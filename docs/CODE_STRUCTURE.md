# Code Structure Documentation

## File: app.js (1586 lines)

### Architecture Overview
The application uses an IIFE (Immediately Invoked Function Expression) pattern to encapsulate all logic and avoid global namespace pollution.

---

## Code Organization

### 1. Constants & Configuration (Lines 1-95)
- **Storage Keys**: LocalStorage keys for data persistence
- **Default Values**: Column order, color palette
- **Type Definitions**: JSDoc typedef for Task structure
- **DOM References**: Cached selectors for performance

### 2. Utility Functions (Lines 96-175)
#### `uid()` - Generate Unique IDs
- Returns timestamp-based unique identifier
- Used for new task creation

#### `formatDate(dateStr)` - Date Formatting
- Converts ISO dates to human-readable format
- Special handling: "Today", "Tomorrow", relative days

#### `badgeHtml(text, color)` - Badge Generation  
- Creates colored badge HTML
- Used for status and project display

#### `findOption(options, name)` - Option Lookup
- Case-insensitive search
- Returns matching option or null

### 3. LocalStorage Operations (Lines 176-280)
All storage functions follow consistent pattern:
- Try/catch for error handling
- JSON parse/stringify
- Fallback to defaults on error

| Function | Purpose |
|----------|---------|
| `load()` | Load tasks with migration |
| `save()` | Save tasks |
| `loadOptions()` | Load status/project options |
| `saveOptions()` | Save options |
| `loadColumns()` | Load column order |
| `saveColumns()` | Save column order |
| `loadTabs()` | Load tabs configuration |
| `saveTabs()` | Save tabs |
| `loadFilters()` | Load active filters |
| `saveFilters()` | Save filters |
| `loadSorts()` | Load sort configuration |
| `saveSorts()` | Save sorts |

### 4. Option Management (Lines 330-380)
#### `renameOption(type, oldName, newName, newColor)`
- Updates option definition
- Updates all tasks referencing it
- Validates no duplicate names

#### `deleteOptionValue(type, name)`
- Removes option from list
- Removes from all tasks
- Persists changes

### 5. Table Cell Builders (Lines 381-550)
**Pattern**: Each column type has dedicated builder function

#### `buildCell(col, t)` - Main Cell Factory
- Routes to specific builders based on column type
- Returns DOM element or HTML string

#### Specialized Builders:
- **Done Column**: Checkbox input
- **Text Columns** (name, description): Contenteditable
- **Status/Project Columns**: Multi-badge display with click handler
- **Deadline Column**: Date picker with formatted display

**Reusability**: Cell builders are pure functions that can be extracted to separate modules

### 6. Table Row Builder (Lines 551-585)
#### `taskRow(t)` - Complete Row Construction
- Creates `<tr>` element
- Iterates through columnOrder
- Calls `buildCell()` for each column
- Attaches data-id attribute

### 7. Rendering Functions (Lines 586-770)

#### `renderHeader()` - Table Header
- Builds column headers
- Adds sort indicators
- Sets up drag-to-reorder capability

#### `renderTabs()` - Project Tabs
- Renders tab buttons
- Highlights active tab
- Adds "+" button for new tabs

#### `render()` - Main Render Function
**Responsibilities**:
1. Filter tasks based on criteria
2. Apply search query
3. Sort tasks (multi-field)
4. Clear and populate tbody
5. Add "+ Add task" row

#### `renderChips()` - Filter/Sort Chips
- Displays active filters as removable chips
- Shows sort criteria with priority numbers
- Updates chip container visibility

### 8. Filtering & Sorting Logic (Lines 771-900)

#### `filterTasks(q)` - Task Filtering
**Filters applied**:
1. Tab-based (All Tasks vs specific project)
2. Status array matching
3. Project array matching
4. Done state matching
5. Text search (name, description, status, project)

**Performance**: Early returns for efficiency

#### Sort Algorithm
**Multi-field sorting**:
- Iterates through activeSorts in order
- Handles arrays by joining with ', '
- Locale-aware string comparison
- Stable sort algorithm

### 9. Event Handlers (Lines 901-1200)

#### Organized by Element:
- **addRowBtn**: Create new task
- **filterBtn**: Open filter menu
- **sortBtn**: Open sort menu
- **search**: Real-time filtering
- **tbody**: Event delegation for row interactions
- **thead**: Column drag-and-drop

#### Event Delegation Pattern:
```javascript
tbody.addEventListener('click', (e) => {
  const target = e.target;
  // Route to specific handlers
});
```

**Benefits**:
- Single listener instead of per-row
- Works with dynamically added rows
- Better performance

### 10. Dropdown Menus (Lines 1201-1500)

#### `openDropdown(cell, type, currentArray, onPick, cellId)`
**Features**:
- Checkbox-based multi-select
- Drag-to-reorder options
- Inline edit mode
- Add new option
- Color picker
- Delete option

**Toggle Behavior**:
- Tracks recently closed cell
- Prevents immediate reopen
- Click same cell = close

#### `openFilterMenu(btn)` - Filter Configuration
- Checkboxes for status/project
- Radio buttons for done state
- Live application of filters

#### `openSortMenu(btn)` - Sort Configuration
- Checkboxes for fields
- Dropdowns for direction
- Priority ordering

#### `openRowMenu(x, y, idx)` - Context Menu
- Positioned at cursor
- Delete task option

#### `openTabMenu(x, y, tabName)` - Tab Context Menu
- Right-click on tabs
- Delete tab (except "All Tasks")

#### `openAddTabMenu(btn)` - Add Project Tab
- Lists available projects
- Inline project creation
- Color picker

### 11. Header Drag-and-Drop (Lines 1501-1580)

#### `setupHeaderDragDrop()` - Column Reordering
**Implementation**:
- Single initialization (not per-render)
- Visual feedback (opacity, highlight)
- Swap algorithm
- Persist order

**Events**:
- `dragstart`: Store column
- `dragover`: Show drop target
- `drop`: Swap columns
- `dragend`: Clean up

### 12. Inline Editing (Lines 1081-1160)

#### Contenteditable Workflow:
1. **focusin**: Store original value
2. **User edits**: Direct text manipulation
3. **Enter**: Commit changes
4. **Escape**: Revert to original
5. **blur**: Save changes

#### `commitEdit(id, field, value)`
- Updates task in array
- Saves to localStorage
- Triggers re-render

### 13. Initialization (Lines 1581-1586)
```javascript
// Load all data
load();
loadOptions();
loadColumns();
loadTabs();
loadFilters();
loadSorts();

// Setup event listeners (once)
setupHeaderDragDrop();

// Initial render
render();
```

---

## Key Design Patterns

### 1. Module Pattern (IIFE)
```javascript
(function() {
  // Private variables and functions
  // No global pollution
})();
```

### 2. Event Delegation
```javascript
tbody.addEventListener('click', (e) => {
  // Handle all row clicks with single listener
});
```

### 3. Factory Functions
```javascript
const buildCell = (col, t) => {
  // Returns configured DOM element
};
```

### 4. State Synchronization
```javascript
// Update state
tasks[idx].name = newValue;
// Persist
save();
// Re-render
render();
```

### 5. Data Migration
```javascript
// Handle old format
status: Array.isArray(t.status) ? t.status : (t.status ? [t.status] : [])
```

---

## Performance Optimizations

1. **Cached DOM References**: Selected once, reused
2. **Event Delegation**: Single listener instead of many
3. **Early Returns**: Exit filter/sort loops quickly
4. **Fixed Table Layout**: CSS prevents reflow
5. **Debounced Search**: (Could be added for large datasets)

---

## Refactoring Opportunities

### High Priority
1. **Extract Cell Builders**: Move to separate module
2. **Separate Dropdown Logic**: Reusable component
3. **State Management**: Single state object
4. **API Service Layer**: Prep for backend integration

### Medium Priority
5. **Utility Functions**: Separate file
6. **Event Handlers**: Separate file
7. **Constants**: Configuration file
8. **Type Definitions**: TypeScript or JSDoc file

### Low Priority
9. **Virtual Scrolling**: For 1000+ tasks
10. **Undo/Redo**: Command pattern
11. **Keyboard Shortcuts**: Accessibility
12. **Export/Import**: JSON/CSV support

---

## Migration Path to Full-Stack App

### Phase 1: Frontend Framework
```
Current: Vanilla JS
Target: React / Vue / Svelte
```

**Steps**:
1. Convert cell builders to components
2. Use React hooks for state
3. Context API for global state
4. React Query for data fetching

### Phase 2: Backend API
```
Current: localStorage
Target: REST API + Database
```

**Endpoints**:
```
GET    /api/tasks
POST   /api/tasks
PUT    /api/tasks/:id
DELETE /api/tasks/:id
GET    /api/options/:type
POST   /api/options/:type
```

### Phase 3: Database Schema
```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY,
  name VARCHAR(255),
  description TEXT,
  deadline DATE,
  done BOOLEAN,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE TABLE status_options (
  id UUID PRIMARY KEY,
  name VARCHAR(100),
  color VARCHAR(7),
  sort_order INTEGER
);

CREATE TABLE task_statuses (
  task_id UUID REFERENCES tasks(id),
  status_id UUID REFERENCES status_options(id),
  PRIMARY KEY (task_id, status_id)
);

-- Similar for projects
```

---

## Testing Strategy

### Unit Tests
- Utility functions (formatDate, findOption)
- Filter logic
- Sort logic
- Migration functions

### Integration Tests
- Full render cycle
- CRUD operations
- Filter + sort combinations
- Drag-and-drop

### E2E Tests
- Create task workflow
- Edit task workflow
- Delete task workflow
- Tab navigation
- Column reordering

---

## Documentation Standards

Every function should include:
```javascript
/**
 * Brief description of what the function does
 * @param {Type} paramName - Parameter description
 * @returns {Type} Return value description
 * @example
 * functionName(exampleInput) // => exampleOutput
 */
```

This documentation is now partially applied to the codebase and serves as a guide for completing the documentation effort.
