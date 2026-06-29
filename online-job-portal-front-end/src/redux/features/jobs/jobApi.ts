import type {
  Job,
  JobDetailDTO,
} from '@/features/job-seeker/components/jobs/types/job.types';
import {
  transformJobDetailToJob,
  transformJobListingToJob,
} from '@/features/job-seeker/components/jobs/types/job.types';
import { baseApi } from '@/redux/baseApi';

/**
 * Query parameters for job listings search
 */
export interface SearchJobsParams {
  page?: number;
  limit?: number;
  keyword?: string;
  industryIds?: string[];
  jobTypeId?: string;
  locationIds?: string[];
  city?: string;
  experienceLevel?: string;
  experienceLevels?: string[];
  salaryMin?: number;
  salaryMax?: number;
  isRemote?: boolean;
  isHybrid?: boolean;
  sortBy?: string;
}

/**
 * Response type for getJobs with pagination info
 */
export interface GetJobsResponse {
  jobs: Job[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  totalRecords: number;
}

/**
 * Response type for toggle favorite
 */
export interface ToggleFavoriteResponse {
  success: boolean;
  data: {
    message: string;
    isFavorite: boolean;
    jobId: string;
  };
}

/**
 * Response type for user jobs with favorite flags
 */
export interface UserJobsResponse {
  success: boolean;
  data: Job[];
}

/**
 * Response type for filter options
 */
export interface FilterOptionsResponse {
  success: boolean;
  message: string;
  data: {
    industries: Array<{ _id: string; name: string; jobCount: number }>;
    jobTypes: Array<{ _id: string; name: string; jobCount: number }>;
    locations: Array<{ _id: string; city: string; country?: string; jobCount: number }>;
    experienceLevels: Array<{ value: string; label: string; jobCount: number }>;
    salaryRange: { min: number; max: number; currency: string };
    workModes: { remote: number; hybrid: number; onsite: number };
    totalActiveJobs: number;
  };
}

export const jobApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Get job listings with pagination, filtering, and searching (Public)
     * Endpoint: GET /api/v1/jobs/search
     * Transforms BE response to FE Job type
     */
    getJobs: builder.query<GetJobsResponse, SearchJobsParams | void>({
      query: (params) => {
        const queryParams = new URLSearchParams();

        if (params) {
          Object.entries(params).forEach(([key, value]) => {
            // Skip undefined or null or false boolean values
            if (value === undefined || value === null) return;
            if (typeof value === 'boolean' && !value) return;

            if (Array.isArray(value)) {
              if (value.length > 0) {
                queryParams.append(key, value.join(','));
              }
            } else {
              queryParams.append(key, String(value));
            }
          });
        }
        queryParams.set('status', 'active');
        queryParams.set('approvalStatus', 'approved');

        const queryString = queryParams.toString();
        const url = `/jobs/search?${queryString}`;
        console.log('[jobApi.getJobs] URL:', url);
        return url;
      },
      transformResponse: (response: any) => {
        try {
          console.log('[jobApi] Raw response:', response);
          console.log('[jobApi] Response type:', typeof response, 'keys:', Object.keys(response || {}));

          // Ensure data is an array
          const jobs = Array.isArray(response?.data)
            ? response.data.map((job: any) => {
                console.log('[jobApi] Transforming job:', job.id, job.title);
                return transformJobListingToJob(job);
              })
            : [];

          const pagination = response?.pagination || {
            page: 1,
            limit: 10,
            total: 0,
            totalPages: 0,
          };

          const transformed = {
            jobs,
            pagination,
            totalRecords: pagination.total || 0,
          };
          console.log('[jobApi] Transformed jobs:', transformed.jobs.length, 'jobs');
          console.log('[jobApi] Final response:', transformed);
          return transformed;
        } catch (error) {
          console.error('[jobApi] Transform error:', error);
          throw error;
        }
      },
      providesTags: (result) =>
        result
          ? [
              ...result.jobs.map(({ id }) => ({ type: 'Jobs' as const, id })),
              { type: 'Jobs', id: 'LIST' },
            ]
          : [{ type: 'Jobs', id: 'LIST' }],
    }),

    /**
     * Get job detail by ID
     * Endpoint: GET /api/v1/jobs/:id
     * Transforms BE response to FE Job type
     */
    getJobDetail: builder.query<Job, string>({
      query: (id) => `/jobs/${id}`,
      transformResponse: (response: JobDetailDTO) => {
        return transformJobDetailToJob(response);
      },
      providesTags: (_result, _error, id) => [{ type: 'Jobs', id }],
    }),

    /**
     * Get jobs for authenticated user with isFavorite flags
     * Endpoint: GET /api/v1/job
     * Requires authentication
     */
    getUserJobs: builder.query<Job[], void>({
      query: () => '/job',
      transformResponse: (response: UserJobsResponse) => {
        return response.data;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Jobs' as const, id })),
              { type: 'Jobs', id: 'USER_LIST' },
            ]
          : [{ type: 'Jobs', id: 'USER_LIST' }],
    }),

    /**
     * Get job detail for authenticated user with isFavorite flag
     * Endpoint: GET /api/v1/job/:jobId
     * Requires authentication
     */
    getUserJobDetail: builder.query<Job, string>({
      query: (jobId) => `/job/${jobId}`,
      transformResponse: (response: { success: boolean; data: any }) => {
        // The backend returns job with isFavorite flag
        return response.data;
      },
      providesTags: (_result, _error, id) => [{ type: 'Jobs', id }],
    }),

    /**
     * Toggle favorite status for a job
     * Endpoint: POST /api/v1/job/:jobId/favorite
     * Requires authentication
     */
    toggleFavoriteJob: builder.mutation<ToggleFavoriteResponse, string>({
      query: (jobId) => ({
        url: `/job/${jobId}/favorite`,
        method: 'POST',
      }),
      // Optimistic update
      async onQueryStarted(jobId, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          jobApi.util.updateQueryData('getUserJobs', undefined, (draft) => {
            const job = draft.find((j) => j.id === jobId);
            if (job) {
              job.isFavorite = !job.isFavorite;
            }
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
      invalidatesTags: (_result, _error, jobId) => [
        { type: 'Jobs', id: jobId },
        { type: 'Jobs', id: 'USER_LIST' },
      ],
    }),

    /**
     * Get dynamic filter options based on actual job data
     * Endpoint: GET /api/v1/jobs/filter-options
     * Returns industries, locations, job types, experience levels, salary range, etc.
     */
    getFilterOptions: builder.query<FilterOptionsResponse, void>({
      query: () => '/jobs/filter-options',
      providesTags: [{ type: 'Jobs', id: 'FILTER_OPTIONS' }],
    }),
  }),
});

export const {
  useGetJobsQuery,
  useGetJobDetailQuery,
  useGetUserJobsQuery,
  useGetUserJobDetailQuery,
  useToggleFavoriteJobMutation,
  useGetFilterOptionsQuery,
} = jobApi;
