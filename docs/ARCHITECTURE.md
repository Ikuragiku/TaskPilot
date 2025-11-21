# Architecture Details

This document provides a detailed breakdown of the Organize-me system architecture, including component responsibilities, data flow, and integration points.

## Frontend Architecture
- **Entry Point:** `main.tsx` bootstraps the React app.
- **Routing:** Managed by React Router v6 for page navigation and protected routes.
- **State Management:** Zustand store for authentication and UI state; TanStack Query for server state.
- **Components:** Modular, reusable components for dashboard, tabs, task table, dropdowns, and context menus.
- **Services:** API and WebSocket services for backend communication.
- **Persistence:** UI state (tabs, filters, sorts) stored in localStorage.

## Recent updates (v0.2.6)

- Grocery features have been migrated to a first-class `Grocery` domain in the database and fully separated from the Task domain. New Prisma models (e.g. `Grocery`, `GroceryCategory`, `GroceryCategoryAssignment`) and backend routes/services were added.
- The frontend now contains dedicated grocery hooks, components, and API clients (`useGroceries`, `useGroceryCategories`, `groceryApi`, `groceryCategoryApi`).
- Authentication schema was simplified to use `username` (replaces prior `email` usage).
- The frontend centralizes react-query keys and API paths to reduce brittle literal strings and improve cache invalidation.
- Optimistic UI updates were added for category deletion and other quick interactions to reduce visible flicker.

> Migration note: These schema changes are non-backwards-compatible with older databases. For development environments, a destructive reset and reseed is recommended (see README and `prisma/seed.ts`).

## Backend Architecture
- **Entry Point:** `server.ts` initializes Express server and Socket.io.
- **Controllers:** Handle business logic for authentication, tasks, options.
- **Routes:** RESTful endpoints for CRUD operations.
- **Services:** Encapsulate database access and external logic.
- **Middleware:** Authentication (JWT), error handling, request validation.
- **Database:** Prisma ORM models for users, tasks, projects, statuses.
- **WebSocket:** Socket.io for real-time updates (task/option changes).

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
