import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useGetMeQuery } from '@/features/auth/api/auth.service';
import { updateUser } from '@/features/auth/api/auth.slice';

/**
 * Hook to sync user role changes from server
 * Refetches user data when:
 * - App regains focus (tab is focused)
 * - Connection is restored
 * - Component mounts
 * 
 * This ensures role changes made in MongoDB are reflected in the UI
 */
export const useSyncUserRole = (enabled: boolean = true) => {
  const dispatch = useDispatch();
  
  // Refetch on focus and reconnect
  const { data: meData, refetch } = useGetMeQuery(undefined, {
    skip: !enabled,
    refetchOnFocus: true,
    refetchOnReconnect: true,
    pollingInterval: 0, // No polling, only on-demand
  });

  // Listen for focus events to manually refetch
  useEffect(() => {
    if (!enabled) return;

    const handleFocus = () => {
      console.log('[useSyncUserRole] Window focused, syncing user role...');
      refetch();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [enabled, refetch]);

  // Update user when new data arrives
  useEffect(() => {
    if (meData?.data) {
      dispatch(updateUser(meData.data));
    }
  }, [meData, dispatch]);

  return { refetch };
};
