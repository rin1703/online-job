/**
 * Authentication Token Helper
 * Handles JWT token generation, verification, and extraction
 */

import jwt from "jsonwebtoken";
import { UserRole } from "../../models/enum/userRole.enum";
import { SECURITY_CONSTANTS } from "../../../helper/constants.helper";

interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
}

/**
 * Generates JWT access token for authenticated user
 */
export function generateAccessToken(payload: TokenPayload): string {
  const secret = SECURITY_CONSTANTS.JWT_SECRET as jwt.Secret;
  return jwt.sign(payload, secret, {
    expiresIn: SECURITY_CONSTANTS.JWT_EXPIRES_IN,
  } as jwt.SignOptions);
}

/**
 * Verifies and decodes JWT token
 * @throws Error if token is invalid or expired
 */
export function verifyAccessToken(token: string): TokenPayload {
  const secret = SECURITY_CONSTANTS.JWT_SECRET as jwt.Secret;
  return jwt.verify(token, secret) as TokenPayload;
}

/**
 * Extracts token from Authorization header
 * @param authHeader - Authorization header value (format: "Bearer <token>")
 * @returns Token string or null if invalid format
 */
export function extractTokenFromHeader(
  authHeader: string | undefined
): string | null {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.substring(7);
}
