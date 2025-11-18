# Application Architecture Diagram

## Overview
This document provides a visual understanding of how the TaskPilot application is structured and how data flows through the system.

---

## Component Hierarchy

```
┌──────────────────────────────────────────────────────────┐
│                      INDEX.HTML                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │                  Header Bar                        │  │
│  │  [+ Add] [Filter] [Sort] [Search Field]          │  │
│  └────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────┐  │
│  │                  Tabs Row                          │  │
│  │  [All Tasks] [Project 1] [Project 2] [+]         │  │
│  └────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────┐  │
│  │              Active Filters/Sorts                  │  │
│  │  [Status: Doing ×] [Sort: 1 Name ↑]              │  │
│  └────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────┐  │
│  │                  Tasks Table                       │  │
│  │  ┌──┬─────────┬─────────────┬────────┬──────────┐ │  │
│  │  │✓ │ Name    │ Description │ Status │ Deadline │ │  │
│  │  ├──┼─────────┼─────────────┼────────┼──────────┤ │  │
│  │  │  │ Task 1  │ Details...  │ [Done] │ 2024-01  │ │  │
│  │  │  │ Task 2  │ Details...  │ [Doing]│ 2024-02  │ │  │
│  │  │  │         │             │        │          │ │  │
│  │  │  │         [+ Add Task]                       │ │  │
│  │  └──┴─────────┴─────────────┴────────┴──────────┘ │  │
│  └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

---

## Data Flow Architecture

```
┌─────────────┐
│   User      │
│  Actions    │
└──────┬──────┘
       │
       ▼
┌──────────────────────────────────────────┐
│         Event Handlers                   │
│  • Click events (delegation)             │
│  • Input events (contenteditable)        │
│  • Drag events (column reorder)          │
│  • Context menu (right-click)            │
└──────┬───────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────┐
│        Business Logic                    │
│  • Filter tasks                          │
│  • Sort tasks                            │
│  • CRUD operations                       │
│  • Option management                     │
└──────┬───────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────┐
│         State Update                     │
│  • Modify tasks[]                        │
│  • Update statusOptions[]                │
│  • Change activeFilters{}                │
│  • Adjust columnOrder[]                  │
└──────┬───────────────────────────────────┘
       │
       ├─────────────┬─────────────┐
       │             │             │
       ▼             ▼             ▼
┌─────────────┐ ┌─────────┐ ┌─────────────┐
│ LocalStorage│ │ Render  │ │   Console   │
│   Persist   │ │   DOM   │ │  (Logging)  │
└─────────────┘ └─────────┘ └─────────────┘
```

---

## State Management

```
┌──────────────────────────────────────────────────────┐
│              Application State                       │
├──────────────────────────────────────────────────────┤
│                                                      │
│  ┌─────────────────┐  ┌──────────────────┐         │
│  │   tasks []      │  │  statusOptions[] │         │
│  │  - id           │  │  - name          │         │
│  │  - name         │  │  - color         │         │
│  │  - description  │  │                  │         │
│  │  - status []    │  │  projectOptions[]│         │
│  │  - project []   │  │  - name          │         │
│  │  - deadline     │  │  - color         │         │
│  │  - done         │  └──────────────────┘         │
│  └─────────────────┘                                │
│                                                      │
│  ┌─────────────────┐  ┌──────────────────┐         │
│  │ activeFilters{} │  │  activeSorts []  │         │
│  │  - status []    │  │  - field         │         │
│  │  - project []   │  │  - dir (asc/desc)│         │
│  │  - done (t/f/a) │  │  - priority      │         │
│  └─────────────────┘  └──────────────────┘         │
│                                                      │
│  ┌─────────────────┐  ┌──────────────────┐         │
│  │ columnOrder []  │  │  tabs []         │         │
│  │  - "done"       │  │  - name          │         │
│  │  - "name"       │  │  - project       │         │
│  │  - "status"     │  └──────────────────┘         │
│  │  - ...          │                                │
│  └─────────────────┘                                │
│                                                      │
│  ┌─────────────────────────────────────────┐        │
│  │  DOM References (cached)                │        │
│  │  - tbody, thead, search, filterBtn...  │        │
│  └─────────────────────────────────────────┘        │
└──────────────────────────────────────────────────────┘
```

---

## Rendering Pipeline

```
render()
  │
  ├─► filterTasks(search.value)
  │     │
  │     ├─► Filter by tab (All/Project)
  │     ├─► Filter by status (activeFilters)
  │     ├─► Filter by project (activeFilters)
  │     ├─► Filter by done state
  │     └─► Filter by search query
  │
  ├─► Apply activeSorts
  │     │
  │     └─► Multi-field sort with priority
  │
  ├─► Clear tbody
  │
  ├─► For each filtered task:
  │     │
  │     └─► taskRow(t)
  │           │
  │           └─► For each column:
  │                 │
  │                 └─► buildCell(col, t)
  │                       │
  │                       ├─► if "done" → checkbox
  │                       ├─► if "name" → editable
  │                       ├─► if "status" → badges
  │                       ├─► if "project" → badges
  │                       └─► if "deadline" → date
  │
  └─► Append "+ Add Task" row
```

---

## Event Flow Examples

### Example 1: Creating a New Task
```
User clicks [+ Add Task]
  │
  ▼
addRowBtn click handler
  │
  ├─► Create new task object
  │     { id: uid(), name: '', status: [], ... }
  │
  ├─► tasks.push(newTask)
  │
  ├─► save() to localStorage
  │
  └─► render()
        │
        └─► Focus on new task name field
```

### Example 2: Editing Task Status
```
User clicks status badge
  │
  ▼
tbody click handler (event delegation)
  │
  ├─► Check if target is .badge
  │
  ├─► Extract task ID from row
  │
  └─► openDropdown(cell, 'status', currentArray, onPick)
        │
        ├─► Show dropdown menu
        │     • Checkboxes for each status
        │     • Add new option
        │     • Edit/delete options
        │
        └─► onPick(selectedArray)
              │
              ├─► tasks[idx].status = selectedArray
              │
              ├─► save()
              │
              └─► render()
```

### Example 3: Filtering Tasks
```
User clicks [Filter]
  │
  ▼
openFilterMenu(filterBtn)
  │
  ├─► Show filter dropdown
  │     • Status checkboxes
  │     • Project checkboxes
  │     • Done state radios
  │
  └─► User selects filters
        │
        ├─► activeFilters = { status: [...], project: [...] }
        │
        ├─► saveFilters()
        │
        ├─► render()
        │
        └─► renderChips()
              │
              └─► Show active filter chips
```

### Example 4: Column Reordering
```
User drags column header
  │
  ▼
dragstart event
  │
  ├─► Store dragged column index
  │
  └─► User drops on another header
        │
        ▼
      drop event
        │
        ├─► Get drop target index
        │
        ├─► Swap array elements
        │     [columnOrder[from], columnOrder[to]] = 
        │     [columnOrder[to], columnOrder[from]]
        │
        ├─► saveColumns()
        │
        └─► render()
              │
              └─► renderHeader()
                    │
                    └─► Table redrawn with new order
```

---

## LocalStorage Schema

```
┌─────────────────────────────────────────────┐
│           localStorage Keys                 │
├─────────────────────────────────────────────┤
│                                             │
│  organize-tasks                             │
│    └─► Array<Task>                          │
│        [{ id, name, description, ... }]     │
│                                             │
│  organize-options                           │
│    └─► { status: [], project: [] }         │
│                                             │
│  organize-columns                           │
│    └─► ["done", "name", "status", ...]     │
│                                             │
│  organize-tabs                              │
│    └─► [{ name: "All Tasks", ... }]        │
│                                             │
│  organize-filters                           │
│    └─► { status: [], project: [], done }   │
│                                             │
│  organize-sorts                             │
│    └─► [{ field, dir, priority }]          │
│                                             │
└─────────────────────────────────────────────┘
```

---

## Module Dependency Graph

```
                    ┌──────────┐
                    │  app.js  │
                    │  (Main)  │
                    └────┬─────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
         ▼               ▼               ▼
    ┌─────────┐    ┌──────────┐   ┌──────────┐
    │Constants│    │ DOM Refs │   │  State   │
    └────┬────┘    └─────┬────┘   └────┬─────┘
         │               │              │
         └───────┬───────┴──────┬───────┘
                 │              │
                 ▼              ▼
         ┌─────────────┐  ┌─────────────┐
         │  Utilities  │  │ LocalStorage│
         │  - uid()    │  │  - load()   │
         │  - format() │  │  - save()   │
         └──────┬──────┘  └──────┬──────┘
                │                │
                └────────┬───────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
         ▼               ▼               ▼
    ┌─────────┐    ┌──────────┐   ┌──────────┐
    │  Cell   │    │ Filtering│   │ Rendering│
    │Builders │    │ & Sorting│   │ Functions│
    └────┬────┘    └─────┬────┘   └────┬─────┘
         │               │              │
         └───────┬───────┴──────┬───────┘
                 │              │
                 ▼              ▼
         ┌─────────────┐  ┌─────────────┐
         │   Events    │  │  Dropdowns  │
         │  Handlers   │  │   Menus     │
         └─────────────┘  └─────────────┘
```

---

## Future Architecture (Full-Stack)

```
┌──────────────────────────────────────────────────┐
│                  Frontend (React)                │
│  ┌────────────┐  ┌────────────┐  ┌───────────┐  │
│  │ Components │  │   Hooks    │  │  Context  │  │
│  │  - TaskRow │  │ - useTasks │  │  - Auth   │  │
│  │  - Filter  │  │ - useAuth  │  │  - Theme  │  │
│  │  - Table   │  └────────────┘  └───────────┘  │
│  └────────────┘                                  │
└────────────┬─────────────────────────────────────┘
             │
             ├─► HTTP Requests (fetch/axios)
             │
┌────────────▼─────────────────────────────────────┐
│              Backend (Node.js/Express)           │
│  ┌────────────┐  ┌────────────┐  ┌───────────┐  │
│  │   Routes   │  │Controllers │  │  Services │  │
│  │ /api/tasks │  │  - CRUD    │  │  - Auth   │  │
│  │ /api/auth  │  │  - Filter  │  │  - Email  │  │
│  └────────────┘  └────────────┘  └───────────┘  │
└────────────┬─────────────────────────────────────┘
             │
             ├─► Database Queries (SQL)
             │
┌────────────▼─────────────────────────────────────┐
│            Database (PostgreSQL)                 │
│  ┌────────────┐  ┌────────────┐  ┌───────────┐  │
│  │   tasks    │  │   users    │  │  options  │  │
│  │            │  │            │  │           │  │
│  │ task_tags  │  │ user_roles │  │  tags     │  │
│  └────────────┘  └────────────┘  └───────────┘  │
└──────────────────────────────────────────────────┘
```

---

## Performance Considerations

### Current Optimizations
```
✓ Event Delegation
  └─► Single tbody listener instead of per-row

✓ DOM Caching
  └─► Select elements once, reuse references

✓ Fixed Table Layout
  └─► CSS: table-layout: fixed (no reflow)

✓ Early Returns
  └─► Exit loops/functions as soon as possible
```

### Future Optimizations
```
○ Virtual Scrolling
  └─► Only render visible rows (1000+ tasks)

○ Debounced Search
  └─► Wait 300ms before filtering

○ Web Workers
  └─► Move filtering/sorting to background thread

○ IndexedDB
  └─► Better than localStorage for large datasets

○ Service Worker
  └─► Offline support, background sync
```

---

This architecture documentation provides a comprehensive overview of how the application is structured and how to extend it for future development.
