import { baseApi } from '@/redux/baseApi';
import type {
  UserProfile,
  ProfileResponse,
  UpdateProfileDTO,
  AddWorkExperienceDTO,
  UpdateWorkExperienceDTO,
  UploadResponse,
} from './profile.types';
import {
  sanitizeProfileDataForBE,
  sanitizeDatesInProfile,
} from './profile.utils';

export const profileApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Get current user profile (from JWT token)
     * Endpoint: GET /api/v1/profile
     */
    getProfile: builder.query<UserProfile, void>({
      query: () => `/profile`,
      transformResponse: (response: ProfileResponse) => response.data,
      providesTags: ['Profile'],
    }),

    /**
     * Create or update complete profile (from JWT token)
     * Endpoint: PUT /api/v1/profile
     * Note: Filters out FE-only fields (website) and sanitizes dates before sending to BE
     */
    createOrUpdateProfile: builder.mutation<UserProfile, UpdateProfileDTO>({
      query: (data) => ({
        url: `/profile`,
        method: 'PUT',
        body: sanitizeProfileDataForBE(sanitizeDatesInProfile(data)),
      }),
      transformResponse: (response: ProfileResponse) => response.data,
      invalidatesTags: ['Profile'],
    }),

    /**
     * Partially update profile (from JWT token)
     * Endpoint: PATCH /api/v1/profile
     * Note: Filters out FE-only fields (website) and sanitizes dates before sending to BE
     */
    updateProfile: builder.mutation<UserProfile, Partial<UpdateProfileDTO>>({
      query: (data) => ({
        url: `/profile`,
        method: 'PATCH',
        body: sanitizeProfileDataForBE(sanitizeDatesInProfile(data as UpdateProfileDTO)),
      }),
      transformResponse: (response: ProfileResponse) => response.data,
      invalidatesTags: ['Profile'],
    }),

    /**
     * Add work experience to current user profile
     * Endpoint: POST /api/v1/profile/experiences
     */
    addWorkExperience: builder.mutation<UserProfile, AddWorkExperienceDTO>({
      query: (experience) => ({
        url: `/profile/experiences`,
        method: 'POST',
        body: experience,
      }),
      transformResponse: (response: ProfileResponse) => response.data,
      invalidatesTags: ['Profile'],
    }),

    /**
     * Update work experience for current user
     * Endpoint: PUT /api/v1/profile/experiences/:expId
     */
    updateWorkExperience: builder.mutation<
      UserProfile,
      { expId: string; experience: UpdateWorkExperienceDTO }
    >({
      query: ({ expId, experience }) => ({
        url: `/profile/experiences/${expId}`,
        method: 'PUT',
        body: experience,
      }),
      transformResponse: (response: ProfileResponse) => response.data,
      invalidatesTags: ['Profile'],
    }),

    /**
     * Delete work experience for current user
     * Endpoint: DELETE /api/v1/profile/experiences/:expId
     */
    deleteWorkExperience: builder.mutation<UserProfile, string>({
      query: (expId) => ({
        url: `/profile/experiences/${expId}`,
        method: 'DELETE',
      }),
      transformResponse: (response: ProfileResponse) => response.data,
      invalidatesTags: ['Profile'],
    }),

    /**
     * Upload avatar image for current user
     * Endpoint: POST /api/v1/profile/avatar
     * Accepts FormData with 'avatar' field
     */
    uploadAvatar: builder.mutation<UploadResponse['data'], FormData>({
      query: (formData) => ({
        url: `/profile/avatar`,
        method: 'POST',
        body: formData,
      }),
      transformResponse: (response: UploadResponse) => response.data,
      invalidatesTags: ['Profile'],
    }),

    /**
     * Upload CV (PDF) for current user
     * Endpoint: POST /api/v1/profile/cv
     * Accepts FormData with 'cv' field
     */
    uploadCV: builder.mutation<UploadResponse['data'], FormData>({
      query: (formData) => ({
        url: `/profile/cv`,
        method: 'POST',
        body: formData,
      }),
      transformResponse: (response: UploadResponse) => response.data,
      invalidatesTags: ['Profile'],
    }),
    /**
     * Get JobSeeker profile for viewing (public)
     * Endpoint: GET /api/v1/profile/jobseeker/:userId
     */
    getJobSeekerProfile: builder.query<UserProfile, string>({
      query: (userId) => `/profile/jobseeker/${userId}`,
      transformResponse: (response: ProfileResponse) => response.data,
    }),

    /**
     * Get Recruiter profile for viewing (public)
     * Endpoint: GET /api/v1/profile/recruiter/:userId
     */
    getRecruiterProfile: builder.query<any, string>({
      query: (userId) => `/profile/recruiter/${userId}`,
      transformResponse: (response: any) => response.data,
    }),
  }),
});

export const {
  useGetProfileQuery,
  useCreateOrUpdateProfileMutation,
  useUpdateProfileMutation,
  useAddWorkExperienceMutation,
  useUpdateWorkExperienceMutation,
  useDeleteWorkExperienceMutation,
  useUploadAvatarMutation,
  useUploadCVMutation,
  useGetJobSeekerProfileQuery,
  useGetRecruiterProfileQuery,
} = profileApi;
