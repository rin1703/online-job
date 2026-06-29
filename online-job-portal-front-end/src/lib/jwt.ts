/**
 * JWT Helper - Decode JWT token to get user info
 */

export interface DecodedToken {
  userId: string;
  email: string;
  role: 'admin' | 'recruiter' | 'job_seeker';
  firstName: string;
  lastName: string;
  iat?: number;
  exp?: number;
}

/**
 * Check if token is expired - without calling decodeJWT to avoid infinite recursion
 */
export const isTokenExpired = (token: string): boolean => {
  try {
    if (!isValidJWTFormat(token)) return true;

    const base64Url = token.split('.')[1];
    if (!base64Url) return true;

    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    const decoded = JSON.parse(jsonPayload) as DecodedToken;
    if (!decoded || !decoded.exp) return true;

    // Convert exp (seconds) to milliseconds and compare with current time
    return decoded.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

/**
 * Validate JWT token format
 */
export const isValidJWTFormat = (token: string): boolean => {
  // JWT format: header.payload.signature
  if (typeof token !== 'string') return false;
  const parts = token.split('.');
  return parts.length === 3 && parts.every(part => part.length > 0);
};

/**
 * Decode JWT token without verification (client-side only)
 * This function safely decodes JWT tokens and returns null if invalid
 */
export const decodeJWT = (token: string): DecodedToken | null => {
  try {
    // Validate JWT format first
    if (!isValidJWTFormat(token)) {
      console.error('[decodeJWT] Invalid JWT format');
      return null;
    }

    const base64Url = token.split('.')[1];
    if (!base64Url) {
      console.error('[decodeJWT] Missing JWT payload');
      return null;
    }

    // Convert base64url to base64
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');

    // Decode base64 to string
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    const decoded = JSON.parse(jsonPayload) as DecodedToken;

    // Validate required fields
    if (!decoded.userId || !decoded.email || !decoded.role) {
      console.error('[decodeJWT] Missing required fields in token:', {
        userId: !!decoded.userId,
        email: !!decoded.email,
        role: !!decoded.role,
      });
      return null;
    }

    // Check if token is expired
    if (isTokenExpired(token)) {
      console.warn('[decodeJWT] Token is expired');
      return null;
    }

    return decoded;
  } catch (error) {
    console.error('[decodeJWT] Error decoding JWT:', error);
    return null;
  }
};

/**
 * Get user role from token stored in localStorage
 */
export const getUserRole = (): DecodedToken['role'] | null => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;

    const decoded = decodeJWT(token);
    return decoded?.role || null;
  } catch (error) {
    console.error('[getUserRole] Error getting user role:', error);
    return null;
  }
};

/**
 * Get full user info from token stored in localStorage
 */
export const getUserFromToken = (): DecodedToken | null => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('[getUserFromToken] No token found in localStorage');
      return null;
    }

    const decoded = decodeJWT(token);
    if (!decoded) {
      console.error('[getUserFromToken] Failed to decode token');
      return null;
    }

    return decoded;
  } catch (error) {
    console.error('[getUserFromToken] Error getting user from token:', error);
    return null;
  }
};

/**
 * Get user info from token string (without localStorage)
 */
export const decodeUserFromToken = (token: string): DecodedToken | null => {
  try {
    if (!token) {
      console.warn('[decodeUserFromToken] No token provided');
      return null;
    }

    return decodeJWT(token);
  } catch (error) {
    console.error('[decodeUserFromToken] Error decoding user from token:', error);
    return null;
  }
};

/**
 * Check if user is admin
 */
export const isAdmin = (): boolean => {
  return getUserRole() === 'admin';
};

/**
 * Check if user is recruiter
 */
export const isRecruiter = (): boolean => {
  return getUserRole() === 'recruiter';
};

/**
 * Check if user is job seeker
 */
export const isJobSeeker = (): boolean => {
  return getUserRole() === 'job_seeker';
};

