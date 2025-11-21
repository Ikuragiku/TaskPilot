# Organize-me

-**Version:** v0.2.6

## What's new in v0.2.6
- Grocery domain migrated to the database and fully decoupled from Tasks (new Prisma models).
- Frontend: Grocery UI split from TaskDashboard and uses dedicated hooks/services (`useGroceries`, `groceryApi`).
- Backend: Prisma schema updated; authentication now uses `username` instead of `email`.
- Centralized frontend react-query keys and API path constants for more predictable cache behavior.
- Optimistic UI updates for category deletions and immediate cache updates after edits.

> Note: The database schema changed in this release. If you have an existing local DB you will need to reset and reseed it (see `backend/prisma/seed.ts` and the `docs` section below).

Organize-me is a full-stack productivity dashboard for managing tasks, projects, and statuses. It features a modern React frontend and a robust Node/Express backend with PostgreSQL and Prisma.

## Features
- Task, project, and status management
- Drag-and-drop tabs and custom context menus
- Filter, sort, and search tasks
- Real-time updates via WebSocket
- Authentication and user management
- Persistent UI state (localStorage)

## Technologies
- **Frontend:** React 18, TypeScript, Vite, Zustand, TanStack Query, React Router v6
- **Backend:** Node.js, Express, TypeScript, Prisma, PostgreSQL, Socket.io, JWT

## Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL

### Installation
1. Clone the repository:
   ```powershell
   git clone https://github.com/yourusername/Organize-me.git
   cd Organize-me
   ```
2. Install dependencies for both frontend and backend:
   ```powershell
   cd backend
   npm install
   cd ../frontend
   npm install
   ```
3. Set up environment variables:
   - Copy `.env.example` to `.env` in both `backend` and `frontend` folders and update values as needed.
4. Run database migrations:
   ```powershell
   cd backend
   npx prisma migrate deploy
   ```

### Running the App
Use the provided script to start all services:
```powershell
./start-all-services.ps1
```
Or start manually:
- Backend: `cd backend; npm run dev`
- Frontend: `cd frontend; npm run dev`

### Usage
- Access the app at `http://localhost:5173` (default Vite port)
- Register or log in to start organizing your tasks and projects

## Project Structure
- `backend/` - Express server, Prisma models, controllers, routes
- `frontend/` - React app, components, hooks, services, store, types, utils
- `start-all-services.ps1` - PowerShell script to start both frontend and backend

## Documentation
All major files are documented with top-level and function comments for easy onboarding and maintainability.

Migration & Upgrade Notes
- After pulling v0.2.6, run the following in `backend` to reset and reseed a local development DB (this is destructive):

```powershell
npx prisma migrate reset --force
npx prisma generate
npm run prisma:seed
```

If you need to preserve data, perform a careful migration or export your data before resetting.

## License
MIT
