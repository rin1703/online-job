/**
 * ========== ADMIN VALIDATION MIDDLEWARE ==========
 * Validates admin-related requests (ban user, delete user, user account list)
 */

import { Request, Response, NextFunction } from "express";
import { sendBadRequestResponse } from "../../../helper/response.helper";
import { BanDuration } from "../../models/enum/banDuration.enum";
import { UserRole } from "../../models/enum/userRole.enum";
import { VALIDATION_CONSTANTS } from "../../../helper/constants.helper";

/**
 * Helper function to validate date format (YYYY-MM-DD)
 */
const isValidDate = (dateString: string): boolean => {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) {
    return false;
  }
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
};

/**
 * Validates ban user request
 * Validates duration and optional reason
 */
export const validateBanUser = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { duration, reason } = req.body;
  const errors: string[] = [];

  // Validate duration
  if (!duration) {
    errors.push("Thời gian ban là bắt buộc");
  } else if (!Object.values(BanDuration).includes(duration)) {
    errors.push(
      `Thời gian ban không hợp lệ. Các giá trị hợp lệ: ${Object.values(BanDuration).join(", ")}`
    );
  }

  // Validate reason (optional, nhưng nếu có thì không được rỗng)
  if (reason !== undefined && reason !== null) {
    if (typeof reason !== "string") {
      errors.push("Lý do ban phải là chuỗi");
    } else if (reason.trim().length === 0) {
      errors.push("Lý do ban không được để trống");
    } else if (reason.trim().length > 500) {
      errors.push("Lý do ban không được vượt quá 500 ký tự");
    }
  }

  if (errors.length > 0) {
    sendBadRequestResponse(res, "Dữ liệu không hợp lệ", {
      errors,
    });
  } else {
    next();
  }
};

/**
 * Validates soft delete user request
 * Validates optional reason
 */
export const validateDeleteUser = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { reason } = req.body;
  const errors: string[] = [];

  // Validate reason (optional, nhưng nếu có thì không được rỗng)
  if (reason !== undefined && reason !== null) {
    if (typeof reason !== "string") {
      errors.push("Lý do xóa phải là chuỗi");
    } else if (reason.trim().length === 0) {
      errors.push("Lý do xóa không được để trống");
    } else if (reason.trim().length > 500) {
      errors.push("Lý do xóa không được vượt quá 500 ký tự");
    }
  }

  if (errors.length > 0) {
    sendBadRequestResponse(res, "Dữ liệu không hợp lệ", {
      errors,
    });
  } else {
    next();
  }
};

/**
 * Validates user account list query parameters
 * Validates pagination, filters, search, dates, and sorting
 */
export const validateUserAccountList = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { page, limit, role, status, search, dateFrom, dateTo, sortBy, sortOrder } = req.query;
  const errors: string[] = [];

  // Validate page
  if (page) {
    const pageNum = parseInt(String(page));
    if (isNaN(pageNum) || pageNum < 1) {
      errors.push("Số trang phải là số nguyên dương");
    }
  }

  // Validate limit
  if (limit) {
    const limitNum = parseInt(String(limit));
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      errors.push("Số lượng bản ghi mỗi trang phải từ 1 đến 100");
    }
  }

  // Validate role
  if (role && !Object.values(UserRole).includes(role as UserRole)) {
    errors.push(`Vai trò không hợp lệ. Các vai trò hợp lệ: ${Object.values(UserRole).join(", ")}`);
  }

  // Validate status
  if (status && !["active", "inactive", "locked"].includes(status as string)) {
    errors.push("Trạng thái không hợp lệ. Các trạng thái hợp lệ: active, inactive, locked");
  }

  // Validate search (email format)
  if (search) {
    const isValidEmail = VALIDATION_CONSTANTS.EMAIL_REGEX.test(String(search));
    if (!isValidEmail) {
      errors.push("Tìm kiếm phải là email hợp lệ (ví dụ: nguyenvana@example.com)");
    }
  }

  // Validate date format
  if (dateFrom && !isValidDate(String(dateFrom))) {
    errors.push("Định dạng ngày bắt đầu không hợp lệ (YYYY-MM-DD)");
  }

  if (dateTo && !isValidDate(String(dateTo))) {
    errors.push("Định dạng ngày kết thúc không hợp lệ (YYYY-MM-DD)");
  }

  // Validate date range
  if (dateFrom && dateTo) {
    const fromDate = new Date(String(dateFrom));
    const toDate = new Date(String(dateTo));
    if (fromDate > toDate) {
      errors.push("Ngày bắt đầu không được lớn hơn ngày kết thúc");
    }
  }

  // Validate sortBy
  if (sortBy && !["createdAt", "updatedAt", "email", "fullName"].includes(sortBy as string)) {
    errors.push("Trường sắp xếp không hợp lệ");
  }

  // Validate sortOrder
  if (sortOrder && !["asc", "desc"].includes(sortOrder as string)) {
    errors.push("Thứ tự sắp xếp phải là 'asc' hoặc 'desc'");
  }

  if (errors.length > 0) {
    sendBadRequestResponse(res, "Dữ liệu không hợp lệ", {
      errors,
    });
  } else {
    next();
  }
};

