/**
 * ========== ADMIN ROUTES ==========
 * Routes cho Admin operations
 */

import { Router } from "express";
import { verifyToken, requireRole } from "../middleware/auth.middleware";
import { UserRole } from "../models/enum/userRole.enum";
import {
  validateBanUser,
  validateDeleteUser,
  validateUserAccountList,
} from "../middleware/validation";
import {
  handleGetUserAccountList,
  handleBanUser,
  handleUnbanUser,
  handleDeleteUser,
  handleRestoreUser
} from "../controller/userManagement.controller";

const adminRouter = Router();

/**
 * ============== USER MANAGEMENT ROUTES ==============
 */

/**
 * GET /api/v1/admin/users
 * Lấy danh sách tài khoản người dùng (Admin only)
 */
adminRouter.get(
  "/users",
  verifyToken,
  requireRole(UserRole.ADMIN),
  validateUserAccountList,
  handleGetUserAccountList
);

/**
 * ============== USER BAN ROUTES ==============
 */

/**
 * PUT /api/v1/admin/users/:userId/ban
 * Ban tài khoản người dùng với thời hạn (Admin only)
 */
adminRouter.put(
  "/users/:userId/ban",
  verifyToken,
  requireRole(UserRole.ADMIN),
  validateBanUser,
  handleBanUser
);

/**
 * PUT /api/v1/admin/users/:userId/unban
 * Gỡ ban tài khoản người dùng (Admin only)
 */
adminRouter.put(
  "/users/:userId/unban",
  verifyToken,
  requireRole(UserRole.ADMIN),
  handleUnbanUser
);

/**
 * ============== USER DELETE ROUTES ==============
 */

/**
 * DELETE /api/v1/admin/users/:userId
 * Soft delete tài khoản người dùng (Admin only)
 */
adminRouter.delete(
  "/users/:userId",
  verifyToken,
  requireRole(UserRole.ADMIN),
  validateDeleteUser,
  handleDeleteUser
);

/**
 * PUT /api/v1/admin/users/:userId/restore
 * Khôi phục tài khoản người dùng đã bị xóa (Admin only)
 */
adminRouter.put(
  "/users/:userId/restore",
  verifyToken,
  requireRole(UserRole.ADMIN),
  handleRestoreUser
);

export default adminRouter;




