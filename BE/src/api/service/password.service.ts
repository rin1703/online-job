import User from "../models/user.model";
import { ChangePasswordDTO } from "../dto/password/changePassword.dto";
import { ERROR_MESSAGES } from "../../helper/constants.helper";
import { hashPassword, comparePassword, isPasswordHashed } from "../modules/auth";

export const changePassword = async (
    dto: ChangePasswordDTO
): Promise<boolean> => {
    try {
        const user = await User.findById(dto.userId);

        if (!user) {
            throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);
        }

        if (!(user as any).isActive) {
            throw new Error(ERROR_MESSAGES.ACCOUNT_DISABLED);
        }

        // Verify current password
        const isPasswordValid = isPasswordHashed((user as any).password)
            ? await comparePassword(dto.oldPassword, (user as any).password)
            : dto.oldPassword === (user as any).password;

        if (!isPasswordValid) {
            throw new Error(ERROR_MESSAGES.CURRENT_PASSWORD_INCORRECT);
        }

        // Hash new password
        const hashedNewPassword = await hashPassword(dto.newPassword);

        // Update password
        await User.findByIdAndUpdate(
          dto.userId,
          { password: hashedNewPassword },
          { runValidators: false }
        );

        return true;
    } catch (error) {
        throw error;
    }
};
