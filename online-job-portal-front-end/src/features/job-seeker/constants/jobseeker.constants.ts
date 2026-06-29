/**
 * Global constants for JobSeeker features
 */

// File Upload Limits
export const FILE_UPLOAD = {
  CV_MAX_SIZE_MB: 5,
  CV_MAX_SIZE_BYTES: 5 * 1024 * 1024, // 5MB in bytes
  ALLOWED_CV_TYPES: ['application/pdf'],
  AVATAR_MAX_SIZE_MB: 2,
  AVATAR_MAX_SIZE_BYTES: 2 * 1024 * 1024, // 2MB in bytes
  ALLOWED_AVATAR_TYPES: ['image/jpeg', 'image/png', 'image/jpg'],
} as const;

// Text Field Limits
export const TEXT_LIMITS = {
  COVER_LETTER_MIN: 10,
  COVER_LETTER_MAX: 2000,
  RESUME_TEXT_MIN: 10,
  RESUME_TEXT_MAX: 2000,
  BIO_MAX: 500,
  JOB_TITLE_MAX: 100,
  COMPANY_NAME_MAX: 100,
  DESCRIPTION_MAX: 500,
  WITHDRAW_REASON_MAX: 500,
} as const;

// Pagination
export const PAGINATION = {
  JOBS_PER_PAGE_DEFAULT: 10,
  JOBS_PER_PAGE_OPTIONS: [10, 20, 50, 100],
  APPLICATIONS_PER_PAGE: 10,
  RECENT_JOBS_LIMIT: 10,
  SIMILAR_JOBS_LIMIT: 3,
} as const;

// UI Dimensions
export const UI_DIMENSIONS = {
  JOB_CARD_MIN_HEIGHT_NORMAL: 280,
  JOB_CARD_MIN_HEIGHT_UNIFORM: 300,
  SIMILAR_JOBS_MAX_HEIGHT: 900,
  BENEFITS_BADGE_MAX_WIDTH: 120,
} as const;

// Salary
export const SALARY = {
  MIN_VALUE: 0,
  BILLION_THRESHOLD: 1000000000,
  MILLION_THRESHOLD: 1000000,
} as const;

// Session Storage Keys
export const STORAGE_KEYS = {
  APPLICATIONS_SCROLL_POSITION: 'jobseeker_applications_scroll_position',
  APPLICATIONS_FILTER_SEARCH: 'jobseeker_applications_filter_search',
  APPLICATIONS_FILTER_STATUS: 'jobseeker_applications_filter_status',
  APPLICATIONS_FILTER_PAGE: 'jobseeker_applications_filter_page',
  JOBS_VIEW_MODE: 'jobseeker_jobs_view_mode',
  JOBS_SORT_BY: 'jobseeker_jobs_sort_by',
  JOBS_FILTERS: 'jobseeker_jobs_filters',
  SAVED_JOBS: 'jobseeker_saved_jobs',
  RECENT_JOBS: 'jobseeker_recent_jobs',
  PREVIOUS_LOCATION: 'jobseeker_previous_location',
} as const;

// Date & Time
export const DATE_TIME = {
  DAYS_IN_WEEK: 7,
  DAYS_IN_MONTH: 30,
  DAYS_IN_YEAR: 365,
  MS_PER_DAY: 1000 * 60 * 60 * 24,
} as const;

// Validation
export const VALIDATION = {
  MIN_SALARY: 0,
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 128,
  MIN_PHONE_LENGTH: 10,
  MAX_PHONE_LENGTH: 15,
} as const;

// Application Status Workflow
export const APPLICATION_WORKFLOW = {
  CANNOT_WITHDRAW_STATUSES: ['approved', 'rejected', 'withdrawn'],
  ACTIVE_STATUSES: ['pending', 'reviewed', 'interview_scheduled'],
} as const;
