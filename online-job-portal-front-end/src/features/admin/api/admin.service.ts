import { baseApi } from "@/redux/baseApi";
import type { JobPost } from "@/data/mockAdminData";
import type { JobDetail } from "@/features/jobs/api/job.type";
import type {
  UpdateJobApprovalStatusRequest,
  UpdateJobApprovalStatusResponse,
  GetSubscriptionPackagesResponse,
  ListAdminRefundsResponse,
  UpdateRefundStatusRequest,
  UpdateRefundStatusResponse,
  DeletePackageRequest,
  DeletePackageResponse,
  UpdatePackageRequest,
  UpdatePackageResponse,
  CreatePackageRequest,
  CreatePackageResponse,
  GetAdminDashboardStatsResponse,
  GetSubscriptionPackageDetailResponse,
  SubscriptionPackage,
} from "./admin.type";

export const adminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminJobs: builder.query<JobPost[], void>({
      query: () => ({ url: "jobs", method: "GET" }),
      providesTags: ["Jobs"],
    }),
    getAdminJobDetail: builder.query<JobDetail, string>({
      query: (jobId) => ({ url: `jobs/${jobId}`, method: "GET" }),
      transformResponse: (response: JobDetail | { data: JobDetail }) =>
        "data" in response ? response.data : response,
      providesTags: (_result, _error, jobId) => [{ type: "Jobs", id: jobId }],
    }),
    getSubscriptionPackages: builder.query<GetSubscriptionPackagesResponse, void>({
      query: () => ({ url: "subscription-packages", method: "GET" }),
      providesTags: ["Profile"],
    }),
    getSubscriptionPackageDetail: builder.query<SubscriptionPackage, string>({
      query: (packageId) => ({ url: `subscription-packages/${packageId}`, method: "GET" }),
      transformResponse: (response: GetSubscriptionPackageDetailResponse) => response.data,
      providesTags: ["Profile"],
    }),
    updateJobApprovalStatus: builder.mutation<
      UpdateJobApprovalStatusResponse,
      UpdateJobApprovalStatusRequest
    >({
      query: ({ jobId, approvalStatus, rejectionReason }) => ({
        url: `jobs/admin/${jobId}`,
        method: "PATCH",
        body: {
          approvalStatus,
          rejectionReason: rejectionReason || null,
        },
      }),
      invalidatesTags: ["Jobs"],
    }),
    getListAdminRefunds: builder.query<
      ListAdminRefundsResponse,
      { status?: string; page?: number; limit?: number }
    >({
      query: ({ status = "all", page = 1, limit = 10 }) => ({
        url: "refunds/admin",
        method: "GET",
        params: {
          status: status === "all" ? undefined : status,
          page,
          limit,
        },
      }),
      providesTags: ["Refunds"],
    }),
    updateRefundStatus: builder.mutation<UpdateRefundStatusResponse, UpdateRefundStatusRequest>({
      query: ({ refundId, action, notes }) => ({
        url: `refunds/admin/${refundId}`,
        method: "PUT",
        body: { action, notes },
      }),
      invalidatesTags: ["Refunds"],
    }),
    deleteSubscriptionPackage: builder.mutation<DeletePackageResponse, DeletePackageRequest>({
      query: ({ packageId, permanent = true }) => ({
        url: `subscription-packages/${packageId}`,
        method: "DELETE",
        params: {
          permanent,
        },
      }),
      invalidatesTags: ["Profile"],
    }),
    updateSubscriptionPackage: builder.mutation<UpdatePackageResponse, UpdatePackageRequest>({
      query: ({ packageId, ...body }) => ({
        url: `subscription-packages/${packageId}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Profile"],
    }),
    createSubscriptionPackage: builder.mutation<CreatePackageResponse, CreatePackageRequest>({
      query: (body) => ({
        url: "subscription-packages",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Profile"],
    }),
    getAdminDashboardStats: builder.query<GetAdminDashboardStatsResponse, void>({
      query: () => ({ url: "admin/dashboard/stats", method: "GET" }),
      providesTags: ["Users", "Jobs", "Refunds"],
    }),
  }),
});

export const {
  useGetAdminJobsQuery,
  useLazyGetAdminJobDetailQuery,
  useGetSubscriptionPackagesQuery,
  useLazyGetSubscriptionPackageDetailQuery,
  useUpdateJobApprovalStatusMutation,
  useGetListAdminRefundsQuery,
  useUpdateRefundStatusMutation,
  useDeleteSubscriptionPackageMutation,
  useUpdateSubscriptionPackageMutation,
  useCreateSubscriptionPackageMutation,
  useGetAdminDashboardStatsQuery,
} = adminApi;
