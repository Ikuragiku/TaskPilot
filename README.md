# TaskPilot

**Version:** v0.3.0

## What's new in v0.3.0
- **Recipes dashboard**: New dedicated workspace for managing recipes with ingredients, steps, portions, and categories.
- **Filter inheritance**: New items (tasks, groceries, recipes) now inherit active filters/tabs for immediate visibility.
- **Favicon & dynamic titles**: Custom favicon added; browser tab titles update per route (TaskPilot | Tasks, TaskPilot | Groceries, etc.).
- **UI refinements**: Removed duplicate add buttons; unified "Add Tab" dropdown labels; multi-sort always available.
- **Smart quantity merging**: Grocery quantities merge intelligently (kg↔g, l↔ml conversions; numeric unit sums; non-numeric values concatenate).
- **Stale filter cleanup**: Deleted categories/options are automatically removed from active filters and tabs.
- **Comprehensive documentation**: All backend services, controllers, and frontend components now have JSDoc comments.
- **Hub normalization**: Groceries tile always links to `/groceries` regardless of title edits.

### Previous releases
**v0.2.6:**
- Grocery domain migrated to database with dedicated models and API.
- Backend authentication switched to `username` (from `email`).
- Optimistic UI updates for smoother interactions.

> Note: The database schema changed in v0.3.0. Reset and reseed your local DB (see Migration section below).

TaskPilot is a full-stack productivity dashboard for managing tasks, groceries, and recipes. It features a modern React frontend and a robust Node/Express backend with PostgreSQL and Prisma.

## Features
- **Tasks**: Manage tasks with projects, statuses, deadlines, and descriptions
- **Groceries**: Track grocery items with categories and quantities
- **Recipes**: Store recipes with ingredients, cooking steps, portions, and categories
- **Unified UX**: All dashboards share tabs, filters, sorts, and search functionality
- **Filter inheritance**: New items automatically adopt active filters for immediate visibility
- **Drag-and-drop**: Reorder tabs and categories with intuitive drag interactions
- **Right-click actions**: Context menus for quick delete operations
- **Real-time updates**: WebSocket integration for collaborative editing
- **Authentication**: JWT-based user management
- **Persistent state**: UI preferences saved in localStorage

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
All major files are documented with JSDoc comments for easy onboarding and maintainability:
- Backend: Services, controllers, routes, and types fully documented
- Frontend: All recipe components, services, and utilities documented
- Architecture diagrams and system overview in `docs/`

## Migration & Upgrade Notes

### Upgrading to v0.3.0
After pulling v0.3.0, run the following in `backend` to reset and reseed your local development DB (this is destructive):

```powershell
cd backend
npx prisma migrate reset --force
npx prisma generate
npm run prisma:seed
```

The seed script creates:
- A test user (`testuser` / `password123`)
- Default status and project options
- Sample grocery categories and items
- Sample recipe categories and recipes with ingredients/steps

**Important**: This will delete all existing data. If you need to preserve data, export it before resetting or perform a careful manual migration.

## License
MIT
