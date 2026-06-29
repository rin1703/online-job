/**
 * Application Constants
 * Central location for all magic numbers and repeated values
 * Makes codebase more maintainable and self-documenting
 */

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

/**
 * HTTP Status Codes
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;

/**
 * Security and Authentication Constants
 */
export const SECURITY_CONSTANTS = {
  // Password encryption
  BCRYPT_SALT_ROUNDS: 10,

  // Login attempt limits
  MAX_LOGIN_ATTEMPTS: parseInt(process.env.MAX_LOGIN_ATTEMPTS || "5"),
  LOCK_TIME_MINUTES: parseInt(process.env.LOCK_TIME_MINUTES || "15"),
  MILLISECONDS_PER_MINUTE: 60000,

  // JWT configuration
  JWT_SECRET: process.env.JWT_SECRET || "your_jwt_secret_key_here",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
} as const;

/**
 * File Upload Constants
 */
export const UPLOAD_CONSTANTS = {
  // Avatar upload limits
  MAX_AVATAR_SIZE_MB: 2,
  MAX_AVATAR_SIZE_BYTES: 2 * 1024 * 1024,

  // CV upload limits
  MAX_CV_SIZE_MB: 5,
  MAX_CV_SIZE_BYTES: 5 * 1024 * 1024,

  // Cover letter length
  MAX_COVER_LETTER_LENGTH: 2000,
  MAX_RECRUITER_NOTE_LENGTH: 1000,
  MAX_REJECTION_REASON_LENGTH: 500,

  // Allowed file types
  ALLOWED_IMAGE_MIME_TYPES: [
    "image/jpeg",
    "image/png",
    "image/jpg",
    "image/gif",
  ],
  ALLOWED_CV_MIME_TYPE: "application/pdf",

  // Cloudinary folders
  CLOUDINARY_AVATAR_FOLDER: "jobportal/avatars",
  CLOUDINARY_CV_FOLDER: "jobportal/cvs",
} as const;

/**
 * Validation Constants
 */
export const VALIDATION_CONSTANTS = {
  // Email validation pattern
  EMAIL_REGEX: /^\S+@\S+\.\S+$/,

  // Job title constraints
  MIN_JOB_TITLE_LENGTH: 5,
  MAX_JOB_TITLE_LENGTH: 100,

  // Salary constraints
  MIN_SALARY: 0,
  MIN_POSITIONS: 1,
  DEFAULT_POSITIONS: 1,

  // Required registration fields
  REQUIRED_REGISTRATION_FIELDS: [
    "email",
    "password",
    "firstName",
    "lastName",
    "birthday",
    "phone",
    "role",
  ] as const,

  // Required login fields
  REQUIRED_LOGIN_FIELDS: ["email", "password"] as const,
} as const;

/**
 * Pagination Constants
 */
export const PAGINATION_CONSTANTS = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MIN_PAGE: 1,
  MIN_LIMIT: 1,
  MAX_LIMIT: 100,
} as const;

/**
 * Error Messages
 */
export const ERROR_MESSAGES = {
  // Authentication errors
  EMAIL_ALREADY_EXISTS: "Email already exists",
  INVALID_EMAIL_PASSWORD: "Email hoặc mật khẩu không đúng",
  AUTHENTICATION_FAILED: "Xác thực thất bại",
  ACCOUNT_DISABLED: "Tài khoản đã bị vô hiệu hóa",
  ACCOUNT_LOCKED: "Tài khoản tạm thời bị khóa do đăng nhập sai quá nhiều lần",
  REGISTRATION_FAILED: "Registration failed",

  // Validation errors
  MISSING_FIELDS: "Missing required fields",
  INVALID_EMAIL_FORMAT: "Định dạng email không hợp lệ",
  INVALID_OBJECT_ID: "Invalid ID format",
  INVALID_STATUS_VALUE: "Invalid status value",
  INVALID_APPROVAL_STATUS: "Invalid approval status",

  // File upload errors
  IMAGE_FILES_ONLY: "Chỉ chấp nhận file ảnh!",
  PDF_FILES_ONLY: "Chỉ chấp nhận file PDF!",

  // Resource errors
  PROFILE_NOT_FOUND: "Profile not found",
  USER_NOT_FOUND: "User not found",
  JOB_LISTING_NOT_FOUND: "Job listing not found",
  RESOURCE_NOT_FOUND: "Resource not found",
  INVALID_COMPANY_WEBSITE: "Invalid company website",
  RECRUITER_ID_REQUIRED: "Recruiter ID is required",
  INVALID_JOB_ID: "Invalid job ID",
  DUPLICATE_APPLICATION: "Bạn đã ứng tuyển vào công việc này rồi",

  // Password & OTP errors
  CURRENT_PASSWORD_INCORRECT: "Mật khẩu hiện tại không đúng",
  PASSWORD_RESET_FAILED: "Lỗi khi đặt lại mật khẩu",
  PASSWORD_CHANGE_FAILED: "Lỗi khi đổi mật khẩu",
  OTP_SEND_FAILED: "Lỗi khi gửi mã OTP",
  OTP_INVALID: "Mã OTP không hợp lệ",
  OTP_EXPIRED: "Mã OTP đã hết hạn",

  // Server errors
  SERVER_ERROR: "Internal server error",
  FAILED_TO_CREATE_JOB: "Failed to create job listing",
  FAILED_TO_UPDATE_JOB: "Failed to update job",
} as const;

/**
 * Success Messages
 */
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: "Login successful",
  REGISTRATION_SUCCESS: "User registered successfully",
  JOB_SEEKER_REGISTRATION_SUCCESS: "Job Seeker registered successfully",
  RECRUITER_REGISTRATION_SUCCESS: "Recruiter registered successfully. Please wait for admin approval and check your email to activate your account.",
  USERS_FETCHED: "User list fetched successfully",
  PROFILE_UPDATED: "Profile updated successfully",
  PROFILE_CREATED: "Profile created successfully",
  JOB_CREATED: "Job listing created successfully",
  JOB_UPDATED: "Job updated successfully. Approval status reset to pending.",
  JOB_STATUS_UPDATED: "Job status updated successfully",
  JOB_APPROVAL_UPDATED: "Job approval status updated successfully",
  PASSWORD_CHANGE_SUCCESS: "Password changed successfully",
  PASSWORD_RESET_SUCCESS: "Password reset successfully",
  OTP_SENT: "OTP has been sent to your email. Please check your inbox.",
} as const;

/**
 * Default Values
 */
export const DEFAULT_VALUES = {
  SALARY_CURRENCY: "VND",
  JOB_POSITIONS: 1,
  INTERVIEW_DURATION_MINUTES: 60,
  INITIAL_LOGIN_ATTEMPTS: 0,
  INITIAL_VIEWS: 0,
  IS_ACTIVE: true,
  IS_DELETED: false,
} as const;

/**
 * Utility Functions
 */

/**
 * Calculates lock time in milliseconds
 */
export function getLockTimeInMilliseconds(): number {
  return (
    SECURITY_CONSTANTS.LOCK_TIME_MINUTES *
    SECURITY_CONSTANTS.MILLISECONDS_PER_MINUTE
  );
}

/**
 * Formats remaining lock time message
 */
export function formatLockTimeMessage(lockUntil: Date): string {
  const remainingMinutes = Math.ceil(
    (lockUntil.getTime() - Date.now()) /
      SECURITY_CONSTANTS.MILLISECONDS_PER_MINUTE
  );

  return `${ERROR_MESSAGES.ACCOUNT_LOCKED}. Vui lòng thử lại sau ${remainingMinutes} phút`;
}

/**
 * Formats login attempts remaining message
 */
export function formatLoginAttemptsMessage(remainingAttempts: number): string {
  return `${ERROR_MESSAGES.INVALID_EMAIL_PASSWORD}. Còn ${remainingAttempts} lần thử`;
}

/**
 * Formats max attempts exceeded message
 */
export function formatMaxAttemptsExceededMessage(): string {
  return `Đã đăng nhập sai ${SECURITY_CONSTANTS.MAX_LOGIN_ATTEMPTS} lần. Tài khoản tạm thời bị khóa trong ${SECURITY_CONSTANTS.LOCK_TIME_MINUTES} phút`;
}

/**
 * ==============================================
 * AUTHENTICATION & SECURITY HELPERS
 * ==============================================
 * @deprecated These helpers have been moved to src/api/modules/auth
 * Import from '../api/modules/auth' instead
 */

import * as authModule from "../api/modules/auth";

export const passwordHelper = {
  hash: authModule.hashPassword,
  compare: authModule.comparePassword,
  isHashed: authModule.isPasswordHashed,
};

export const tokenHelper = {
  sign: authModule.generateAccessToken,
  verify: authModule.verifyAccessToken,
  extractFromHeader: authModule.extractTokenFromHeader,
};

export const otpHelper = {
  generate: authModule.generateOTP,
  getExpiryTime: authModule.getOTPExpiryTime,
};
