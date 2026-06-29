/**
 * Password Helper
 * Handles password hashing and comparison
 */

import bcrypt from "bcrypt";
import { SECURITY_CONSTANTS } from "../../../helper/constants.helper";

/**
 * Hashes a plain text password using bcrypt
 */
export async function hashPassword(plainPassword: string): Promise<string> {
  const salt = await bcrypt.genSalt(SECURITY_CONSTANTS.BCRYPT_SALT_ROUNDS);
  return bcrypt.hash(plainPassword, salt);
}

/**
 * Compares plain password with hashed password
 * @returns True if passwords match
 */
export async function comparePassword(
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(plainPassword, hashedPassword);
}

/**
 * Checks if a password string is already hashed
 */
export function isPasswordHashed(password: string): boolean {
  return /^\$2[aby]\$/.test(password);
}
