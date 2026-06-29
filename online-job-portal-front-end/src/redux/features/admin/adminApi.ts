import { baseApi } from '@/redux/baseApi';

/**
 * ========== TYPES ==========
 */

export interface User {
  _id: string;
  email: string;
  fullName: string;
  role: 'admin' | 'recruiter' | 'job_seeker';
  birthday: string;
  phone: string;
  isActive: boolean;
  loginAttempts: number;
  lockUntil: string | null;
  companyId: string | null;
  createdAt: string;
  updatedAt: string;
  statistics: UserStatistics;
  status: UserStatus;
}

export interface UserStatistics {
  lastActivity: string | null;
  totalApplications?: number;
  totalInterviews?: number;
  totalJobPosts?: number;
  totalPackages?: number;
}

export interface UserStatus {
  isActive: boolean;
  isLocked: boolean;
  isInactive: boolean;
  lastLogin: string | null;
  lockReason?: string;
  lockUntil?: string;
  inactiveReason?: string;
}

export interface GetUsersResponse {
  success: boolean;
  message: string;
  data: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: {
    applied: {
      role?: string;
      status?: string;
      search?: string;
      dateRange?: {
        from?: string;
        to?: string;
      };
    };
    available: {
      roles: string[];
      statuses: string[];
      dateRange: {
        from: string;
        to: string;
      };
    };
  };
}

export interface GetUsersParams {
  page?: number | string;
  limit?: number | string;
  role?: string;
  status?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortOrder?: string;
}

export interface BanUserParams {
  userId: string;
  duration: string;
  reason: string;
}

export interface BanUserResponse {
  success: boolean;
  message: string;
  data: {
    userId: string;
    email: string;
    fullName: string;
    bannedUntil: string;
    banDuration: string;
    banDurationLabel: string;
    reason: string;
    bannedBy: string;
    bannedAt: string;
  };
}

export interface UnbanUserResponse {
  success: boolean;
  message: string;
  data: {
    userId: string;
    email: string;
    fullName: string;
  };
}

export interface DeleteUserParams {
  userId: string;
  reason?: string;
}

export interface DeleteUserResponse {
  success: boolean;
  message: string;
  data: {
    userId: string;
    email: string;
    fullName: string;
    deletedAt: string;
    deletedBy: string;
    reason?: string;
  };
}

export interface RestoreUserResponse {
  success: boolean;
  message: string;
  data: {
    userId: string;
    email: string;
    fullName: string;
  };
}

export interface Recruiter {
  _id: string;
  email: string;
  fullName: string;
  companyName: string;
  phone: string;
  accountStatus: 'pending' | 'approved' | 'active' | 'rejected';
  rejectionReason?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetRecruitersResponse {
  success: boolean;
  message: string;
  data: Recruiter[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface GetRecruiterDetailResponse {
  success: boolean;
  message: string;
  data: Recruiter;
}

export interface ApproveRecruiterResponse {
  success: boolean;
  message: string;
  data: {
    recruiterId: string;
    email: string;
    activationTokenSent: boolean;
    tokenExpiresIn: string;
  };
}

export interface RejectRecruiterParams {
  recruiterId: string;
  rejectionReason: string;
}

export interface RejectRecruiterResponse {
  success: boolean;
  message: string;
  data: {
    recruiterId: string;
    email: string;
    rejectionReason: string;
  };
}

export interface SendEmailParams {
  userId: string;
  subject: string;
  body: string;
}

/**
 * ========== ADMIN API ENDPOINTS ==========
 */
export const adminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ============ USER MANAGEMENT ============

    /**
     * GET /api/v1/admin/users
     * Get list of users with filters, pagination, and statistics
     */
    getUsers: builder.query<GetUsersResponse, GetUsersParams>({
      query: (params) => ({
        url: '/admin/users',
        method: 'GET',
        params: {
          page: params.page || 1,
          limit: params.limit || 10,
          ...(params.role && { role: params.role }),
          ...(params.status && { status: params.status }),
          ...(params.search && { search: params.search }),
          ...(params.dateFrom && { dateFrom: params.dateFrom }),
          ...(params.dateTo && { dateTo: params.dateTo }),
          ...(params.sortBy && { sortBy: params.sortBy }),
          ...(params.sortOrder && { sortOrder: params.sortOrder }),
        },
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ _id }) => ({ type: 'Users' as const, id: _id })),
              { type: 'Users', id: 'LIST' },
            ]
          : [{ type: 'Users', id: 'LIST' }],
    }),

    /**
     * PUT /api/v1/admin/users/:userId/ban
     * Ban user with duration
     */
    banUser: builder.mutation<BanUserResponse, BanUserParams>({
      query: ({ userId, duration, reason }) => ({
        url: `/admin/users/${userId}/ban`,
        method: 'PUT',
        body: { duration, reason },
      }),
      invalidatesTags: [{ type: 'Users', id: 'LIST' }],
    }),

    /**
     * PUT /api/v1/admin/users/:userId/unban
     * Unban user
     */
    unbanUser: builder.mutation<UnbanUserResponse, string>({
      query: (userId) => ({
        url: `/admin/users/${userId}/unban`,
        method: 'PUT',
      }),
      invalidatesTags: [{ type: 'Users', id: 'LIST' }],
    }),

    /**
     * DELETE /api/v1/admin/users/:userId
     * Soft delete user
     */
    deleteUser: builder.mutation<DeleteUserResponse, DeleteUserParams>({
      query: ({ userId, reason }) => ({
        url: `/admin/users/${userId}`,
        method: 'DELETE',
        body: { reason },
      }),
      invalidatesTags: [{ type: 'Users', id: 'LIST' }],
    }),

    /**
     * PUT /api/v1/admin/users/:userId/restore
     * Restore deleted user
     */
    restoreUser: builder.mutation<RestoreUserResponse, string>({
      query: (userId) => ({
        url: `/admin/users/${userId}/restore`,
        method: 'PUT',
      }),
      invalidatesTags: [{ type: 'Users', id: 'LIST' }],
    }),

    /**
     * POST /api/v1/admin/users/:userId/send-email
     * Send email to user
     */
    sendEmail: builder.mutation<
      { success: boolean; message: string },
      SendEmailParams
    >({
      query: ({ userId, subject, body }) => ({
        url: `/admin/users/${userId}/send-email`,
        method: 'POST',
        body: { subject, body },
      }),
    }),

    // ============ RECRUITER MANAGEMENT ============

    /**
     * GET /api/v1/admin/recruiters
     * Get all recruiters
     */
    getRecruiters: builder.query<
      GetRecruitersResponse,
      { page?: number; limit?: number; status?: string }
    >({
      query: (params) => ({
        url: '/admin/recruiters',
        method: 'GET',
        params: {
          page: params.page || 1,
          limit: params.limit || 10,
          ...(params.status && { status: params.status }),
        },
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ _id }) => ({ type: 'Recruiters' as const, id: _id })),
              { type: 'Recruiters', id: 'LIST' },
            ]
          : [{ type: 'Recruiters', id: 'LIST' }],
    }),

    /**
     * GET /api/v1/admin/recruiters/pending
     * Get pending recruiters
     */
    getPendingRecruiters: builder.query<
      GetRecruitersResponse,
      { page?: number; limit?: number }
    >({
      query: (params) => ({
        url: '/admin/recruiters/pending',
        method: 'GET',
        params: {
          page: params.page || 1,
          limit: params.limit || 10,
        },
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ _id }) => ({
                type: 'Recruiters' as const,
                id: _id,
              })),
              { type: 'Recruiters', id: 'PENDING' },
            ]
          : [{ type: 'Recruiters', id: 'PENDING' }],
    }),

    /**
     * GET /api/v1/admin/recruiters/:id
     * Get recruiter detail
     */
    getRecruiterDetail: builder.query<GetRecruiterDetailResponse, string>({
      query: (recruiterId) => ({
        url: `/admin/recruiters/${recruiterId}`,
        method: 'GET',
      }),
      providesTags: (_result, _error, id) => [{ type: 'Recruiters', id }],
    }),

    /**
     * POST /api/v1/admin/recruiters/:id/approve
     * Approve recruiter
     */
    approveRecruiter: builder.mutation<ApproveRecruiterResponse, string>({
      query: (recruiterId) => ({
        url: `/admin/recruiters/${recruiterId}/approve`,
        method: 'POST',
      }),
      invalidatesTags: [{ type: 'Recruiters', id: 'LIST' }, { type: 'Recruiters', id: 'PENDING' }],
    }),

    /**
     * POST /api/v1/admin/recruiters/:id/reject
     * Reject recruiter
     */
    rejectRecruiter: builder.mutation<RejectRecruiterResponse, RejectRecruiterParams>({
      query: ({ recruiterId, rejectionReason }) => ({
        url: `/admin/recruiters/${recruiterId}/reject`,
        method: 'POST',
        body: { rejectionReason },
      }),
      invalidatesTags: [{ type: 'Recruiters', id: 'LIST' }, { type: 'Recruiters', id: 'PENDING' }],
    }),

    /**
     * POST /api/v1/admin/recruiters/:id/resend-activation
     * Resend activation email to recruiter
     */
    resendRecruiterActivation: builder.mutation<
      { success: boolean; message: string },
      string
    >({
      query: (recruiterId) => ({
        url: `/admin/recruiters/${recruiterId}/resend-activation`,
        method: 'POST',
      }),
    }),
  }),
});

// Export hooks for usage in components
export const {
  useGetUsersQuery,
  useLazyGetUsersQuery,
  useBanUserMutation,
  useUnbanUserMutation,
  useDeleteUserMutation,
  useRestoreUserMutation,
  useSendEmailMutation,
  useGetRecruitersQuery,
  useLazyGetRecruitersQuery,
  useGetPendingRecruitersQuery,
  useLazyGetPendingRecruitersQuery,
  useGetRecruiterDetailQuery,
  useApproveRecruiterMutation,
  useRejectRecruiterMutation,
  useResendRecruiterActivationMutation,
} = adminApi;
