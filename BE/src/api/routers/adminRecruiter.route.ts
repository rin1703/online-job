import { Router } from "express";
import {
  handleGetAllRecruiters,
  handleGetPendingRecruiters,
  handleGetRecruiterDetail,
  handleApproveRecruiter,
  handleRejectRecruiter,
  handleResendActivationEmail,
  handleActivateAccount,
} from "../controller/adminRecruiter.controller";
import { verifyToken } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/auth.middleware";
import { UserRole } from "../models/enum/userRole.enum";

const adminRecruiterRouter = Router();

/**
 * ==============================================
 * ADMIN RECRUITER MANAGEMENT ROUTES
 * ==============================================
 * Tất cả routes đều yêu cầu admin authentication
 * Base path: /api/v1/admin/recruiters
 */

/**
 * GET /api/v1/admin/recruiters
 * Lấy danh sách tất cả recruiter
 * Query params: page, limit, sortBy, sortOrder
 */
adminRecruiterRouter.get(
  "/",
  verifyToken,
  requireRole(UserRole.ADMIN),
  handleGetAllRecruiters
);

/**
 * GET /api/v1/admin/recruiters/pending
 * Lấy danh sách recruiter chờ duyệt (accountStatus = pending)
 * Query params: page, limit, sortBy, sortOrder
 */
adminRecruiterRouter.get(
  "/pending",
  verifyToken,
  requireRole(UserRole.ADMIN),
  handleGetPendingRecruiters
);

/**
 * GET /api/v1/admin/recruiters/:id
 * Lấy chi tiết một recruiter
 */
adminRecruiterRouter.get(
  "/:id",
  verifyToken,
  requireRole(UserRole.ADMIN),
  handleGetRecruiterDetail
);

/**
 * POST /api/v1/admin/recruiters/:id/approve
 * Admin duyệt recruiter
 * - Gửi email kích hoạt với token (hết hạn 30 phút)
 */
adminRecruiterRouter.post(
  "/:id/approve",
  verifyToken,
  requireRole(UserRole.ADMIN),
  handleApproveRecruiter
);

/**
 * POST /api/v1/admin/recruiters/activate/:token
 * Kích hoạt tài khoản recruiter qua token
 */
adminRecruiterRouter.post("/activate/:token", handleActivateAccount);

/**
 * POST /api/v1/admin/recruiters/:id/reject
 * Admin từ chối recruiter
 * Body: { rejectionReason: string }
 */
adminRecruiterRouter.post(
  "/:id/reject",
  verifyToken,
  requireRole(UserRole.ADMIN),
  handleRejectRecruiter
);

/**
 * POST /api/v1/admin/recruiters/:id/resend-activation
 * Gửi lại email kích hoạt cho recruiter đã được duyệt
 */
adminRecruiterRouter.post(
  "/:id/resend-activation",
  verifyToken,
  requireRole(UserRole.ADMIN),
  handleResendActivationEmail
);

export default adminRecruiterRouter;
