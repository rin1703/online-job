// @ts-nocheck
import User from "../models/user.model";
import OTP from "../models/otp.model";
import { sendOTPEmail } from "./email.service";
import { ForgotPasswordDTO, ResetPasswordDTO } from "../dto/password/forgotPassword.dto";
import { ERROR_MESSAGES } from "../../helper/constants.helper";
import { hashPassword, generateOTP, getOTPExpiryTime } from "../modules/auth";
import { VALIDATION_RULES, VALIDATION_ERROR_MESSAGES } from "../middleware/validation/constants";

export const sendOTP = async (dto: ForgotPasswordDTO): Promise<boolean> => {
  try {
    const user = await User.findOne({ email: dto.email.toLowerCase() });
    if (!user) {
      throw new Error(VALIDATION_ERROR_MESSAGES.EMAIL_NOT_FOUND);
    }

    if (!user.isActive) {
      throw new Error(VALIDATION_ERROR_MESSAGES.ACCOUNT_DISABLED);
    }

    // Delete old OTPs
    await OTP.deleteMany({ email: dto.email.toLowerCase() });

    // Generate new OTP
    const otpCode = generateOTP();
    const expiresAt = getOTPExpiryTime(VALIDATION_RULES.OTP_EXPIRY_MINUTES);

    // Save OTP to database
    await OTP.create({
      email: dto.email.toLowerCase(),
      otp: otpCode,
      expiresAt: expiresAt,
      isUsed: false,
    });

    // Send OTP via email
    await sendOTPEmail(dto.email, otpCode);

    return true;
  } catch (error) {
    throw error;
  }
};

export const resetPassword = async (
  dto: ResetPasswordDTO
): Promise<boolean> => {
  try {
    // Verify passwords match
    if (dto.newPassword !== dto.confirmPassword) {
      throw new Error(VALIDATION_ERROR_MESSAGES.PASSWORD_MISMATCH);
    }

    // Find OTP
    const otpRecord = await OTP.findOne({
      email: dto.email.toLowerCase(),
      otp: dto.otp,
      isUsed: false,
    });

    if (!otpRecord) {
      throw new Error(VALIDATION_ERROR_MESSAGES.OTP_INCORRECT);
    }

    // Check if OTP expired
    if (otpRecord.expiresAt < new Date()) {
      await OTP.deleteOne({ _id: otpRecord._id });
      throw new Error(VALIDATION_ERROR_MESSAGES.OTP_EXPIRED);
    }

    // Find user
    const user = await User.findOne({ email: dto.email.toLowerCase() });
    if (!user) {
      throw new Error(VALIDATION_ERROR_MESSAGES.EMAIL_NOT_FOUND);
    }

    // Hash new password
    const hashedPassword = await hashPassword(dto.newPassword);

    // Update password
    await User.findByIdAndUpdate(
      user._id,
      { password: hashedPassword },
      { runValidators: false }
    );

    // Mark OTP as used
    otpRecord.isUsed = true;
    await otpRecord.save();

    // Delete all OTPs for this email
    await OTP.deleteMany({ email: dto.email.toLowerCase() });

    return true;
  } catch (error) {
    throw error;
  }
};
