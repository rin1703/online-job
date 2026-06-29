import express from "express";
import {
  createPaymentController,
  webhookController,
  getPaymentHistory,
} from "../controller/payment.controller";
import {
  verifyToken,
  requireRole,
  optionalAuth,
  authMiddleware,
} from "../middleware/auth.middleware";
import { UserRole } from "../models/enum/userRole.enum";

const router = express.Router();

router.post(
  "/create",
  authMiddleware,
  requireRole(UserRole.RECRUITER),
  createPaymentController
);
// router.post("/webhook", express.raw({ type: "*/*" }), webhookController);

router.get(
  "/history",
  verifyToken,
  requireRole(UserRole.RECRUITER),
  getPaymentHistory
);

// router.post(
//   "/:orderCode/request-refund",
//   verifyToken,
//   requireRole(UserRole.RECRUITER),
//   requestRefund
// );

// router.post(
//   "/:orderCode/admin-refund",
//   verifyToken,
//   requireRole(UserRole.ADMIN),
//   adminRefund
// );

export default router;
