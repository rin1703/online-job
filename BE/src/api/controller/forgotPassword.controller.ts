import { Request, Response } from "express";
import { ForgotPasswordDTO, ResetPasswordDTO } from "../dto/password/forgotPassword.dto";
import { sendOTP, resetPassword } from "../service/forgotPassword.service";
import { HTTP_STATUS, SUCCESS_MESSAGES, ERROR_MESSAGES } from "../../helper/constants.helper";
import { handleInternalError } from "../../helper/response.helper";

export const handleForgotPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Validation đã được xử lý ở middleware
    const dto = new ForgotPasswordDTO(req.body);
    await sendOTP(dto);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: SUCCESS_MESSAGES.OTP_SENT,
    });
  } catch (error) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: error.message || ERROR_MESSAGES.OTP_SEND_FAILED,
    });
  }
};

export const handleResetPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Validation đã được xử lý ở middleware
    const dto = new ResetPasswordDTO(req.body);
    await resetPassword(dto);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: SUCCESS_MESSAGES.PASSWORD_RESET_SUCCESS,
    });
  } catch (error) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: error.message || ERROR_MESSAGES.PASSWORD_RESET_FAILED,
    });
  }
};