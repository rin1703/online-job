import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { Toaster } from 'sonner';

import { store } from '@/redux/store';
import { setCredentials, logout } from '@/features/auth/api/auth.slice';
import type { AuthUser } from '@/features/auth/api/auth.type';
import { decodeUserFromToken, isTokenExpired } from '@/lib/jwt';
import { useInitializeAuth } from '@/features/auth/hooks/useInitializeAuth';
import { useSyncUserRole } from '@/features/auth/hooks/useSyncUserRole';

/**
 * UserRoleSyncComponent
 * Syncs user role changes in real-time
 * Must be inside Redux Provider
 */
function UserRoleSyncComponent() {
  useSyncUserRole(true);
  return null;
}

/**
 * AuthInitializer Component
 * Loads token and user from localStorage on app mount
 * Automatically decodes JWT token to extract user information
 * Also fetches latest user data from server to sync role
 */
function AuthInitializer({ children }: { children: React.ReactNode }) {
  // Initialize auth from server
  useInitializeAuth();

  useEffect(() => {
    console.log('[AuthInitializer] Initializing authentication...');

    // Load token from localStorage
    const token = localStorage.getItem('token');

    if (!token) {
      console.log('[AuthInitializer] No token found, skipping initialization');
      return;
    }

    console.log('[AuthInitializer] Token found, validating...');

    // Check if token is expired
    if (isTokenExpired(token)) {
      console.warn('[AuthInitializer] Token is expired, logging out');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      store.dispatch(logout());
      return;
    }

    // Decode token to get user information
    const decodedUser = decodeUserFromToken(token);

    if (!decodedUser) {
      console.error('[AuthInitializer] Failed to decode token, clearing credentials');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      store.dispatch(logout());
      return;
    }

    console.log('[AuthInitializer] Token decoded successfully:', {
      userId: decodedUser.userId,
      email: decodedUser.email,
      role: decodedUser.role,
    });

    // Convert decoded token to AuthUser
    const user: AuthUser = decodedUser;

    // Update localStorage with fresh user data from token
    console.log('[AuthInitializer] Updating localStorage with decoded user');
    localStorage.setItem('user', JSON.stringify(user));

    // Dispatch to Redux store
    console.log('[AuthInitializer] Dispatching credentials to Redux store');
    store.dispatch(setCredentials({ token, user }));
    console.log('[AuthInitializer] Authentication initialization complete');
  }, []);

  return (
    <>
      <UserRoleSyncComponent />
      {children}
    </>
  );
}

function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AuthInitializer>
        {children}
        <Toaster position="top-right" />
      </AuthInitializer>
    </Provider>
  );
}

export default Providers;
