/**
 * Re-export types from Redux API to maintain single source of truth
 * This ensures component types match the actual API response structure
 */
export type {
  SocialLink,
  WorkExperience,
  Education,
  Project,
  Certificate,
  JobSkills,
  UserProfile,
  UpdateProfileDTO,
  AddWorkExperienceDTO,
  UpdateWorkExperienceDTO,
} from '@/redux/features/profile/profile.types';

// Alias UserProfile as Profile for backward compatibility
export type { UserProfile as Profile } from '@/redux/features/profile/profile.types';

// Re-export SkillCategory from Redux types (single source of truth)
export type { SkillCategory } from '@/redux/features/profile/profile.types';
