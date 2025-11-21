/**
 * App Component
 *
 * Main entry point for the frontend React application.
 * Sets up routing, error boundaries, and React Query provider.
 */
import { BrowserRouter, useLocation, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LoginPage } from './components/LoginPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { TaskDashboard } from './components/task-dashboard/TaskDashboard';
import { GroceryDashboard } from './components/grocery-dashboard/GroceryDashboard';
import Hub from './components/hub/Hub';
import FadeRoute from './components/FadeRoute';
// Global styles are imported per-page to avoid conflicts

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

/**
 * Renders the application routes and providers.
 */
function AppRoutes() {
  const location = useLocation();
  return (
    <FadeRoute key={location.pathname}>
      <Routes location={location}>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Hub />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tasks"
          element={
            <ProtectedRoute>
              <TaskDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
        <Route
          path="/grocery"
          element={
            <ProtectedRoute>
              <GroceryDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />        
      </Routes>
    </FadeRoute>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
