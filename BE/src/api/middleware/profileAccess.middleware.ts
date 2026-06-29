import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequest } from "./auth.middleware";
import { UserRole } from "../models/enum/userRole.enum";
import { sendBadRequestResponse } from "../../helper/response.helper";
import User from "../models/user.model";

/**
 * Middleware kiểm tra quyền xem profile JobSeeker
 * Cho phép tất cả user đã xác thực xem profile JobSeeker
 */
export const validateJobSeekerProfileAccess = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // 1. Kiểm tra người đang login đã được xác thực (từ JWT middleware)
    if (!req.user) {
      sendBadRequestResponse(res, "Chưa xác thực người dùng");
      return;
    }

    const { userId } = req.params;

    // 2. Kiểm tra target user tồn tại và có đúng role JobSeeker
    const targetUser = await User.findById(userId).select('role') as any;
    if (!targetUser) {
      res.status(404).json({
        success: false,
        message: "Người dùng không tồn tại",
      });
      return;
    }

    // 3. Kiểm tra target user có phải JobSeeker không
    if (targetUser.role !== 'job_seeker') {
      res.status(400).json({
        success: false,
        message: "Người dùng này không phải là JobSeeker",
      });
      return;
    }

    // 4. Lưu thông tin target user để controller sử dụng
    (req as any).targetUser = targetUser;

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi server khi kiểm tra quyền truy cập",
    });
  }
};

/**
 * Middleware kiểm tra quyền xem profile Recruiter
 * Cho phép tất cả user đã xác thực xem profile Recruiter
 */
export const validateRecruiterProfileAccess = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // 1. Kiểm tra người đang login đã được xác thực (từ JWT middleware)
    if (!req.user) {
      sendBadRequestResponse(res, "Chưa xác thực người dùng");
      return;
    }

    const { userId } = req.params;

    // 2. Kiểm tra target user tồn tại và có đúng role Recruiter
    const targetUser = await User.findById(userId).select('role') as any;
    if (!targetUser) {
      res.status(404).json({
        success: false,
        message: "Người dùng không tồn tại",
      });
      return;
    }

    // 3. Kiểm tra target user có phải Recruiter không
    if (targetUser.role !== 'recruiter') {
      res.status(400).json({
        success: false,
        message: "Người dùng này không phải là Recruiter",
      });
      return;
    }

    // 4. Lưu thông tin target user để controller sử dụng
    (req as any).targetUser = targetUser;

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi server khi kiểm tra quyền truy cập",
    });
  }
};