import { adminGetAllRefundRequests } from "../controller/refund.controller";
import express from "express";
import {
  createRefundRequest,
  adminApproveRefund,
  getRefundRequests,
} from "../controller/refund.controller";
import { authMiddleware, requireRole } from "../middleware/auth.middleware";
import { UserRole } from "../models/enum/userRole.enum";

const router = express.Router();

/**
 * Recruiter tạo yêu cầu refund
 */
router.post(
  "/create",
  authMiddleware,
  requireRole(UserRole.RECRUITER),
  createRefundRequest
);

/**
 * Recruiter xem danh sách refund của mình
 */
router.get(
  "/",
  authMiddleware,
  requireRole(UserRole.RECRUITER),
  getRefundRequests
);

router.get(
  "/admin",
  authMiddleware,
  requireRole(UserRole.ADMIN),
  adminGetAllRefundRequests
);
/**
 * Admin approve/reject refund request
 */
router.put(
  "/admin/:id",
  authMiddleware,
  requireRole(UserRole.ADMIN),
  adminApproveRefund
);

export default router;
