import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { JobDetail, JobListingSummary, JobState } from "../../jobs/api/job.type";

const initialState: JobState = {
  jobs: [],
  jobDetail: null,

  isLoading: false,
  error: null,

  pagination: null,
  totalRecords: 0,
};

const jobSlice = createSlice({
  name: "job",
  initialState,
  reducers: {
    /**
     * Set job listings with pagination
     */
    setJobListings: (
      state,
      action: PayloadAction<{
        jobs: JobListingSummary[];
        pagination: {
          currentPage: number;
          limitItems: number;
          totalPage: number;
        };
        totalRecords: number;
      }>,
    ) => {
      state.jobs = action.payload.jobs;
      state.pagination = action.payload.pagination;
      state.totalRecords = action.payload.totalRecords;
    },

    setJobDetail: (state, action: PayloadAction<JobDetail | null>) => {
      state.jobDetail = action.payload;
    },

    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    /**
     * Change page - will trigger new API call
     */
    changePage: (state, action: PayloadAction<number>) => {
      if (state.pagination) {
        state.pagination.currentPage = action.payload;
      }
    },

    resetJobState: () => initialState,
  },
});

export const { setJobListings, setJobDetail, setLoading, setError, changePage, resetJobState } =
  jobSlice.actions;

export default jobSlice.reducer;
