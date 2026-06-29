import { baseApi } from '@/redux/baseApi';

/**
 * Interview Status Enum
 */
export const InterviewStatus = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export type InterviewStatus = (typeof InterviewStatus)[keyof typeof InterviewStatus];

/**
 * Interview interface matching backend schema
 */
export interface Interview {
  _id: string;
  jobId: {
    _id: string;
    title: string;
  };
  applicationId: string;
  recruiterId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  jobSeekerId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  scheduledDate: string; // ISO date string
  scheduledTime: string; // HH:mm format
  duration: number; // minutes
  location?: string;
  meetingLink?: string;
  note?: string;
  status: InterviewStatus;
  jobSeekerResponse?: {
    accepted: boolean;
    respondedAt: string;
    rejectionReason?: string;
  };
  result?: {
    passed: boolean;
    feedback: string;
    evaluatedAt: string;
  };
  createdAt: string;
  updatedAt: string;
}

/**
 * Create interview request DTO
 */
export interface CreateInterviewRequest {
  jobId: string;
  applicationId: string;
  jobSeekerId: string;
  scheduledDate: string; // YYYY-MM-DD
  scheduledTime: string; // HH:mm
  duration: number;
  location?: string;
  meetingLink?: string;
  note?: string;
}

/**
 * Respond to interview request
 */
export interface RespondInterviewRequest {
  accepted: boolean;
  rejectionReason?: string;
}

/**
 * Update interview schedule
 */
export interface UpdateInterviewRequest {
  scheduledDate?: string; // YYYY-MM-DD
  scheduledTime?: string; // HH:mm
  duration?: number;
  location?: string;
  meetingLink?: string;
  note?: string;
}

/**
 * Update interview result
 */
export interface InterviewResultRequest {
  passed: boolean;
  feedback: string;
}

/**
 * Get interviews query params
 */
export interface GetInterviewsParams {
  status?: InterviewStatus;
  page?: number;
  limit?: number;
}

/**
 * Get interviews response
 */
export interface GetInterviewsResponse {
  success: boolean;
  data: {
    interviews: Interview[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * Interview API response
 */
export interface InterviewResponse {
  success: boolean;
  message: string;
  data: Interview;
}

/**
 * Interview API endpoints
 */
export const interviewApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * POST /api/v1/notifications/interviews
     * Create new interview schedule (Recruiter only)
     */
    createInterview: builder.mutation<InterviewResponse, CreateInterviewRequest>({
      query: (data) => ({
        url: '/notifications/interviews',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Applications', { type: 'Interviews', id: 'LIST' }],
    }),

    /**
     * GET /api/v1/notifications/interviews
     * Get interviews list (role-based)
     */
    getInterviews: builder.query<GetInterviewsResponse['data'], GetInterviewsParams>({
      query: (params) => ({
        url: '/notifications/interviews',
        params,
      }),
      transformResponse: (response: GetInterviewsResponse) => response.data,
      providesTags: (result) =>
        result
          ? [
              ...result.interviews.map(({ _id }) => ({ type: 'Interviews' as const, id: _id })),
              { type: 'Interviews', id: 'LIST' },
            ]
          : [{ type: 'Interviews', id: 'LIST' }],
    }),

    /**
     * GET /api/v1/notifications/interviews/:interviewId
     * Get interview details
     */
    getInterviewById: builder.query<Interview, string>({
      query: (id) => `/notifications/interviews/${id}`,
      transformResponse: (response: InterviewResponse) => response.data,
      providesTags: (_result, _error, id) => [{ type: 'Interviews', id }],
    }),

    /**
     * PUT /api/v1/notifications/interviews/:interviewId/respond
     * Job-seeker responds to interview invitation
     */
    respondToInterview: builder.mutation<
      InterviewResponse,
      { id: string; data: RespondInterviewRequest }
    >({
      query: ({ id, data }) => ({
        url: `/notifications/interviews/${id}/respond`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Interviews', id },
        { type: 'Interviews', id: 'LIST' },
      ],
    }),

    /**
     * PUT /api/v1/notifications/interviews/:interviewId
     * Recruiter updates interview schedule
     */
    updateInterview: builder.mutation<
      InterviewResponse,
      { id: string; data: UpdateInterviewRequest }
    >({
      query: ({ id, data }) => ({
        url: `/notifications/interviews/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Interviews', id },
        { type: 'Interviews', id: 'LIST' },
      ],
    }),

    /**
     * PUT /api/v1/notifications/interviews/:interviewId/result
     * Recruiter updates interview result
     */
    updateInterviewResult: builder.mutation<
      InterviewResponse,
      { id: string; data: InterviewResultRequest }
    >({
      query: ({ id, data }) => ({
        url: `/notifications/interviews/${id}/result`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Interviews', id },
        { type: 'Interviews', id: 'LIST' },
      ],
    }),
  }),
});

/**
 * Export hooks
 */
export const {
  useCreateInterviewMutation,
  useGetInterviewsQuery,
  useGetInterviewByIdQuery,
  useRespondToInterviewMutation,
  useUpdateInterviewMutation,
  useUpdateInterviewResultMutation,
} = interviewApi;
