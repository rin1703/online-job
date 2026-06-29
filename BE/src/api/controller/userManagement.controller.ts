/**
 * ========== USER MANAGEMENT CONTROLLER ==========
 * Controller xử lý tất cả HTTP requests cho User Management (Admin)
 * Bao gồm: Ban/Unban, Soft Delete/Restore, Get User List
 */

import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { BanUserDTO } from "../dto/banUser.dto";
import { DeleteUserDTO } from "../dto/softDeleteUser.dto";
import { GetUserAccountListDTO } from "../dto/userAccountList.dto";
import {
  banUserService,
  unbanUserService,
  deleteUserService,
  restoreUserService,
  getUserAccountListService
} from "../service/userManagement.service";
import {
  sendSuccessResponse,
  sendErrorResponse,
} from "../../helper/response.helper";
import { HTTP_STATUS } from "../../helper/constants.helper";

const getParamString = (param: string | string[] | undefined, name = "parameter") => {
  if (!param) {
    throw new Error(`${name} is required`);
  }
  return Array.isArray(param) ? param[0] : param;
};

/**
 * ========== BAN/UNBAN USER ENDPOINTS ==========
 */

/**
 * Ban tài khoản người dùng với thời hạn (Admin only)
 * POST /api/v1/admin/users/:userId/ban
 */
export const handleBanUser = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = getParamString(req.params.userId, "userId");
    const adminId = req.user?.userId;

    if (!adminId) {
      sendErrorResponse(res, "Không xác định được admin", HTTP_STATUS.UNAUTHORIZED);
      return;
    }

    const dto = new BanUserDTO({
      duration: req.body.duration,
      reason: req.body.reason,
    });

    const result = await banUserService(userId, dto, adminId);
    sendSuccessResponse(res, result.message, result.data, HTTP_STATUS.OK);
  } catch (error: any) {
    console.error("Error in handleBanUser:", error);
    sendErrorResponse(
      res,
      error.message || "Lỗi khi ban tài khoản",
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
};

/**
 * Unban tài khoản người dùng (Admin only)
 * POST /api/v1/admin/users/:userId/unban
 */
export const handleUnbanUser = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = getParamString(req.params.userId, "userId");
    const adminId = req.user?.userId;

    if (!adminId) {
      sendErrorResponse(res, "Không xác định được admin", HTTP_STATUS.UNAUTHORIZED);
      return;
    }

    const result = await unbanUserService(userId, adminId);
    sendSuccessResponse(res, result.message, result.data, HTTP_STATUS.OK);
  } catch (error: any) {
    console.error("Error in handleUnbanUser:", error);
    sendErrorResponse(
      res,
      error.message || "Lỗi khi gỡ ban tài khoản",
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
};

/**
 * ========== SOFT DELETE/RESTORE USER ENDPOINTS ==========
 */

/**
 * Soft delete tài khoản người dùng (Admin only)
 * DELETE /api/v1/admin/users/:userId
 */
export const handleDeleteUser = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = getParamString(req.params.userId, "userId");
    const adminId = req.user?.userId;

    if (!adminId) {
      sendErrorResponse(res, "Không xác định được admin", HTTP_STATUS.UNAUTHORIZED);
      return;
    }

    const dto = new DeleteUserDTO({
      reason: req.body?.reason,
    });

    const result = await deleteUserService(userId, dto, adminId);
    sendSuccessResponse(res, result.message, result.data, HTTP_STATUS.OK);
  } catch (error: any) {
    console.error("Error in handleDeleteUser:", error);
    sendErrorResponse(
      res,
      error.message || "Lỗi khi xóa tài khoản",
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
};

/**
 * Restore tài khoản người dùng (Admin only)
 * POST /api/v1/admin/users/:userId/restore
 */
export const handleRestoreUser = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = getParamString(req.params.userId, "userId");
    const adminId = req.user?.userId;

    if (!adminId) {
      sendErrorResponse(res, "Không xác định được admin", HTTP_STATUS.UNAUTHORIZED);
      return;
    }

    const result = await restoreUserService(userId, adminId);
    sendSuccessResponse(res, result.message, result.data, HTTP_STATUS.OK);
  } catch (error: any) {
    console.error("Error in handleRestoreUser:", error);
    sendErrorResponse(
      res,
      error.message || "Lỗi khi khôi phục tài khoản",
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
};

/**
 * ========== USER LIST ENDPOINT ==========
 */

/**
 * Lấy danh sách tài khoản người dùng (Admin only)
 * GET /api/v1/admin/users
 */
export const handleGetUserAccountList = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const dto = new GetUserAccountListDTO({
      page: req.query.page as string | undefined,
      limit: req.query.limit as string | undefined,
      role: req.query.role as string | undefined,
      status: req.query.status as string | undefined,
      search: req.query.search as string | undefined,
      dateFrom: req.query.dateFrom as string | undefined,
      dateTo: req.query.dateTo as string | undefined,
      sortBy: req.query.sortBy as string | undefined,
      sortOrder: req.query.sortOrder as string | undefined,
    });

    const result = await getUserAccountListService(dto);

    res.status(HTTP_STATUS.OK).json({
      success: result.success,
      message: result.message,
      data: result.data,
      pagination: result.pagination,
      filters: result.filters,
    });
  } catch (error: any) {
    console.error("Error in handleGetUserAccountList:", error);
    sendErrorResponse(
      res,
      error.message || "Lỗi khi lấy danh sách người dùng",
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
};