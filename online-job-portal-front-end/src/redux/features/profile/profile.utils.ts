// Utility functions for profile data transformation

import type { UpdateProfileDTO, WorkExperience, Education } from './profile.types';

/**
 * Filters out FE-only fields before sending to BE
 *
 * FE-ONLY fields that will be removed:
 * - website (not in BE schema)
 *
 * @param data - Profile data from FE
 * @returns Cleaned data ready for BE
 */
export function sanitizeProfileDataForBE<T extends UpdateProfileDTO>(data: T): Omit<T, 'website' | 'user'> {
  const { website, user, ...cleanData } = data as any; // Treat as any to strip user property
  return cleanData;
}

/**
 * Gets userId from profile for API calls
 * Handles both 'user' and 'userId' field names for backward compatibility
 *
 * @param profile - User profile object
 * @returns userId string
 */
export function getUserIdFromProfile(profile: { user?: string; userId?: string }): string | undefined {
  return profile.user || profile.userId;
}

/**
 * Sanitize date fields to ensure consistent format
 * Converts empty strings to undefined, keeps valid date strings
 */
function sanitizeDate(date: string | Date | null | undefined): string | undefined {
  if (!date) return undefined;
  if (typeof date === 'string' && date.trim() === '') return undefined;

  // If it's already a Date object, convert to ISO string
  if (date instanceof Date) {
    return date.toISOString();
  }

  // If it's a string, return as-is (BE will parse it)
  return date;
}

/**
 * Sanitize WorkExperience dates
 */
export function sanitizeWorkExperience(exp: WorkExperience): WorkExperience {
  return {
    ...exp,
    startDate: sanitizeDate(exp.startDate) || '',
    endDate: exp.isCurrent ? undefined : sanitizeDate(exp.endDate),
  };
}

/**
 * Sanitize Education dates
 */
export function sanitizeEducation(edu: Education): Education {
  return {
    ...edu,
    startDate: sanitizeDate(edu.startDate) || '',
    endDate: sanitizeDate(edu.endDate),
  };
}

/**
 * Sanitize all dates in UpdateProfileDTO
 */
export function sanitizeDatesInProfile(data: UpdateProfileDTO): UpdateProfileDTO {
  return {
    ...data,
    workExperiences: data.workExperiences?.map(sanitizeWorkExperience),
    education: data.education?.map(sanitizeEducation),
  };
}
