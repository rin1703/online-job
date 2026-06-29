import { Request, Response } from "express";
import User from "../models/user.model";
import { RegisterUserDTO } from "../dto/user/registerUser.dto";
import { RegisterRecruiterDTO } from "../dto/recruiter/registerRecuiter.dto";
import { LoginUserDTO } from "../dto/user/loginUser.dto";
import {
  registerUser as registerUserService,
  registerRecruiter as registerRecruiterService,
  loginUser,
} from "../service/user.service";
import { logoutUser } from "../service/auth.service";
import {
  sendSuccessResponse,
  sendErrorResponse,
  handleInternalError,
} from "../../helper/response.helper";
import {
  HTTP_STATUS,
  SUCCESS_MESSAGES,
  ERROR_MESSAGES,
} from "../../helper/constants.helper";
import { AuthenticatedRequest } from "../middleware/auth.middleware";

/**
 * Retrieves list of all users
 * GET /users
 */
export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await User.find();
    sendSuccessResponse(res, SUCCESS_MESSAGES.USERS_FETCHED, users);
  } catch (error) {
    handleInternalError(res, error, "Fetching users");
  }
};

/**
 * Registers a new job seeker
 * POST /users/register
 */
export const registerJobSeeker = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Validation đã được xử lý ở middleware
    const user = await registerUserService(req.body);
    
    if (!user) {
      sendErrorResponse(
        res,
        ERROR_MESSAGES.REGISTRATION_FAILED,
        HTTP_STATUS.BAD_REQUEST
      );
      return;
    }
    
    sendSuccessResponse(
      res,
      SUCCESS_MESSAGES.JOB_SEEKER_REGISTRATION_SUCCESS,
      { userID: user._id },
      HTTP_STATUS.CREATED
    );
  } catch (error) {
    sendErrorResponse(res, error.message, HTTP_STATUS.BAD_REQUEST);
  }
};

/**
 * Registers a new recruiter
 * POST /users/register-recruiter
 */
export const registerRecruiter = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validation đã được xử lý ở middleware
    const dto = new RegisterRecruiterDTO(req.body);
    const user = await registerRecruiterService(dto);
    
    if (!user) {
      sendErrorResponse(
        res,
        ERROR_MESSAGES.REGISTRATION_FAILED,
        HTTP_STATUS.BAD_REQUEST
      );
      return;
    }
    
    sendSuccessResponse(
      res,
      SUCCESS_MESSAGES.RECRUITER_REGISTRATION_SUCCESS,
      { userID: user._id },
      HTTP_STATUS.CREATED
    );
  } catch (error) {
    sendErrorResponse(res, error.message, HTTP_STATUS.BAD_REQUEST);
  }
};

/**
 * Authenticates user and returns JWT token
 * POST /users/login
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validation đã được xử lý ở middleware
    const authResult = await loginUser(req.body);

    sendSuccessResponse(res, SUCCESS_MESSAGES.LOGIN_SUCCESS, authResult);
  } catch (error) {
    sendErrorResponse(res, error.message, HTTP_STATUS.UNAUTHORIZED);
  }
};

/**
 * Logs out user by blacklisting their token
 * POST /auth/logout
 */
export const logout = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      sendErrorResponse(res, "Thiếu token xác thực", HTTP_STATUS.UNAUTHORIZED);
      return;
    }

    const token = authHeader.replace("Bearer ", "");
    const userId = req.user?.userId;

    if (!userId) {
      sendErrorResponse(res, "Không xác định được người dùng", HTTP_STATUS.UNAUTHORIZED);
      return;
    }

    const result = await logoutUser(token, userId);
    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: result.message
    });
  } catch (error: any) {
    sendErrorResponse(res, error.message || "Lỗi khi đăng xuất", HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};
