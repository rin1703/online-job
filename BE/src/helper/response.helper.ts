/**
 * Response Helper
 * Centralized response formatting to avoid code duplication
 * Ensures consistent API response structure across all endpoints
 */

import { Response } from "express";
import { HTTP_STATUS } from "./constants.helper";

/**
 * Standard success response structure
 */
export interface SuccessResponse<T = any> {
  success: true;
  message: string;
  data?: T;
}

/**
 * Standard error response structure
 */
export interface ErrorResponse {
  success: false;
  message: string;
  errors?: any;
}

/**
 * Gửi phản hồi thành công chuẩn hóa
 * 
 * @param res - Đối tượng phản hồi Express
 * @param message - Thông báo thành công cần hiển thị
 * @param data - Dữ liệu tùy chọn
 * @param statusCode - Mã trạng thái HTTP (mặc định là 200)
 */
export function sendSuccessResponse<T>(
  res: Response,
  message: string,
  data?: T,
  statusCode: number = HTTP_STATUS.OK
): void {
  const response: SuccessResponse<T> = {
    success: true,
    message,
  };

  if (data !== undefined) {
    response.data = data;
  }

  res.status(statusCode).json(response);
}

/**
 * Gửi phản hồi lỗi chuẩn hóa
 * 
 * @param res - Đối tượng phản hồi Express
 * @param message - Thông báo lỗi cần hiển thị
 * @param statusCode - Mã trạng thái HTTP (mặc định là 500)
 * @param errors - Chi tiết lỗi bổ sung tùy chọn
 */
export function sendErrorResponse(
  res: Response,
  message: string,
  statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR,
  errors?: any
): void {
  const response: ErrorResponse = {
    success: false,
    message,
  };

  if (errors !== undefined) {
    response.errors = errors;
  }

  res.status(statusCode).json(response);
}

/**
 * Gửi phản hồi 404 Không tìm thấy
 * 
 * @param res - Đối tượng phản hồi Express
 * @param resourceName - Tên của tài nguyên không tìm thấy
 */
export function sendNotFoundResponse(
  res: Response,
  resourceName: string = "Resource"
): void {
  sendErrorResponse(
    res,
    `${resourceName} not found`,
    HTTP_STATUS.NOT_FOUND
  );
}

/**
 * Gửi phản hồi 400 Yêu cầu không hợp lệ
 * 
 * @param res - Đối tượng phản hồi Express
 * @param message - Thông báo lỗi xác thực
 * @param errors - Chi tiết lỗi xác thực tùy chọn
 */
export function sendBadRequestResponse(
  res: Response,
  message: string,
  errors?: any
): void {
  sendErrorResponse(
    res,
    message,
    HTTP_STATUS.BAD_REQUEST,
    errors
  );
}

/**
 * Gửi phản hồi 401 Không được phép
 * 
 * @param res - Đối tượng phản hồi Express
 * @param message - Thông báo lỗi xác thực
 */
export function sendUnauthorizedResponse(
  res: Response,
  message: string = "Unauthorized"
): void {
  sendErrorResponse(
    res,
    message,
    HTTP_STATUS.UNAUTHORIZED
  );
}

/**
 * Handles internal server errors with consistent formatting
 * 
 * @param res - Express response object
 * @param error - Error object
 * @param context - Context description for error tracking
 */
export function handleInternalError(
  res: Response,
  error: any,
  context: string = "Operation"
): void {
  const errorMessage = error?.message || `${context} failed`;
  
  sendErrorResponse(
    res,
    errorMessage,
    HTTP_STATUS.INTERNAL_SERVER_ERROR
  );
}
