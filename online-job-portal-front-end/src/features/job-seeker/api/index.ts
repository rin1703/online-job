// Export all job-related Redux functionality from a single entry point

// Types
export type { JobFilters, JobState } from './job.types';
export { initialJobFilters, initialJobState } from './job.types';

// Actions
export {
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

// Reducer (default export from slice)
export { default as jobReducer } from './job.slice';

// Custom Hooks
export {
  useJobFilters,
  useJobSearch,
  useJobViewPreferences,
  useRecentJobs,
  useSavedJobs,
} from './job.hooks';
