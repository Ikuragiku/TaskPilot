/**
 * ProtectedRoute Component
 *
 * Restricts access to child routes unless the user is authenticated.
 * Redirects unauthenticated users to the login page.
 */
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Wrapper for protected routes. Checks authentication before rendering children.
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
