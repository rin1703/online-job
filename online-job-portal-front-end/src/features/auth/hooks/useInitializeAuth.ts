import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useGetMeQuery } from '@/features/auth/api/auth.service';
import { updateUser, initializeAuthFromStorage } from '@/features/auth/api/auth.slice';
import type { RootState } from '@/redux/store';

/**
 * Hook to initialize auth on app load
 * 1. Restores user from localStorage
 * 2. Fetches latest user data from server to sync role
 * 3. Updates Redux state if role changed
 */
export const useInitializeAuth = () => {
  const dispatch = useDispatch();
  const token = useSelector((state: RootState) => state.auth.token);
  const user = useSelector((state: RootState) => state.auth.user);

  // Fetch latest user data from server
  const { data: meData, isLoading, error } = useGetMeQuery(undefined, {
    // Skip query if no token
    skip: !token,
    // Refetch on focus to always get latest role
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  // Initialize auth from localStorage on mount
  useEffect(() => {
    dispatch(initializeAuthFromStorage());
  }, [dispatch]);

  // Update user in Redux if server returned new data
  useEffect(() => {
    if (meData?.data && token) {
      const serverUser = meData.data;

      // Check if role changed on server
      if (user && serverUser.role !== user.role) {
        console.log('[useInitializeAuth] Role changed detected:', {
          oldRole: user.role,
          newRole: serverUser.role,
        });
        dispatch(updateUser(serverUser));
      } else if (!user) {
        // If no user in Redux but have server data, set it
        console.log('[useInitializeAuth] Setting user from server:', {
          userId: serverUser.userId,
          role: serverUser.role,
        });
        dispatch(updateUser(serverUser));
      }
    }
  }, [meData, token, user, dispatch]);

  return {
    isLoading,
    error,
    user,
  };
};
