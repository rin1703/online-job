import { Navigate, Outlet } from 'react-router-dom';

import { useAppSelector } from '@/hooks/redux';

/**
 * PrivateRoute Component
 * Protects routes that require authentication
 * Redirects to login page if user is not authenticated
 */
export const PrivateRoute = () => {
  // Check token from Redux state or localStorage
  const token = useAppSelector((state) => state.auth.token) || localStorage.getItem('token');

  if (!token) {
    // User is not authenticated, redirect to login
    return <Navigate to="/auth/sign-in" replace />;
  }

  // User is authenticated, render the protected route
  return <Outlet />;
};
