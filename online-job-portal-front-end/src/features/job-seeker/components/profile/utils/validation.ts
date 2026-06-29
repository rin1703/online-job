/**
 * Validation utilities for profile forms
 */

import type {
  WorkExperience,
  Education,
  Project,
} from '@/redux/features/profile/profile.types';

export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Validate Work Experience
 */
export function validateWorkExperience(
  exp: WorkExperience
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!exp.title?.trim()) {
    errors.push({ field: 'title', message: 'Job title is required' });
  }

  if (!exp.company?.trim()) {
    errors.push({ field: 'company', message: 'Company name is required' });
  }

  if (!exp.startDate) {
    errors.push({ field: 'startDate', message: 'Start date is required' });
  }

  // Validate endDate is after startDate if both exist
  if (exp.startDate && exp.endDate && !exp.isCurrent) {
    const start = new Date(exp.startDate);
    const end = new Date(exp.endDate);
    if (end < start) {
      errors.push({
        field: 'endDate',
        message: 'End date must be after start date',
      });
    }
  }

  return errors;
}

/**
 * Validate Education
 */
export function validateEducation(edu: Education): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!edu.school?.trim()) {
    errors.push({ field: 'school', message: 'School name is required' });
  }

  if (!edu.degree?.trim()) {
    errors.push({ field: 'degree', message: 'Degree is required' });
  }

  if (!edu.startDate) {
    errors.push({ field: 'startDate', message: 'Start date is required' });
  }

  // Validate endDate is after startDate if both exist
  if (edu.startDate && edu.endDate) {
    const start = new Date(edu.startDate);
    const end = new Date(edu.endDate);
    if (end < start) {
      errors.push({
        field: 'endDate',
        message: 'End date must be after start date',
      });
    }
  }

  return errors;
}

/**
 * Validate Project
 */
export function validateProject(project: Project): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!project.name?.trim()) {
    errors.push({ field: 'name', message: 'Project name is required' });
  }

  // Validate GitHub URL format if provided
  if (project.githubUrl && project.githubUrl.trim()) {
    if (!isValidUrl(project.githubUrl)) {
      errors.push({
        field: 'githubUrl',
        message: 'Invalid GitHub URL format',
      });
    }
  }

  // Validate Demo URL format if provided
  if (project.demoUrl && project.demoUrl.trim()) {
    if (!isValidUrl(project.demoUrl)) {
      errors.push({
        field: 'demoUrl',
        message: 'Invalid demo URL format',
      });
    }
  }

  return errors;
}

/**
 * Validate Private Information
 */
export function validatePrivateInfo(data: {
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
}): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!data.name?.trim()) {
    errors.push({ field: 'name', message: 'Name is required' });
  }

  // Validate email format if provided
  if (data.email && data.email.trim()) {
    if (!isValidEmail(data.email)) {
      errors.push({
        field: 'email',
        message: 'Invalid email format',
      });
    }
  }

  // Validate phone format if provided
  if (data.phone && data.phone.trim()) {
    if (!isValidPhone(data.phone)) {
      errors.push({
        field: 'phone',
        message: 'Invalid phone format',
      });
    }
  }

  // Validate location if provided
  if (data.location && data.location.trim()) {
    const locationErrors = validateLocation(data.location);
    errors.push(...locationErrors);
  }

  return errors;
}

/**
 * Validate Location
 */
export function validateLocation(location: string): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!location || !location.trim()) {
    return errors; // Location is optional
  }

  // Check minimum length
  if (location.trim().length < 3) {
    errors.push({
      field: 'location',
      message: 'Location must be at least 3 characters',
    });
  }

  // Check maximum length
  if (location.length > 200) {
    errors.push({
      field: 'location',
      message: 'Location must not exceed 200 characters',
    });
  }

  return errors;
}

/**
 * Validate Social Link
 */
export function validateSocialLink(
  platform: string,
  url: string
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!platform?.trim()) {
    errors.push({ field: 'platform', message: 'Platform is required' });
  }

  if (!url?.trim()) {
    errors.push({ field: 'url', message: 'URL is required' });
  }

  if (url && url.trim()) {
    if (!isValidUrl(url)) {
      errors.push({ field: 'url', message: 'Invalid URL format' });
    }

    // Check if URL matches platform
    const platformLower = platform.toLowerCase();
    const urlLower = url.toLowerCase();

    if (
      platformLower === 'github' &&
      !urlLower.includes('github.com')
    ) {
      errors.push({
        field: 'url',
        message: 'GitHub URL should contain github.com',
      });
    } else if (
      platformLower === 'linkedin' &&
      !urlLower.includes('linkedin.com')
    ) {
      errors.push({
        field: 'url',
        message: 'LinkedIn URL should contain linkedin.com',
      });
    } else if (
      platformLower === 'facebook' &&
      !urlLower.includes('facebook.com')
    ) {
      errors.push({
        field: 'url',
        message: 'Facebook URL should contain facebook.com',
      });
    } else if (
      platformLower === 'instagram' &&
      !urlLower.includes('instagram.com')
    ) {
      errors.push({
        field: 'url',
        message: 'Instagram URL should contain instagram.com',
      });
    }
  }

  return errors;
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone format (international or local)
 */
export function isValidPhone(phone: string): boolean {
  // Remove all non-digit characters for validation
  const digitsOnly = phone.replace(/\D/g, '');
  // Accept 10-15 digits (covers most international formats)
  return digitsOnly.length >= 10 && digitsOnly.length <= 15;
}

/**
 * Format validation errors for display
 */
export function formatValidationErrors(errors: ValidationError[]): string {
  if (errors.length === 0) return '';
  if (errors.length === 1) return errors[0].message;
  return errors.map((e) => `• ${e.message}`).join('\n');
}
