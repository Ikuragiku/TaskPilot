# System Overview

Organize-me is a full-stack productivity dashboard designed to help users manage tasks, projects, and statuses efficiently. The system is built with a modular architecture, separating concerns between frontend, backend, and database layers for scalability and maintainability.

## Main Features
- Task, project, and status management
- Real-time updates via WebSocket
- Authentication and user management
- Persistent UI state
- Advanced filtering, sorting, and searching

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

## Recent changes (v0.2.6)

- Grocery domain migrated to the database and is now represented by dedicated models and APIs; the Grocery UI is separated from the Task dashboard.
- Backend schema change: authentication now uses `username` instead of `email`; this required a reseed for development environments.
- Frontend improvements: centralized API path and query key constants, tighter TypeScript typings, and improved optimistic update patterns to reduce UI flicker.

See `docs/ARCHITECTURE.md` and the top of `README.md` for migration and upgrade instructions.

## Data Flow
1. User interacts with the React UI.
2. Frontend sends REST API requests or WebSocket events to the backend.
3. Backend processes requests, interacts with the database, and returns responses.
4. Real-time updates are pushed to clients via WebSocket.

## Technologies
- Frontend: React 18, TypeScript, Vite, Zustand, TanStack Query, React Router v6
- Backend: Node.js, Express, TypeScript, Prisma, PostgreSQL, Socket.io, JWT

## Folder Structure
- `frontend/` - React app, components, hooks, services, store, types, utils
- `backend/` - Express server, Prisma models, controllers, routes
- `docs/` - System and architecture documentation

---
See `architecture.md` for detailed component and data flow diagrams.
