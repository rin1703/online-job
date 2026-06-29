import { baseApi } from "@/redux/baseApi";
import type { JobPost } from "@/data/mockAdminData";
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
} from "./admin.type";

export const adminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminJobs: builder.query<JobPost[], void>({
      query: () => ({ url: "jobs", method: "GET" }),
      providesTags: ["Jobs"],
    }),
    getSubscriptionPackages: builder.query<GetSubscriptionPackagesResponse, void>({
      query: () => ({ url: "subscription-packages", method: "GET" }),
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
  }),
});

export const {
  useGetAdminJobsQuery,
  useGetSubscriptionPackagesQuery,
  useUpdateJobApprovalStatusMutation,
  useGetListAdminRefundsQuery,
  useUpdateRefundStatusMutation,
  useDeleteSubscriptionPackageMutation,
  useUpdateSubscriptionPackageMutation,
  useCreateSubscriptionPackageMutation,
} = adminApi;
