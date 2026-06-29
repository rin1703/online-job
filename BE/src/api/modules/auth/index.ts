/**
 * Authentication Module - Central Export
 * 
 * This module consolidates all authentication-related functionality:
 * - Token generation and verification
 * - Password hashing and comparison
 * - OTP generation
 */

export {
  generateAccessToken,
  verifyAccessToken,
  extractTokenFromHeader,
} from "./token.helper";

export { hashPassword, comparePassword, isPasswordHashed } from "./password.helper";

export { generateOTP, getOTPExpiryTime } from "./otp.helper";
