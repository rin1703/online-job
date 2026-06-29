import express from "express";
import {
  buySubscription,
  getCurrentSubscriptionController,
  getCurrentSubscriptionWithPackagesController,
  getSubscriptionInfoController,
  getSubscriptionHistoryController,
} from "../controller/subscription.controller";
import { authMiddleware, requireRole } from "../middleware/auth.middleware";
import { UserRole } from "../models/enum/userRole.enum";

const router = express.Router();

// Mua subscription bằng số dư ví (wallet)
router.post(
  "/purchase/wallet",
  authMiddleware,
  requireRole(UserRole.RECRUITER),
  buySubscription
);

// Lấy subscription hiện tại của user (chỉ active subscription)
router.get("/current/:userId", getCurrentSubscriptionController);

// Lấy subscription hiện tại kèm danh sách tất cả packages (với trường buyed)
router.get("/current-with-packages/:userId", getCurrentSubscriptionWithPackagesController);

// Lấy thông tin gói đang dùng (bao gồm free plan nếu không có subscription)
router.get("/info/:userId", getSubscriptionInfoController);

// Lấy lịch sử tất cả subscriptions
router.get("/history/:userId", getSubscriptionHistoryController);

export default router;
