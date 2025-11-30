# System Overview

TaskPilot is a full-stack productivity dashboard designed to help users manage tasks, groceries, and recipes efficiently. The system is built with a modular architecture, separating concerns between frontend, backend, and database layers for scalability and maintainability.

## Main Features
- **Multi-domain management**: Tasks, Groceries, and Recipes with dedicated dashboards
- **Unified UX patterns**: Shared tabs, filters, sorts, and search across all domains
- **Filter inheritance**: New items automatically inherit active filters/tabs for immediate visibility
- **Real-time updates**: WebSocket integration for collaborative editing
- **Authentication**: JWT-based user management
- **Persistent state**: UI preferences (tabs, filters, sorts) saved in localStorage
- **Advanced filtering & sorting**: Multi-criteria filtering and sorting with visual indicators
- **Drag-and-drop**: Reorder tabs, categories, ingredients, and recipe steps
- **Right-click actions**: Context menus for quick delete operations

## High-Level Architecture
```
+-------------------+      WebSocket      +-------------------+
|    Frontend       | <----------------> |     Backend       |
|  (React, Vite)    |      REST API       | (Node, Express)   |
+-------------------+ <----------------> +-------------------+
                                      |
                                      v
                              +-------------------+
                              |   PostgreSQL DB   |
                              +-------------------+
```
- **Frontend:** Handles UI, state management, and API/WebSocket communication.
- **Backend:** Manages business logic, authentication, and database access.
- **Database:** Stores all persistent data (users, tasks, projects, statuses).

## Recent changes (v0.3.0)

### Recipes Dashboard
- New dedicated workspace for managing recipes with ingredients, cooking steps, portions, and categories.
- Backend: Separate Prisma models (`Recipe`, `RecipeItem`, `RecipeCategory`) with full CRUD API.
- Frontend: Complete recipes UI with ingredient/step editors, multi-category assignment, drag-reorder, and optimistic updates.

### Filter Inheritance
- Creating new items (tasks, groceries, recipes) while filters/tabs are active now automatically assigns those filters to the new item.
- Ensures new items appear immediately in the current filtered view without manual reassignment.

### UI/UX Enhancements
- Custom favicon with gradient checkmark design
- Dynamic browser tab titles per route (TaskPilot | Home, TaskPilot | Tasks, etc.)
- Stale filter cleanup: Deleted categories/options removed from active filters and tabs
- Multi-sort always available via "+ Add sort" button
- Unified "Add Tab" dropdown labels across all dashboards
- Hub tile routing normalized to prevent broken navigation
 - Smart quantity merging for groceries: sums numeric amounts and converts kg↔g, l↔ml; non-numeric amounts concatenate for clarity

### Documentation
- Comprehensive JSDoc comments added to all backend services, controllers, routes, and types
- All frontend recipe components, services, and utilities fully documented
- Architecture and system overview documentation updated

See `docs/ARCHITECTURE.md` and the top of `README.md` for migration and upgrade instructions.

## Data Flow
1. User interacts with the React UI (Tasks, Groceries, or Recipes dashboard).
2. Frontend sends REST API requests to the backend.
3. Backend validates requests (Zod schemas), processes business logic in services.
4. Prisma ORM interacts with PostgreSQL database.
5. Backend returns responses; optimistic UI updates provide immediate feedback.
6. Real-time updates are pushed to connected clients via WebSocket (currently for tasks/options, extensible to recipes/groceries).

## Example: Creating a Recipe with Inherited Filters
1. User is viewing "Desserts" tab with "Vegetarian" category filter active.
2. User clicks "+ Add recipe" in toolbar.
3. Frontend captures active tab and filters, includes them in create payload.
4. Recipe created with `categoryIds: ["desserts-id", "vegetarian-id"]`.
5. New recipe immediately visible in current filtered view.
6. Background API call syncs to database; on success, recipe persists.

## Technologies
- Frontend: React 18, TypeScript, Vite, Zustand, TanStack Query, React Router v6
- Backend: Node.js, Express, TypeScript, Prisma, PostgreSQL, Socket.io, JWT

## Folder Structure
- `frontend/` - React app, components, hooks, services, store, types, utils
- `backend/` - Express server, Prisma models, controllers, routes
- `docs/` - System and architecture documentation

---
See `architecture.md` for detailed component and data flow diagrams.
