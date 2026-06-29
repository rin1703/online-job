import { Request, Response } from "express";
import { ChangePasswordDTO } from "../dto/password/changePassword.dto";
import { changePassword } from "../service/password.service";
import { HTTP_STATUS, SUCCESS_MESSAGES, ERROR_MESSAGES } from "../../helper/constants.helper";

export const handleChangePassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Validation đã được xử lý ở middleware
    const dto = new ChangePasswordDTO({
      userId: (req as any).user.userId,
      oldPassword: req.body.oldPassword,
      newPassword: req.body.newPassword,
    });
    await changePassword(dto);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: SUCCESS_MESSAGES.PASSWORD_CHANGE_SUCCESS,
    });
  } catch (error) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: error.message || ERROR_MESSAGES.PASSWORD_CHANGE_FAILED,
    });
  }
};