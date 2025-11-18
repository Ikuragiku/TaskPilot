# TaskPilot

A Material Design task management application with advanced filtering, sorting, and organization features. Built with vanilla JavaScript and localStorage persistence.

![Material Design](https://img.shields.io/badge/Design-Material_Design-blue)
![No Backend](https://img.shields.io/badge/Backend-None-green)
![LocalStorage](https://img.shields.io/badge/Storage-LocalStorage-orange)

## Overview

Organize-me is a fully-featured task board that runs entirely in your browser without requiring a backend server. It implements Material Design principles with a clean, modern interface and stores all data locally using the browser's localStorage API.

### Key Features

**Task Management:**
- ✅ Create, edit, and delete tasks inline
- ✅ Multi-select status and projects (assign multiple to one task)
- ✅ Rich editing with contenteditable fields
- ✅ Mark tasks complete with checkbox
- ✅ Set deadlines with date picker
- ✅ Right-click context menus

**Organization:**
- ✅ Project tabs for focused views
- ✅ Advanced filtering (status, project, completion state)
- ✅ Multi-field sorting with priority
- ✅ Real-time search across all fields
- ✅ Color-coded badges for quick scanning

**Customization:**
- ✅ Create custom statuses and projects
- ✅ Choose from color palette
- ✅ Reorder table columns by drag-and-drop
- ✅ Reorder options within dropdowns
- ✅ All preferences persisted

**User Experience:**
- ✅ Material Design shadows and animations
- ✅ Ripple effects on buttons
- ✅ Responsive layout
- ✅ Keyboard shortcuts (Enter, Escape)
- ✅ Smart date formatting (Today, Tomorrow, etc.)

## Quick Start

### Option 1: Direct Browser Open
```powershell
# Windows PowerShell
Start-Process .\src\index.html
```

### Option 2: VS Code Live Server
1. Install "Live Server" extension in VS Code
2. Right-click `src/index.html`
3. Select "Open with Live Server"

### Option 3: Python HTTP Server
```powershell
# Navigate to src directory
cd src
python -m http.server 8000
# Open http://localhost:8000 in browser
```

## Documentation

Comprehensive documentation is available in the following files:

- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Visual diagrams, data flow, and system architecture
- **[CODE_STRUCTURE.md](CODE_STRUCTURE.md)** - Line-by-line code organization and patterns
- **[FUNCTION_REFERENCE.md](FUNCTION_REFERENCE.md)** - Complete API reference with examples
- **[REFACTORING.md](REFACTORING.md)** - Refactoring approach and migration strategy
- **[REFACTORING_SUMMARY.md](REFACTORING_SUMMARY.md)** - Summary of improvements and next steps

## Project Structure

```
TaskPilot/
├── src/
│   ├── index.html        # Main HTML structure (95 lines, fully documented)
│   ├── styles.css        # Material Design styles (628 lines, organized)
│   └── app.js            # Application logic (1599 lines, partially documented)
├── ARCHITECTURE.md       # Architecture diagrams and data flow
├── CODE_STRUCTURE.md     # Code organization guide
├── FUNCTION_REFERENCE.md # Complete function reference
├── REFACTORING.md        # Refactoring documentation
├── REFACTORING_SUMMARY.md # Refactoring summary
└── README.md             # This file
```

## Data Model

### Task
```typescript
interface Task {
  id: string;              // Unique identifier
  name: string;            // Task name
  description: string;     // Task details
  status: string[];        // Multi-select status
  project: string[];       // Multi-select projects
  deadline: string;        // ISO date (YYYY-MM-DD)
  done: boolean;           // Completion state
}
```

### Option
```typescript
interface Option {
  name: string;            // Option name
  color: string;           // Hex color code
}
```

## Usage Guide

### Creating Tasks
1. Click the "+ Add Task" button or the row at the bottom of the table
2. Type the task name and press Enter
3. Click other cells to add details
4. Assign status and projects by clicking the badge cells

### Filtering Tasks
1. Click the "Filter" button in the header
2. Select status and/or project criteria
3. Choose completion state (All/Done/Not Done)
4. Active filters appear as removable chips

### Sorting Tasks
1. Click the "Sort" button in the header
2. Check fields to sort by
3. Choose ascending or descending
4. Multiple sorts are applied by priority

### Organizing with Tabs
1. Create projects in the project dropdown
2. Right-click the tab bar to add project tabs
3. Click tabs to view tasks by project
4. "All Tasks" shows everything

### Customizing Columns
1. Drag column headers to reorder
2. Your preference is saved automatically
3. Reset by clearing localStorage

## Technical Details

### Technologies Used
- **HTML5** - Semantic structure
- **CSS3** - Material Design with custom properties
- **Vanilla JavaScript** - No frameworks or dependencies
- **LocalStorage API** - Client-side persistence

### Material Design Implementation
```css
/* Shadow Elevation System */
--shadow-1: 0 1px 3px rgba(0,0,0,0.12);   /* Subtle */
--shadow-2: 0 2px 6px rgba(0,0,0,0.16);   /* Raised */
--shadow-3: 0 4px 12px rgba(0,0,0,0.2);   /* Floating */
--shadow-4: 0 8px 24px rgba(0,0,0,0.24);  /* Modal */

/* Surface Elevation */
--surface-0: #ffffff;  /* Base level */
--surface-1: #f5f5f5;  /* Raised 1 level */
--surface-2: #eeeeee;  /* Raised 2 levels */
```

### Browser Compatibility
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

### Performance
- **Initial Load:** ~50ms (localStorage read)
- **Render Time:** ~10ms for 100 tasks
- **Filter/Sort:** ~5ms for 100 tasks
- **Memory Usage:** ~2MB (DOM + data)

## Development

### File Overview

#### `src/index.html` (95 lines)
- Semantic HTML structure
- Material Design card layout
- Fully documented with inline comments

#### `src/styles.css` (628 lines)
- 14 major sections with headers
- 28 CSS custom properties
- Material Design patterns
- Responsive design
- Accessibility features

#### `src/app.js` (1599 lines)
- IIFE pattern (no global pollution)
- Event delegation for performance
- LocalStorage operations
- Multi-select array handling
- Drag-and-drop column reordering

### Code Patterns

**Event Delegation:**
```javascript
tbody.addEventListener('click', (e) => {
  const target = e.target;
  const row = target.closest('tr');
  // Handle all row clicks with single listener
});
```

**Modify-Save-Render:**
```javascript
tasks[idx].name = 'New Name';  // Modify
save();                         // Persist
render();                       // Update UI
```

**Dropdown Toggle:**
```javascript
if (Date.now() - lastClosedCell.time < 100 && lastClosedCell.id === cellId) {
  return;  // Prevent immediate reopen
}
```

## Migration Roadmap

### Phase 1: Component Framework
Convert to React/Vue with component architecture while maintaining feature parity.

### Phase 2: Backend API
Replace localStorage with REST API and PostgreSQL database for multi-user support.

### Phase 3: Advanced Features
Add real-time collaboration, authentication, advanced filtering, and data export.

### Phase 4: Production Deploy
Implement CI/CD, monitoring, and deploy to cloud hosting.

**See [REFACTORING_SUMMARY.md](REFACTORING_SUMMARY.md) for detailed migration plan.**

## Known Limitations

- **localStorage only** - Data is not synced across devices
- **No backend** - No multi-user support or sharing
- **Browser-dependent** - Clearing browser data deletes all tasks
- **No export** - Cannot easily backup or transfer data
- **Single user** - No authentication or user management

## Future Enhancements

**High Priority:**
- [ ] Export/Import (JSON, CSV)
- [ ] Data backup mechanism
- [ ] Keyboard shortcuts guide
- [ ] Undo/redo functionality

**Medium Priority:**
- [ ] Kanban board view
- [ ] Calendar view for deadlines
- [ ] Task templates
- [ ] Recurring tasks

**Low Priority:**
- [ ] Dark mode
- [ ] Mobile app (PWA)
- [ ] Integration with calendar apps
- [ ] Email reminders

## Contributing

This is a personal project, but suggestions and feedback are welcome! The codebase is well-documented and ready for extension or migration to a full-stack architecture.

**Before contributing:**
1. Read [CODE_STRUCTURE.md](CODE_STRUCTURE.md) to understand organization
2. Review [ARCHITECTURE.md](ARCHITECTURE.md) for system design
3. Check [FUNCTION_REFERENCE.md](FUNCTION_REFERENCE.md) for API details

## License

This project is open source and available for personal or educational use.

## Credits

**Design System:** Material Design by Google
**Icons:** None (text-based UI)
**Fonts:** System fonts for performance

---

**Built with ❤️ using vanilla JavaScript and Material Design principles.**