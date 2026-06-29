import { Router } from "express";
import {
  getJobListings,
  createJobListing,
  getJobListingDetail,
  getFilteredJobs,
  deleteJobListing,
  getRecruiterJobDashboard,
  updateJobListing,
  updateRecruiterJobStatus,
  updateAdminJobApproval,
  filterRecruiterJobs,
  getJobFilterOptions,
} from "../controller/jobListing.controller";

import {
  verifyToken,
  requireRole,
  optionalAuth,
  authMiddleware,
} from "../middleware/auth.middleware";
import { UserRole } from "../models/enum/userRole.enum";

import {
  validateJobCreation,
  validateJobUpdate,
  validateJobStatusUpdate,
  validateJobApproval,
  validateJobFilters,
} from "../middleware/validation";

import { enforceJobPostCreationLimit } from "../middleware/checkSubscription.middleware";

const router = Router();

/* ---------- GET FILTER OPTIONS (PUBLIC) ---------- */
// Route này nên đặt trước các route động để tránh conflict
router.get("/filter-options", getJobFilterOptions);

/* ---------- PUBLIC + JOBSEEKER FILTER ---------- */
router.get("/", optionalAuth, getJobListings);
router.get("/search", optionalAuth, getFilteredJobs);

/* ---------- RECRUITER FILTER | NEW ROUTE ADDED ---------- */
router.get(
  "/recruiter/filter",
  authMiddleware,
  requireRole(UserRole.RECRUITER),
  validateJobFilters,
  filterRecruiterJobs
);

/* ---------- GET DETAIL ---------- */
router.get("/:id", optionalAuth, getJobListingDetail);

/* ---------- RECRUITER DASHBOARD ---------- */
router.get(
  "/recruiter/dashboard",
  authMiddleware,
  requireRole(UserRole.RECRUITER),
  getRecruiterJobDashboard
);

/* ---------- CREATE JOB LISTING ---------- */
router.post(
  "/new",
  authMiddleware,
  requireRole(UserRole.RECRUITER),
  validateJobCreation,
  enforceJobPostCreationLimit,
  createJobListing
);

/* ---------- UPDATE JOB LISTING ---------- */
router.patch(
  "/:id",
  verifyToken,
  requireRole(UserRole.RECRUITER),
  validateJobUpdate,
  updateJobListing
);

/* ---------- UPDATE STATUS BY RECRUITER ---------- */
router.patch(
  "/:id/status",
  verifyToken,
  requireRole(UserRole.RECRUITER),
  validateJobStatusUpdate,
  updateRecruiterJobStatus
);

/* ---------- ADMIN APPROVAL ---------- */
router.patch(
  "/admin/:id",
  verifyToken,
  requireRole(UserRole.ADMIN),
  validateJobApproval,
  updateAdminJobApproval
);

/* ---------- DELETE JOB LISTING ---------- */
router.delete(
  "/:id",
  verifyToken,
  requireRole(UserRole.RECRUITER),
  deleteJobListing
);

export default router;
