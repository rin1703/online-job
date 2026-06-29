// Export all profile-related functionality from a single entry point

// Types
export type {
  UserProfile,
  SocialLink,
  WorkExperience,
  Education,
  Project,
  Certificate,
  JobSkills,
  UpdateProfileDTO,
  AddWorkExperienceDTO,
  UpdateWorkExperienceDTO,
  ProfileResponse,
  UploadResponse,
} from './profile.types';

// API & Hooks
export {
  profileApi,
  useGetProfileQuery,
  useCreateOrUpdateProfileMutation,
  useUpdateProfileMutation,
  useAddWorkExperienceMutation,
  useUpdateWorkExperienceMutation,
  useDeleteWorkExperienceMutation,
  useUploadAvatarMutation,
  useUploadCVMutation,
} from './profileApi';

// Utils
export { sanitizeProfileDataForBE, getUserIdFromProfile } from './profile.utils';
