/**
 * ========== VALIDATION MIDDLEWARE INDEX ==========
 * Central export point for all validation middleware
 * 
 * ARCHITECTURE:
 * - Validation logic is ONLY in middleware (not in DTOs, controllers, or helpers)
 * - Constants and utility functions are in ./constants.ts
 * - Middleware validates requests before they reach controllers
 * - Controllers should never validate - they assume data is already validated
 */

// Export validation constants and utilities
export * from "./constants";

// Profile validations
export {
  validateProfileUpsert,
  validateProfilePatch,
  validateWorkExperience,
  validateEducation,
  validateProject,
  validateCertificate
} from "./profile.validation";

// Application validations
export {
  validateApplicationSubmission,
  validateApplicationReview,
  validateApplicationWithdrawal,
  validateApplicationFilters,
  validateApplicationStatusUpdate
} from "./application.validation";

// Job listing validations
export {
  validateJobCreation,
  validateJobUpdate,
  validateJobStatusUpdate,
  validateJobApproval,
  validateJobFilters
} from "./job.validation";

// Notification, broadcast, report, interview validations
export {
  validateBroadcast,
  validateJobReport,
  validateUserReport,
  validateReportResolution,
  validateInterviewCreation,
  validateInterviewResponse,
  validateInterviewResult
} from "./notification.validation";

// User, authentication, password validations
export {
  validateUserRegistration,
  validateRecruiterRegistration,
  validateLogin,
  validateChangePassword,
  validateForgotPassword,
  validateResetPassword
} from "./user.validation";

// Admin validations
export {
  validateBanUser,
  validateDeleteUser,
  validateUserAccountList
} from "./admin.validation";

// User validation services (business logic validations)
export {
  validateEmailAvailability,
  validateUserAccount,
  checkAccountLockStatus,
  validatePasswordAndUpdateAttempts,
  findUserByEmail
} from "./user.validation.service";
