import express from "express";
import { getMyWalletBalance } from "../controller/wallet.controller";
import { authMiddleware, requireRole } from "../middleware/auth.middleware";
import { UserRole } from "../models/enum/userRole.enum";

const router = express.Router();

// Lấy thông tin ví (balance) theo recruiterId
router.get(
  "/balance",
  authMiddleware,
  requireRole(UserRole.RECRUITER),
  getMyWalletBalance
);

export default router;
