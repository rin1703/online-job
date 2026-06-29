// Custom hooks for accessing job state from Redux
import { useDispatch, useSelector } from 'react-redux';

import type { RootState } from '@/redux/store';

import {
  addRecentJob,
  clearFilters,
  clearRecentJobs,
  clearSavedJobs,
  setFilters,
  setSearchTerm,
  setSortBy,
  setViewMode,
  toggleSaveJob,
} from './job.slice';
import type { JobFilters } from './job.types';

/**
 * Hook to access and manage saved jobs
 */
export const useSavedJobs = () => {
  const dispatch = useDispatch();
  const savedJobs = useSelector((state: RootState) => state.job.savedJobs);

  return {
    savedJobs,
    toggleSaveJob: (jobId: string) => dispatch(toggleSaveJob(jobId)),
    isSaved: (jobId: string) => savedJobs.has(jobId),
    clearAll: () => dispatch(clearSavedJobs()),
    count: savedJobs.size,
  };
};

/**
 * Hook to access recently viewed jobs
 */
export const useRecentJobs = () => {
  const dispatch = useDispatch();
  const recentJobs = useSelector((state: RootState) => state.job.recentJobs);

  return {
    recentJobs,
    addRecentJob: (jobId: string) => dispatch(addRecentJob(jobId)),
    clearAll: () => dispatch(clearRecentJobs()),
  };
};

/**
 * Hook to access and manage job filters
 */
export const useJobFilters = () => {
  const dispatch = useDispatch();
  const filters = useSelector((state: RootState) => state.job.filters);

  return {
    filters,
    setFilters: (newFilters: Partial<JobFilters>) => dispatch(setFilters(newFilters)),
    clearFilters: () => dispatch(clearFilters()),
  };
};

/**
 * Hook to access and manage view preferences
 */
export const useJobViewPreferences = () => {
  const dispatch = useDispatch();
  const viewMode = useSelector((state: RootState) => state.job.viewMode);
  const sortBy = useSelector((state: RootState) => state.job.sortBy);

  return {
    viewMode,
    sortBy,
    setViewMode: (mode: 'list' | 'grid') => dispatch(setViewMode(mode)),
    setSortBy: (sort: string) => dispatch(setSortBy(sort)),
  };
};

/**
 * Hook to access and manage search term
 */
export const useJobSearch = () => {
  const dispatch = useDispatch();
  const searchTerm = useSelector((state: RootState) => state.job.searchTerm);

  return {
    searchTerm,
    setSearchTerm: (term: string) => dispatch(setSearchTerm(term)),
  };
};
