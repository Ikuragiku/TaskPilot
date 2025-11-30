# Architecture Details

This document provides a detailed breakdown of the Organize-me system architecture, including component responsibilities, data flow, and integration points.

## Frontend Architecture
- **Entry Point:** `main.tsx` bootstraps the React app.
- **Routing:** Managed by React Router v6 for page navigation and protected routes.
- **State Management:** Zustand store for authentication and UI state; TanStack Query for server state.
- **Components:** Modular, reusable components for dashboard, tabs, task table, dropdowns, and context menus.
- **Services:** API and WebSocket services for backend communication.
- **Persistence:** UI state (tabs, filters, sorts) stored in localStorage.

## Recent updates (v0.3.0)

### Recipes Domain
- **Backend**: New Prisma models (`Recipe`, `RecipeItem`, `RecipeCategory`, `RecipeCategoryAssignment`) with full CRUD endpoints.
- **Frontend**: Dedicated recipes dashboard (`RecipesDashboard.tsx`) with components for ingredient/step management, category assignment, and portions.
- **Features**: Multi-category assignment, drag-to-reorder items, inline editing, optimistic updates, and API sync with local fallback.
- **Integration**: Follows the same architectural patterns as Tasks and Groceries for consistency.

### Filter Inheritance
- New items (tasks, groceries, recipes) now automatically inherit active filters and tab context.
- When creating an item while viewing a filtered/tabbed view, the new item appears immediately in that view.
- Implemented by capturing active filters/tabs and passing relevant IDs (statusIds, projectIds, categoryIds, done) to create mutations.

### UI/UX Improvements
- **Favicon**: Custom SVG favicon with gradient checkmark design.
- **Dynamic titles**: Browser tab titles update per route (e.g., `TaskPilot | Tasks`).
- **Stale filter cleanup**: Deleting categories/options now removes them from active filters and tabs to prevent orphaned references.
- **Multi-sort availability**: "+ Add sort" button now always visible, enabling unlimited sort criteria.
- **Unified labels**: "Add Tab" dropdown uses generic wording instead of app-specific terms.

### Documentation
- All backend services, controllers, routes, and types have comprehensive JSDoc comments.
- All frontend recipe components, services, and utilities fully documented.
- Architecture and system overview docs updated with latest changes.

> Migration note: v0.3.0 schema changes are non-backwards-compatible. Reset and reseed for development environments (see README).

## Backend Architecture
- **Entry Point:** `server.ts` initializes Express server and Socket.io.
- **Controllers:** Handle business logic for authentication, tasks, groceries, recipes, and options.
- **Routes:** RESTful endpoints for CRUD operations:
  - `/api/auth` - Registration and login
  - `/api/tasks` - Task management
  - `/api/groceries` - Grocery management
  - `/api/recipes` - Recipe management
  - `/api/recipe-categories` - Recipe category management
  - `/api/grocery-categories` - Grocery category management
  - `/api/status-options` - Status option management
  - `/api/project-options` - Project option management
- **Services:** Encapsulate database access and business logic (taskService, groceryService, recipeService, optionService, socketService).
- **Middleware:** Authentication (JWT), error handling, request validation (Zod schemas).
- **Database:** Prisma ORM models for users, tasks, groceries, recipes, and their related entities.
- **WebSocket:** Socket.io for real-time updates (task/option changes, extensible for recipes/groceries).

## Data Flow Example
1. User creates a new task in the frontend.
2. Frontend sends POST `/api/tasks` to backend.
3. Backend validates, creates task in DB, emits `task:created` event via WebSocket.
4. All connected clients receive the update and refresh their task lists.

## Key Integration Points
- **API Service:** Handles all REST requests from frontend to backend.
- **Socket Service:** Listens and emits real-time events for collaborative updates.
- **Prisma Service:** Manages all database interactions.

## Security
- JWT-based authentication for API and WebSocket connections.
- Input validation and error handling throughout backend.

## Extensibility
- Modular codebase allows easy addition of new features (e.g., notifications, analytics).
- Clear separation of concerns for maintainability.

---
For further details, see code comments and the main README.
