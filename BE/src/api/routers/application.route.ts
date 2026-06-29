import { Router } from "express";
import {
  handleApplyJob,
  handleGetApplications,
  handleGetApplicationById,
  handleReviewApplication,
  handleWithdrawApplication,
  handleGetApplicationStats,
  handleUpdateApplicationStatus,
  getAllCVs,
  getCVsByRecruiter,
  viewResumeForApplication,
  downloadResumeForApplication,
} from "../controller/applicationCV.controller";
import { verifyToken, requireRole } from "../middleware/auth.middleware";
import { UserRole } from "../models/enum/userRole.enum";
import { uploadCV } from "../middleware/upload.middleware";
import {
  validateApplicationSubmission,
  validateApplicationReview,
  validateApplicationWithdrawal,
  validateApplicationFilters,
  validateApplicationStatusUpdate
} from "../middleware/validation";

/**
 * ========== APPLICATION ROUTES ==========
 * Định nghĩa các routes cho Application operations
 * Chức năng chính: Recruiter review (approve/reject) applications
 */

const router = Router();

/**
 * @route   POST /api/v1/applications
 * @desc    Apply for a job (JobSeeker only)
 * @access  Private (JobSeeker)
 */
router.post(
  "/",
  verifyToken,
  requireRole(UserRole.JOB_SEEKER),
  validateApplicationSubmission,
  handleApplyJob
);

/**
 * @route   GET /api/v1/applications
 * @desc    Get applications (role-based filtering)
 * @access  Private (JobSeeker sees own, Recruiter sees their jobs, Admin sees all)
 * @query   jobId, status, page, limit, sortBy, sortOrder
 */
router.get("/", verifyToken, validateApplicationFilters, handleGetApplications);

/**
 * @route   GET /api/v1/applications/stats
 * @desc    Get recruiter's application statistics
 * @access  Private (Recruiter)
 */
router.get("/stats", verifyToken, requireRole(UserRole.RECRUITER), handleGetApplicationStats);

/**
 * @route   GET /api/v1/applications/:applicationId
 * @desc    Get application by ID
 * @access  Private (Owner, Recruiter, or Admin)
 */
router.get("/:applicationId", verifyToken, handleGetApplicationById);

/**
 * @route   PUT /api/v1/applications/:applicationId/review
 * @desc    Review application - APPROVE or REJECT (Recruiter only) ⭐ CHỨC NĂNG CHÍNH
 * @access  Private (Recruiter)
 * @body    { status: "approved" | "rejected", recruiterNote?: string }
 */
router.put(
  "/:applicationId/review",
  verifyToken,
  requireRole(UserRole.RECRUITER),
  validateApplicationReview,
  handleReviewApplication
);

/**
 * @route   PUT /api/v1/applications/:applicationId/withdraw
 * @desc    Withdraw application (JobSeeker only)
 * @access  Private (JobSeeker)
 * @body    { reason?: string }
 */
router.put(
  "/:applicationId/withdraw",
  verifyToken,
  requireRole(UserRole.JOB_SEEKER),
  validateApplicationWithdrawal,
  handleWithdrawApplication
);

/**
 * @route   PUT /api/v1/applications/:applicationId/status
 * @desc    Update application status (Recruiter only)
 * @access  Private (Recruiter)
 * @body    { status: "reviewed" | "interview_scheduled" | "approved" | "rejected", recruiterNote?: string }
 */
router.put(
  "/:applicationId/status",
  verifyToken,
  requireRole(UserRole.RECRUITER),
  validateApplicationStatusUpdate,
  handleUpdateApplicationStatus
);

// ============== CV MANAGEMENT ROUTES ==============

/**
 * @route   POST /api/v1/applications/upload/cv
 * @desc    Upload CV file for job application
 * @access  Private (JobSeeker)
 */
router.post(
  "/upload/cv",
  verifyToken,
  uploadCV.single("cv"),
  handleApplyJob
);

/**
 * @route   GET /api/v1/applications/cv
 * @desc    Get all CVs with pagination
 * @access  Private (Recruiter/Admin)
 */
router.get("/cv", verifyToken, requireRole(UserRole.RECRUITER), getAllCVs);

/**
 * @route   GET /api/v1/applications/cv/recruiter
 * @desc    Get CVs by recruiter/company
 * @access  Private (Recruiter/Admin)
 */
router.get("/cv/recruiter", verifyToken, requireRole(UserRole.RECRUITER), getCVsByRecruiter);

/**
 * @route   GET /api/v1/applications/cv/:applicationId
 * @desc    View CV details
 * @access  Private (Recruiter)
 */
router.get(
  "/cv/:applicationId",
  verifyToken,
  requireRole(UserRole.RECRUITER),
  viewResumeForApplication
);

/**
 * @route   GET /api/v1/applications/cv/:applicationId/download
 * @desc    Download CV file
 * @access  Private (Recruiter)
 */
router.get(
  "/cv/:applicationId/download",
  verifyToken,
  requireRole(UserRole.RECRUITER),
  downloadResumeForApplication
);

export default router;
