/**
 * Common Schema Configuration
 * Reusable schema options to maintain consistency
 */

import { SchemaOptions } from "mongoose";

/**
 * Standard schema options with timestamps and no version key
 */
export const STANDARD_SCHEMA_OPTIONS: SchemaOptions = {
  timestamps: true,
  versionKey: false,
};

/**
 * Schema options with custom timestamp field names
 */
export const CUSTOM_TIMESTAMP_SCHEMA_OPTIONS: SchemaOptions = {
  timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  versionKey: false,
};

/**
 * Schema options without timestamps
 */
export const NO_TIMESTAMP_SCHEMA_OPTIONS: SchemaOptions = {
  timestamps: false,
  versionKey: false,
};

/**
 * Common field validations
 */
export const FIELD_CONSTRAINTS = {
  // Text lengths
  SHORT_TEXT_MAX: 160,
  MEDIUM_TEXT_MAX: 300,
  LONG_TEXT_MAX: 2000,
  EXTRA_LONG_TEXT_MAX: 3000,
  NAME_MAX: 120,
  RECRUITER_NOTE_MAX: 1000,
  
  // Numbers
  MIN_YEAR: 1800,
  MAX_YEAR: 2100,
  MIN_SALARY: 0,
  INITIAL_LOGIN_ATTEMPTS: 0,
  
  // Interview
  MIN_INTERVIEW_DURATION: 15,
  MAX_INTERVIEW_DURATION: 480,
  
  // Time validation regex
  TIME_FORMAT_REGEX: /^\d{2}:\d{2}$/,
} as const;

/**
 * Common field options
 */
export const COMMON_STRING_FIELD = {
  type: String,
  trim: true,
};

export const REQUIRED_STRING_FIELD = {
  type: String,
  required: true,
  trim: true,
};

export const EMAIL_FIELD = {
  type: String,
  required: true,
  lowercase: true,
  trim: true,
};

export const OPTIONAL_EMAIL_FIELD = {
  type: String,
  lowercase: true,
  trim: true,
};
