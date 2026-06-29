import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UserRole } from "../models/enum/userRole.enum";
import { RegisterRecruiterDTO } from "../dto/recruiter/registerRecuiter.dto";
import {
  VALIDATION_CONSTANTS,
  ERROR_MESSAGES,
} from "../../helper/constants.helper";
import { sendBadRequestResponse } from "../../helper/response.helper";
import { validateEmailFormat } from "../../helper/utils.helper";
import { verifyAccessToken, extractTokenFromHeader } from "../modules/auth";
import BlacklistedToken from "../models/blacklistedToken.model";

/**
 * Validates user registration request body
 * Ensures all required fields are present and properly formatted
 */
export const validateRegisterUser = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { email, password, firstName, lastName, birthday, phone, role } =
    req.body;
  const missingFields = findMissingRegistrationFields(req.body);

  if (missingFields.length > 0) {
    sendBadRequestResponse(res, ERROR_MESSAGES.MISSING_FIELDS, {
      missing: missingFields,
    });
    return;
  }

  const emailValidationError = validateEmailFormat(email);
  if (emailValidationError) {
    sendBadRequestResponse(res, emailValidationError);
    return;
  }

  // Block Admin role registration - Admin must be added directly to DB
  if (role === UserRole.ADMIN || role === "admin") {
    res.status(403).json({
      ok: false,
      message:
        "Cannot register as Admin. Admin accounts must be created manually in the database.",
    });
    return;
  }

  // Check valid role (only recruiter and job_seeker allowed)
  const allowedRoles = [UserRole.RECRUITER, UserRole.JOB_SEEKER];
  if (!allowedRoles.includes(role as UserRole)) {
    res.status(400).json({
      ok: false,
      message: "Invalid role. Allowed roles: recruiter, job_seeker",
    });
    return;
  }

  next();
};

/**
 * Validates recruiter registration with company information
 */
export const validateRecruiterRegister = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const body = req.body as RegisterRecruiterDTO;
  const missingFields: string[] = [];

  // Basic user fields validation
  if (!body.email) missingFields.push("email");
  if (!body.password) missingFields.push("password");
  if (!body.firstName) missingFields.push("firstName");
  if (!body.lastName) missingFields.push("lastName");
  if (!body.birthday) missingFields.push("birthday");
  if (!body.phone) missingFields.push("phone");

  // Company specific fields validation
  if (!body.companyName) missingFields.push("companyName");
  if (!body.taxCode) missingFields.push("taxCode");

  // Location fields validation
  if (!body.location) {
    missingFields.push("location");
  } else {
    if (!body.location.address) missingFields.push("location.address");
    if (!body.location.city) missingFields.push("location.city");
    if (!body.location.district) missingFields.push("location.district");
  }

  if (missingFields.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields",
      missing: missingFields,
    });
  }

  // Tax code validation
  const taxCodeRegex = /^[A-Z0-9\-]{10,20}$/;
  if (!taxCodeRegex.test(body.taxCode)) {
    return res.status(400).json({
      success: false,
      message: "Invalid tax code format. Must be 10-20 characters, uppercase letters, numbers, and hyphens only.",
    });
  }

  next();
};

/**
 * Validates user login request body
 * Ensures email and password are provided and email is properly formatted
 */
export const validateLoginUser = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { email } = req.body;
  const missingFields = findMissingLoginFields(req.body);

  if (missingFields.length > 0) {
    sendBadRequestResponse(res, "Thiếu thông tin đăng nhập", {
      missing: missingFields,
    });
    return;
  }

  const emailValidationError = validateEmailFormat(email);
  if (emailValidationError) {
    sendBadRequestResponse(res, emailValidationError);
    return;
  }

  next();
};

/**
 * ========== AUTHENTICATION MIDDLEWARE ==========
 * Authenticates JWT token from Authorization header
 */

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: UserRole;
    firstName?: string;
    lastName?: string;
  };
}

export const verifyToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    console.log("[verifyToken] Auth Header:", authHeader);

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Thiếu token xác thực",
      });
    }

    const token = extractTokenFromHeader(authHeader);
    if (!token) {
      console.log("[verifyToken] No token extracted");
      return res.status(401).json({
        success: false,
        message: "Token không hợp lệ",
      });
    }

    // Kiểm tra token có bị blacklist không
    const isBlacklisted = await BlacklistedToken.findOne({ token });
    if (isBlacklisted) {
      return res.status(401).json({
        success: false,
        message: "Token đã bị vô hiệu hóa",
      });
    }

    const decoded = verifyAccessToken(token);
    console.log("Decoded token:", decoded);
    req.user = decoded;
    next();
  } catch (error: any) {
    console.error("[verifyToken] Error:", error.message);
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token đã hết hạn",
      });
    }
    return res.status(401).json({
      success: false,
      message: "Token không hợp lệ",
    });
  }
};

//For guests who don't have JWT token
export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  // Không có token → Guest user
  if (!authHeader) {
    req.user = undefined;
    return next();
  }

  const token = extractTokenFromHeader(authHeader);

  if (!token) {
    req.user = undefined;
    return next();
  }

  try {
    // Kiểm tra token có bị blacklist không
    const isBlacklisted = await BlacklistedToken.findOne({ token });
    if (isBlacklisted) {
      req.user = undefined;
      return next();
    }

    const decoded = verifyAccessToken(token);
    req.user = decoded; // User hợp lệ
  } catch (error) {
    req.user = undefined; // Token lỗi / hết hạn → vẫn cho vào như guest
  }

  return next();
};

/**
 * ========== ROLE-BASED ACCESS CONTROL ==========
 * Checks access permissions based on role
 */

export const requireRole = (...allowedRoles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Chưa xác thực người dùng",
        });
      }

      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: "Bạn không có quyền truy cập tài nguyên này",
        });
      }

      next();
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Lỗi server khi kiểm tra quyền",
      });
    }
  };
};

// ==================== Helper Functions ====================

/**
 * Finds missing required fields for user registration
 *
 * @param body - Request body object
 * @returns Array of missing field names
 */
function findMissingRegistrationFields(body: any): string[] {
  const requiredFields = VALIDATION_CONSTANTS.REQUIRED_REGISTRATION_FIELDS;
  const missingFields: string[] = [];

  for (const field of requiredFields) {
    if (!body[field]) {
      missingFields.push(field);
    }
  }

  return missingFields;
}

/**
 * Finds missing required fields for user login
 *
 * @param body - Request body object
 * @returns Array of missing field names
 */
function findMissingLoginFields(body: any): string[] {
  const requiredFields = VALIDATION_CONSTANTS.REQUIRED_LOGIN_FIELDS;
  const missingFields: string[] = [];

  for (const field of requiredFields) {
    if (!body[field]) {
      missingFields.push(field);
    }
  }

  return missingFields;
}

// ==================== Backward Compatibility ====================

/**
 * Alias for verifyToken to maintain backward compatibility
 * Used in existing routes that reference authMiddleware
 */
export const authMiddleware = verifyToken;

/**
 * ========== APPLICATION ACCESS CONTROL ==========
 * Middleware kiểm tra quyền truy cập applications
 */

export const requireApplicationAccess = (action: 'view' | 'review' | 'withdraw' | 'update') => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: "Chưa xác thực người dùng",
        });
        return;
      }

      const userRole = req.user.role;
      const userId = req.user.userId;

      // Admin có toàn quyền
      if (userRole === UserRole.ADMIN) {
        return next();
      }

      // Các action khác nhau có rule khác nhau
      switch (action) {
        case 'view':
          // Tất cả user đã login đều có thể view (logic filter sẽ xử lý trong controller)
          return next();

        case 'review':
        case 'update':
          // Chỉ recruiter mới có thể review/update applications
          if (userRole !== UserRole.RECRUITER) {
            res.status(403).json({
              success: false,
              message: "Chỉ Recruiter mới có quyền thực hiện hành động này",
            });
            return;
          }
          return next();

        case 'withdraw':
          // Chỉ job seeker mới có thể withdraw application của mình
          if (userRole !== UserRole.JOB_SEEKER) {
            res.status(403).json({
              success: false,
              message: "Chỉ Job Seeker mới có quyền rút đơn ứng tuyển",
            });
            return;
          }
          return next();

        default:
          res.status(400).json({
            success: false,
            message: "Action không hợp lệ",
          });
          return;
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Lỗi server khi kiểm tra quyền truy cập application",
      });
    }
  };
};
