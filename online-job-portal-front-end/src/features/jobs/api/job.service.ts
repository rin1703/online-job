import { baseApi } from "@/redux/baseApi";

import type {
  AdminApprovalDTO,
  CreateJobListingDTO,
  JobDetail,
  JobListingResponse,
  JobListingSummary,
  RecruiterFilterParams,
  RecruiterFilterResponse,
  RecruiterJobPosting,
  RecruiterStatusDTO,
  UpdateJobListingDTO,
} from "./job.type";
import type { JobFormValues } from "../job.schema";

export const jobApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * 1. GET all job listings (public or admin)
     */
    getJobListingSummaries: builder.query<JobListingSummary[], void>({
      query: () => ({
        url: "/jobs",
        method: "GET",
      }),
      transformResponse: (response: JobListingResponse) => response.data,
      providesTags: ["Jobs"],
    }),

    /**
     * 2. GET recruiter job detail
     */
    getRecruiterJobDetail: builder.query<JobDetail, string>({
      query: (id) => `/jobs/${id}`,
      transformResponse: (response: any) => {
        return response.data || response;
      },
      providesTags: (_result, _error, id) => (_result ? [{ type: "Jobs", id }] : ["Jobs"]),
    }),

    /**
     * 2b. GET job detail for EDITING (returns JobFormValues format)
     * 👇 Query riêng cho editing, auto-transform sang form format
     */
    getJobForEdit: builder.query<JobFormValues, string>({
      query: (id) => `/jobs/${id}`,
      transformResponse: (response: any): JobFormValues => {
        const data = response.data || response;

        // Helper function to safely transform arrays
        const safeTransformArray = (arr: any): { value: string }[] => {
          if (!arr) return [];
          if (!Array.isArray(arr)) return [];

          return arr
            .filter((item) => item != null) // Remove null/undefined
            .map((item) => {
              // If already in {value: string} format
              if (typeof item === "object" && item.value !== undefined) {
                return { value: String(item.value) };
              }
              // If it's a plain string
              return { value: String(item) };
            })
            .filter((item) => item.value.trim() !== ""); // Remove empty strings
        };

        return {
          title: data.title || "",
          jobType: data.jobType || "",
          experienceLevel: data.experienceLevel || "",
          salaryMin: data.salaryMin,
          salaryMax: data.salaryMax,
          salaryCurrency: data.salaryCurrency || "USD",
          numberOfPositions: data.numberOfPositions || 1,
          // Convert Date/string back to YYYY-MM-DD format
          applicationDeadline: data.applicationDeadline
            ? new Date(data.applicationDeadline).toISOString().split("T")[0]
            : "",
          isRemote: data.isRemote || false,
          // Convert string[] to {value: string}[] format with safe transformation
          overview: safeTransformArray(data.overview),
          responsibilities: safeTransformArray(data.responsibilities),
          requirements: safeTransformArray(data.requirementSkill || data.requirements),
          benefits: safeTransformArray(data.benefits),
          niceToHave: safeTransformArray(data.niceToHave),
          workingSchedule: safeTransformArray(data.workingSchedule),
        };
      },
      providesTags: (_result, _error, id) => [{ type: "Jobs", id }],
    }),

    /**
     * 3. GET recruiter job dashboard (Old endpoint)
     */
    getRecruiterDashboard: builder.query<RecruiterJobPosting[], void>({
      query: () => ({
        url: `/jobs/recruiter/dashboard`,
        method: "GET",
      }),
      providesTags: ["Jobs"],
    }),

    /**
     * 3b. GET recruiter jobs with filter (New endpoint)
     */
    getRecruiterJobsFilter: builder.query<RecruiterFilterResponse, RecruiterFilterParams>({
      query: (params) => ({
        url: "/jobs/recruiter/filter",
        method: "GET",
        params,
      }),
      providesTags: ["Jobs"],
    }),

    /**
     * 4. POST create job
     * 👇 Transform JobFormValues to CreateJobListingDTO
     */
    createJob: builder.mutation<{ message: string; data: any; success: boolean }, JobFormValues>({
      query: (formData) => {
        // Transform form data to DTO
        const dto: CreateJobListingDTO = {
          title: formData.title,
          jobType: formData.jobType,
          experienceLevel: formData.experienceLevel,
          overview: formData.overview.map((item) => item.value).filter(Boolean),
          responsibilities: formData.responsibilities.map((item) => item.value).filter(Boolean),
          requirements: formData.requirements.map((item) => item.value).filter(Boolean),
          salaryMin: formData.salaryMin,
          salaryMax: formData.salaryMax,
          salaryCurrency: formData.salaryCurrency,
          numberOfPositions: formData.numberOfPositions,
          // Convert string to Date
          applicationDeadline: formData.applicationDeadline
            ? new Date(formData.applicationDeadline)
            : undefined,
          isRemote: formData.isRemote,
          benefits: formData.benefits?.map((item) => item.value).filter(Boolean),
          niceToHave: formData.niceToHave?.map((item) => item.value).filter(Boolean),
          workingSchedule: formData.workingSchedule?.map((item) => item.value).filter(Boolean),
        };

        return {
          url: "/jobs/new",
          method: "POST",
          body: dto,
        };
      },
      invalidatesTags: ["Jobs"],
    }),

    /**
     * 5. PATCH update job listing
     * 👇 Transform JobFormValues to UpdateJobListingDTO
     */
    updateJob: builder.mutation<
      { success: boolean; message: string; data: any },
      { id: string; data: JobFormValues }
    >({
      query: ({ id, data: formData }) => {
        // Transform form data to DTO
        const dto: UpdateJobListingDTO = {
          title: formData.title,
          jobType: formData.jobType,
          experienceLevel: formData.experienceLevel,
          overview: formData.overview.map((item) => item.value).filter(Boolean),
          responsibilities: formData.responsibilities.map((item) => item.value).filter(Boolean),
          requirements: formData.requirements.map((item) => item.value).filter(Boolean),
          salaryMin: formData.salaryMin,
          salaryMax: formData.salaryMax,
          salaryCurrency: formData.salaryCurrency,
          numberOfPositions: formData.numberOfPositions,
          applicationDeadline: formData.applicationDeadline
            ? new Date(formData.applicationDeadline)
            : undefined,
          isRemote: formData.isRemote,
          benefits: formData.benefits?.map((item) => item.value).filter(Boolean),
          niceToHave: formData.niceToHave?.map((item) => item.value).filter(Boolean),
          workingSchedule: formData.workingSchedule?.map((item) => item.value).filter(Boolean),
        };

        return {
          url: `/jobs/${id}`,
          method: "PATCH",
          body: dto,
        };
      },
      invalidatesTags: (_result, _error, arg) => ["Jobs", { type: "Jobs", id: arg.id }],
    }),

    /**
     * 6. PATCH recruiter change job status
     */
    changeJobStatus: builder.mutation<
      { message: string; data: any },
      { id: string; data: RecruiterStatusDTO }
    >({
      query: ({ id, data }) => ({
        url: `/jobs/${id}/status`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (_result, _error, arg) => ["Jobs", { type: "Jobs", id: arg.id }],
    }),

    /**
     * 7. PATCH admin approval
     */
    approveJob: builder.mutation<
      { message: string; data: any },
      { id: string; data: AdminApprovalDTO }
    >({
      query: ({ id, data }) => ({
        url: `/jobs/admin/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (_result, _error, arg) => ["Jobs", { type: "Jobs", id: arg.id }],
    }),

    /**
     * 8. DELETE (soft delete) job
     */
    deleteJob: builder.mutation<{ message: string; data: any }, string>({
      query: (id) => ({
        url: `/jobs/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, id) => ["Jobs", { type: "Jobs", id }],
    }),
  }),
});

export const {
  useGetJobListingSummariesQuery,
  useGetRecruiterJobDetailQuery,
  useGetJobForEditQuery,
  useGetRecruiterDashboardQuery,
  useGetRecruiterJobsFilterQuery, // Hook mới
  useCreateJobMutation,
  useUpdateJobMutation,
  useChangeJobStatusMutation,
  useApproveJobMutation,
  useDeleteJobMutation,
} = jobApi;
