/**
 * Authentication Service
 * Handles logout functionality
 */

import BlacklistedToken from "../models/blacklistedToken.model";
import jwt from "jsonwebtoken";
import { SECURITY_CONSTANTS } from "../../helper/constants.helper";

/**
 * Logout user by blacklisting their token
 * @param token - JWT token to blacklist
 * @param userId - User ID from token
 * @returns Promise with success message
 */
export const logoutUser = async (token: string, userId: string): Promise<{ success: boolean; message: string }> => {
  try {
    // Decode token để lấy thời gian hết hạn
    const decoded = jwt.verify(token, SECURITY_CONSTANTS.JWT_SECRET) as any;
    const expiresAt = new Date(decoded.exp * 1000); // exp là timestamp in seconds

    // Thêm token vào blacklist
    const blacklistedToken = new BlacklistedToken({
      token,
      userId,
      expiresAt,
    });

    await blacklistedToken.save();

    return {
      success: true,
      message: "Đăng xuất thành công",
    };
  } catch (error: any) {
    throw new Error(`Lỗi khi đăng xuất: ${error.message}`);
  }
};