import { baseApi } from '@/redux/baseApi';

// Types
export interface ReportEvidence {
  url: string;
  fileName?: string;
}

export interface JobReportRequest {
  jobId: string;
  reason: string;
  description: string;
  evidence?: string[];
}

export interface UserReportRequest {
  userId: string;
  reason: string;
  description: string;
  evidence?: string[];
}

export interface ReportResolutionRequest {
  status: 'pending' | 'reviewing' | 'resolved' | 'rejected';
  adminNote?: string;
}

export interface Reporter {
  userId: string;
  role: string;
  email: string;
  name: string;
}

export interface ReportedItem {
  jobId?: string;
  userId?: string;
  email: string;
  name: string;
}

export interface Report {
  _id: string;
  reportType: 'job' | 'user';
  reporter: Reporter;
  reported: ReportedItem;
  reason: string;
  description: string;
  evidence?: string[];
  status: 'pending' | 'reviewing' | 'resolved' | 'rejected';
  adminNote?: string;
  resolvedBy?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReportsListResponse {
  success: boolean;
  message: string;
  data: {
    reports: Report[];
    total: number;
    page: number;
    totalPages: number;
  };
}

export interface ReportDetailResponse {
  success: boolean;
  message: string;
  data: Report;
}

export interface ReportStatsResponse {
  success: boolean;
  message: string;
  data: {
    total: number;
    pending: number;
    reviewing: number;
    resolved: number;
    rejected: number;
    jobReports: number;
    userReports: number;
  };
}

export interface ReportSubmitResponse {
  success: boolean;
  message: string;
  data: Report;
}

// API Endpoints
export const reportApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // JobSeeker: Submit job report
    submitJobReport: builder.mutation<ReportSubmitResponse['data'], JobReportRequest>({
      query: (data) => ({
        url: '/notifications/reports/job',
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: ReportSubmitResponse) => response.data,
      invalidatesTags: ['Reports'],
    }),

    // Recruiter: Submit user report
    submitUserReport: builder.mutation<ReportSubmitResponse['data'], UserReportRequest>({
      query: (data) => ({
        url: '/notifications/reports/user',
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: ReportSubmitResponse) => response.data,
      invalidatesTags: ['Reports'],
    }),

    // Admin: Get all reports with filtering
    getReports: builder.query<
      ReportsListResponse['data'],
      {
        status?: 'pending' | 'reviewing' | 'resolved' | 'rejected';
        page?: number;
        limit?: number;
        type?: 'job' | 'user';
      }
    >({
      query: ({ status, page = 1, limit = 10, type }) => {
        const params = new URLSearchParams();
        if (status) params.append('status', status);
        if (type) params.append('type', type);
        params.append('page', page.toString());
        params.append('limit', limit.toString());

        return {
          url: `/notifications/reports?${params.toString()}`,
          method: 'GET',
        };
      },
      transformResponse: (response: ReportsListResponse) => response.data,
      providesTags: ['Reports'],
    }),

    // Admin: Get report detail
    getReportDetail: builder.query<ReportDetailResponse['data'], string>({
      query: (reportId) => ({
        url: `/notifications/reports/${reportId}`,
        method: 'GET',
      }),
      transformResponse: (response: ReportDetailResponse) => response.data,
      providesTags: ['Reports'],
    }),

    // Admin: Update report status
    updateReportStatus: builder.mutation<
      ReportDetailResponse['data'],
      { reportId: string; data: ReportResolutionRequest }
    >({
      query: ({ reportId, data }) => ({
        url: `/notifications/reports/${reportId}/resolve`,
        method: 'PUT',
        body: data,
      }),
      transformResponse: (response: ReportDetailResponse) => response.data,
      invalidatesTags: ['Reports'],
    }),

    // Admin: Get report statistics
    getReportStatistics: builder.query<ReportStatsResponse['data'], void>({
      query: () => ({
        url: '/notifications/reports-stats',
        method: 'GET',
      }),
      transformResponse: (response: ReportStatsResponse) => response.data,
      providesTags: ['Reports'],
    }),

    // User: Get their own submitted reports
    getMyReports: builder.query<
      ReportsListResponse['data'],
      {
        page?: number;
        limit?: number;
      }
    >({
      query: ({ page = 1, limit = 10 }) => ({
        url: `/notifications/my-reports?page=${page}&limit=${limit}`,
        method: 'GET',
      }),
      transformResponse: (response: ReportsListResponse) => response.data,
      providesTags: ['Reports'],
    }),
  }),
});

export const {
  useSubmitJobReportMutation,
  useSubmitUserReportMutation,
  useGetReportsQuery,
  useGetReportDetailQuery,
  useUpdateReportStatusMutation,
  useGetReportStatisticsQuery,
  useGetMyReportsQuery,
} = reportApi;
