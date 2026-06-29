// Job state types for Redux slice
export interface JobFilters {
  industry: string[];
  location: string[];
  experience: string[];
  level: string[];
  salary: { min: number; max: number };
  workType: string[];
}

export interface JobState {
  // Saved/Favorite jobs (persisted to localStorage)
  savedJobs: Set<string>;

  // Recently viewed jobs (max 10, persisted to localStorage)
  recentJobs: string[];

  // Current search filters (optional persistence)
  filters: JobFilters;

  // Search term
  searchTerm: string;

  // View preferences
  viewMode: 'list' | 'grid';
  sortBy: string;
}

export const initialJobFilters: JobFilters = {
  industry: [],
  location: [],
  experience: [],
  level: [],
  salary: { min: 0, max: 100000000 },
  workType: [],
};

export const initialJobState: JobState = {
  savedJobs: new Set<string>(),
  recentJobs: [],
  filters: initialJobFilters,
  searchTerm: '',
  viewMode: 'list',
  sortBy: 'newest',
};
