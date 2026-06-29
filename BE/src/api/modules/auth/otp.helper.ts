/**
 * OTP (One-Time Password) Helper
 * Generates and manages OTP codes for password reset and verification
 */

/**
 * Generates a random 6-digit OTP
 */
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Calculates OTP expiry time
 * @param minutes - Number of minutes until expiry (default: 5)
 */
export function getOTPExpiryTime(minutes: number = 5): Date {
  return new Date(Date.now() + minutes * 60 * 1000);
}
