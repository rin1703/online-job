import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { JobFilters, JobState } from './job.types';

// Helper functions for localStorage
const STORAGE_KEYS = {
  SAVED_JOBS: 'job_savedJobs',
  RECENT_JOBS: 'job_recentJobs',
  VIEW_MODE: 'job_viewMode',
  SORT_BY: 'job_sortBy',
};

const loadFromLocalStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
};

const saveToLocalStorage = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Failed to save ${key} to localStorage:`, error);
  }
};

// Initialize state from localStorage
const initialState: JobState = {
  savedJobs: new Set(loadFromLocalStorage<string[]>(STORAGE_KEYS.SAVED_JOBS, [])),
  recentJobs: loadFromLocalStorage<string[]>(STORAGE_KEYS.RECENT_JOBS, []),
  filters: {
    industry: [],
    location: [],
    experience: [],
    level: [],
    salary: { min: 0, max: 100000000 },
    workType: [],
  },
  searchTerm: '',
  viewMode: loadFromLocalStorage<'list' | 'grid'>(STORAGE_KEYS.VIEW_MODE, 'list'),
  sortBy: loadFromLocalStorage<string>(STORAGE_KEYS.SORT_BY, 'newest'),
};

const jobSlice = createSlice({
  name: 'job',
  initialState,
  reducers: {
    // Toggle save/favorite job
    toggleSaveJob: (state, action: PayloadAction<string>) => {
      const jobId = action.payload;
      // Create new Set to trigger re-render (Set mutation doesn't trigger Redux updates)
      const newSavedJobs = new Set(state.savedJobs);
      if (newSavedJobs.has(jobId)) {
        newSavedJobs.delete(jobId);
      } else {
        newSavedJobs.add(jobId);
      }
      state.savedJobs = newSavedJobs;
      // Persist to localStorage
      saveToLocalStorage(STORAGE_KEYS.SAVED_JOBS, Array.from(newSavedJobs));
    },

    // Add job to recent views (max 10)
    addRecentJob: (state, action: PayloadAction<string>) => {
      const jobId = action.payload;
      // Remove if already exists
      state.recentJobs = state.recentJobs.filter((id) => id !== jobId);
      // Add to front
      state.recentJobs.unshift(jobId);
      // Keep only last 10
      if (state.recentJobs.length > 10) {
        state.recentJobs = state.recentJobs.slice(0, 10);
      }
      // Persist to localStorage
      saveToLocalStorage(STORAGE_KEYS.RECENT_JOBS, state.recentJobs);
    },

    // Set filters
    setFilters: (state, action: PayloadAction<Partial<JobFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },

    // Clear all filters
    clearFilters: (state) => {
      state.filters = {
        industry: [],
        location: [],
        experience: [],
        level: [],
        salary: { min: 0, max: 100000000 },
        workType: [],
      };
    },

    // Set search term
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
    },

    // Set view mode
    setViewMode: (state, action: PayloadAction<'list' | 'grid'>) => {
      state.viewMode = action.payload;
      saveToLocalStorage(STORAGE_KEYS.VIEW_MODE, action.payload);
    },

    // Set sort by
    setSortBy: (state, action: PayloadAction<string>) => {
      state.sortBy = action.payload;
      saveToLocalStorage(STORAGE_KEYS.SORT_BY, action.payload);
    },

    // Clear all saved jobs
    clearSavedJobs: (state) => {
      state.savedJobs = new Set(); // Create new empty Set
      saveToLocalStorage(STORAGE_KEYS.SAVED_JOBS, []);
    },

    // Clear recent jobs
    clearRecentJobs: (state) => {
      state.recentJobs = [];
      saveToLocalStorage(STORAGE_KEYS.RECENT_JOBS, []);
    },
  },
});

export const {
  toggleSaveJob,
  addRecentJob,
  setFilters,
  clearFilters,
  setSearchTerm,
  setViewMode,
  setSortBy,
  clearSavedJobs,
  clearRecentJobs,
} = jobSlice.actions;

export default jobSlice.reducer;
