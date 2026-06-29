/**
 * Custom hook to manage favorite jobs
 * Handles both authenticated (backend API) and guest (localStorage) users
 */

import { useCallback, useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';

import { useToggleFavoriteJobMutation } from '@/redux/features/jobs/jobApi';
import type { RootState } from '@/redux/store';

import { useSavedJobs } from './job.hooks';

export const useFavoriteJobs = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const isAuthenticated = !!user;

  // Backend mutation for authenticated users
  const [toggleFavoriteMutation, { isLoading: isTogglingFavorite }] =
    useToggleFavoriteJobMutation();

  // LocalStorage hook for guest users - this subscribes to Redux state
  const {
    savedJobs: localSavedJobs,
    toggleSaveJob: toggleLocalSave,
    isSaved: isLocalSaved,
  } = useSavedJobs();

  /**
   * Check if a job is favorited
   * Priority: localStorage/Redux (always check for UI state)
   * IMPORTANT: Depend on localSavedJobs Set directly to trigger re-renders
   */
  const isFavorite = useCallback(
    (jobId: string, jobIsFavorite?: boolean) => {
      // Check if job is in the Set
      const localState = localSavedJobs.has(jobId);

      console.log('[useFavoriteJobs.isFavorite] jobId:', jobId, 'localState:', localState, 'localSavedJobs size:', localSavedJobs.size);

      // For authenticated users, if local state differs from server, trust local
      // For guests, always use local
      return localState;
    },
    [localSavedJobs] // Depend on the Set object, not the function
  );

  /**
   * Toggle favorite status
   * Strategy: Update localStorage immediately for instant UI feedback,
   * then sync with backend for authenticated users
   */
  const toggleFavorite = useCallback(
    async (jobId: string) => {
      console.log('[useFavoriteJobs.toggleFavorite] START - jobId:', jobId, 'isAuthenticated:', isAuthenticated);

      // Check current state BEFORE toggling
      const wasSaved = isLocalSaved(jobId);
      const willBeSaved = !wasSaved;

      console.log('[useFavoriteJobs.toggleFavorite] wasSaved:', wasSaved, 'willBeSaved:', willBeSaved);

      // Update localStorage immediately for instant UI feedback
      toggleLocalSave(jobId);

      console.log('[useFavoriteJobs.toggleFavorite] After toggleLocalSave, savedJobs:', Array.from(localSavedJobs));

      if (isAuthenticated) {
        // Authenticated user - sync with backend
        try {
          console.log('[useFavoriteJobs.toggleFavorite] Calling API...');
          const result = await toggleFavoriteMutation(jobId).unwrap();
          console.log('[useFavoriteJobs.toggleFavorite] API result:', result);

          // Show success message
          if (result.data.isFavorite) {
            toast.success('Added to favorites');
          } else {
            toast.success('Removed from favorites');
          }

          // If backend result differs from local, sync it back
          if (result.data.isFavorite !== willBeSaved) {
            console.log('[useFavoriteJobs.toggleFavorite] Backend differs, syncing back');
            toggleLocalSave(jobId);
          }

          return result.data.isFavorite;
        } catch (error: any) {
          console.error('[useFavoriteJobs.toggleFavorite] API error:', error);
          toast.error(error?.data?.message || 'Failed to sync with server');
          // Local state already updated, keep it
          return willBeSaved;
        }
      } else {
        // Guest user - localStorage only
        console.log('[useFavoriteJobs.toggleFavorite] Guest user - localStorage only');
        if (willBeSaved) {
          toast.info('Sign in to sync favorites across devices');
        }
        return willBeSaved;
      }
    },
    [isAuthenticated, toggleFavoriteMutation, toggleLocalSave, isLocalSaved, localSavedJobs]
  );

  /**
   * Get favorite job IDs from localStorage
   * Useful for syncing with backend after login
   */
  const getLocalFavorites = useCallback(() => {
    return Array.from(localSavedJobs);
  }, [localSavedJobs]);

  return {
    isFavorite,
    toggleFavorite,
    isTogglingFavorite,
    isAuthenticated,
    localFavoriteCount: localSavedJobs.size,
    getLocalFavorites,
  };
};
