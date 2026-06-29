import { baseApi } from '@/redux/baseApi';
import { ApplicationStatus } from '@/features/recruiter/application.type';

/**
 * Application type definition matching backend schema
 */
export interface Application {
  _id: string;
  jobId: {
    _id: string;
    title: string;
    experienceLevel?: string;
    salaryMin?: number;
    salaryMax?: number;
    applicationDeadline?: string;
    status?: string;
  } | null;
  jobSeekerId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    profilePicture?: string;
    bio?: string;
    skills?: string[];
    experience?: Array<{
      jobTitle?: string;
      companyName?: string;
      startDate?: string;
      endDate?: string;
      description?: string;
      isCurrentlyWorking?: boolean;
    }>;
    education?: Array<{
      degree?: string;
      institution?: string;
      startDate?: string;
      endDate?: string;
      description?: string;
    }>;
    city?: string;
    country?: string;
    address?: string;
    gender?: string;
    dateOfBirth?: string;
    desiredJobTitle?: string;
    desiredSalary?: number;
    linkedinUrl?: string;
    githubUrl?: string;
    portfolioUrl?: string;
  } | null;
  recruiterId?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  resume?: string;           // Text CV hoặc URL
  resumeUrl?: string;        // URL từ Cloudinary upload
  coverLetter?: string;
  expectedSalary?: number;
  availableDate?: string;
  status: ApplicationStatus;
  recruiterNote?: string;
  reviewedAt?: string;
  reviewedBy?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  source?: string;
  appliedAt: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Request type for applying to a job
 */
export interface ApplyJobRequest {
  jobId: string;
  resume?: string;        // Text CV
  resumeLink?: string;    // URL CV
  coverLetter?: string;
  expectedSalary?: number;
  availableDate?: string;
}

/**
 * Request type for reviewing an application (recruiter)
 */
export interface ReviewApplicationRequest {
  status: 'approved' | 'rejected';
  recruiterNote?: string;
}

/**
 * Request type for updating application status (recruiter)
 */
export interface UpdateApplicationStatusRequest {
  status: 'reviewed' | 'interview_scheduled' | 'approved' | 'rejected';
  recruiterNote?: string;
}

/**
 * Request type for withdrawing an application (job seeker)
 */
export interface WithdrawApplicationRequest {
  reason?: string;
}

/**
 * Query parameters for getting applications
 */
export interface GetApplicationsParams {
  jobId?: string;
  status?: string;
  page?: number;
  limit?: number;
  sortBy?: 'appliedAt' | 'reviewedAt' | 'status';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Response type for getting applications list
 */
export interface GetApplicationsResponse {
  success: boolean;
  data: {
    applications: Application[];
    total: number;
    page: number;
    totalPages: number;
  };
}

/**
 * Response type for CV upload
 */
export interface UploadCVResponse {
  success: boolean;
  message?: string;
  data: Application;
}

/**
 * Generic application response
 */
export interface ApplicationResponse {
  success: boolean;
  message?: string;
  data: Application;
}

/**
 * Application API endpoints using RTK Query
 */
export const applicationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Apply for a job (JobSeeker only)
     * POST /api/v1/applications
     */
    applyJob: builder.mutation<ApplicationResponse, ApplyJobRequest>({
      query: (data) => ({
        url: '/applications',
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: any) => {
        return response;
      },
      invalidatesTags: ['Jobs', { type: 'Applications' as const, id: 'LIST' }],
    }),

    /**
     * Upload CV and apply for job (JobSeeker only)
     * POST /api/v1/applications/upload/cv
     * Accepts FormData with 'cv' field (PDF file)
     */
    uploadCVAndApply: builder.mutation<UploadCVResponse, FormData>({
      query: (formData) => ({
        url: '/applications/upload/cv',
        method: 'POST',
        body: formData,
      }),
      transformResponse: (response: UploadCVResponse) => response,
      invalidatesTags: ['Jobs', { type: 'Applications' as const, id: 'LIST' }],
    }),

    /**
     * Get applications (role-based)
     * JobSeeker sees own, Recruiter sees their jobs'
     * GET /api/v1/applications
     */
    getApplications: builder.query<
      {
        applications: Application[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      },
      {
        status?: string;
        jobId?: string;
        page?: number;
        limit?: number;
        sortBy?: string;
        sortOrder?: string;
      }
    >({
      query: (params) => ({
        url: '/applications',
        params,
      }),
      // ✅ THÊM: Transform để ensure data integrity
      transformResponse: (response: any) => {
        console.log('📡 Raw Backend Response:', response);

        // ✅ Deep clone để tránh frozen object
        const applications = response.data.applications.map((app: any) => {
          const clonedApp = { ...app };

          // ✅ Ensure status có giá trị
          if (!clonedApp.status) {
            console.warn('⚠️ Missing status for app:', clonedApp._id);
            clonedApp.status = ApplicationStatus.PENDING;
          }

          console.log(`✅ App ${clonedApp._id} status:`, clonedApp.status);

          return clonedApp;
        });

        return {
          applications,
          total: response.data.total,
          page: response.data.page,
          limit: response.data.limit || 10,
          totalPages: response.data.totalPages,
        };
      },
      providesTags: (result) =>
        result
          ? [
            ...result.applications.map(({ _id }) => ({
              type: 'Applications' as const,
              id: _id,
            })),
            { type: 'Applications', id: 'LIST' },
          ]
          : [{ type: 'Applications', id: 'LIST' }],
    }),

    /**
     * Get single application by ID
     * GET /api/v1/applications/:id
     */
    getApplicationById: builder.query<Application, string>({
      query: (id) => `/applications/${id}`,
      // ✅ THÊM: Transform response
      transformResponse: (response: any) => {
        console.log('📡 Application Detail Response:', response);

        const app = { ...response.data };

        if (!app.status) {
          console.warn('⚠️ Missing status in detail');
          app.status = ApplicationStatus.PENDING;
        }

        return app;
      },
      providesTags: (_result, _error, id) => [{ type: 'Applications', id }],
    }),

    /**
     * Review application - Approve or Reject (Recruiter only)
     * PUT /api/v1/applications/:id/review
     */
    reviewApplication: builder.mutation<
      ApplicationResponse,
      { id: string; data: ReviewApplicationRequest }
    >({
      query: ({ id, data }) => ({
        url: `/applications/${id}/review`,
        method: 'PUT',  // ✅ FIX: Đổi từ PATCH sang PUT
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Applications', id },
        { type: 'Applications', id: 'LIST' },
      ],
    }),

    /**
     * Update application status (Recruiter only)
     * PUT /api/v1/applications/:id/status
     */
    updateApplicationStatus: builder.mutation<
      ApplicationResponse,
      { id: string; data: UpdateApplicationStatusRequest }
    >({
      query: ({ id, data }) => ({
        url: `/applications/${id}/status`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Applications', id },
        { type: 'Applications', id: 'LIST' },
      ],
    }),

    /**
     * Withdraw application (JobSeeker only)
     * PUT /api/v1/applications/:id/withdraw
     */
    withdrawApplication: builder.mutation<
      ApplicationResponse,
      { id: string; data: WithdrawApplicationRequest }
    >({
      query: ({ id, data }) => ({
        url: `/applications/${id}/withdraw`,
        method: 'PUT',
        body: data,
      }),
      transformResponse: (response: any) => {
        // Backend returns { success: true, message: string, data: Application }
        return response;
      },
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Applications' as const, id },
        { type: 'Applications' as const, id: 'LIST' },
      ],
    }),

    /**
     * Get application statistics (Recruiter only)
     * GET /api/v1/applications/stats
     */
    getApplicationStats: builder.query<
      {
        success: boolean;
        data: {
          totalApplications: number;
          pendingApplications: number;
          reviewedApplications: number;
          approvedApplications: number;
          rejectedApplications: number;
          interviewScheduledApplications: number;
        };
      },
      void
    >({
      query: () => '/applications/stats',
      providesTags: ['Applications'],
    }),
  }),
});

/**
 * Export hooks for use in components
 */
export const {
  useApplyJobMutation,
  useUploadCVAndApplyMutation,
  useGetApplicationsQuery,
  useGetApplicationByIdQuery,
  useReviewApplicationMutation,
  useUpdateApplicationStatusMutation,
  useWithdrawApplicationMutation,
  useGetApplicationStatsQuery,
} = applicationApi;
