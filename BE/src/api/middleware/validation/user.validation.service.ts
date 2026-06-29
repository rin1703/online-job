import User from "../../models/user.model";
import { ERROR_MESSAGES, SECURITY_CONSTANTS, DEFAULT_VALUES, getLockTimeInMilliseconds, formatLockTimeMessage, formatLoginAttemptsMessage, formatMaxAttemptsExceededMessage } from "../../../helper/constants.helper";
import { comparePassword } from "../../modules/auth";
import { UserRole } from "../../models/enum/userRole.enum";
import { AccountStatus } from "../../models/enum/accountStatus.enum";

/**
 * User Validation Services
 * Contains all validation logic for user operations
 */

// ==================== EMAIL VALIDATION ====================

/**
 * Checks if email is already registered
 * @throws Error if email already exists
 */
export async function validateEmailAvailability(email: string): Promise<void> {
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new Error((ERROR_MESSAGES as any).EMAIL_ALREADY_EXISTS);
  }
}

// ==================== USER ACCOUNT VALIDATION ====================

/**
 * Validates user account is active and has proper account status
 * @throws Error if account is not valid for login
 */
export function validateUserAccount(user: any): void {
  // Kiểm tra isActive
  if (!(user as any).isActive) {
    throw new Error(ERROR_MESSAGES.ACCOUNT_DISABLED);
  }

  // Kiểm tra accountStatus (đặc biệt cho Recruiter)
  if (user.role === UserRole.RECRUITER) {
    if (user.accountStatus === AccountStatus.PENDING) {
      throw new Error(
        "Tài khoản đang chờ admin duyệt. Vui lòng kiểm tra email để biết thêm thông tin."
      );
    }

    if (user.accountStatus === AccountStatus.APPROVED) {
      throw new Error(
        "Tài khoản chưa được xác thực / bị vô hiệu hóa"
      );
    }

    if (user.accountStatus === AccountStatus.REJECTED) {
      const reason = user.rejectionReason || "Không rõ lý do";
      throw new Error(
        `Tài khoản đã bị từ chối. Lý do: ${reason}`
      );
    }

    if (user.accountStatus === AccountStatus.SUSPENDED) {
      throw new Error("Tài khoản đã bị tạm ngưng. Vui lòng liên hệ admin.");
    }

    // Chỉ cho phép login khi accountStatus = ACTIVE
    if (user.accountStatus !== AccountStatus.ACTIVE) {
      throw new Error(
        `Không thể đăng nhập. Trạng thái tài khoản: ${user.accountStatus}`
      );
    }
  }
}

// ==================== ACCOUNT LOCK VALIDATION ====================

/**
 * Checks if account is temporarily locked
 * @throws Error if account is locked
 */
export async function checkAccountLockStatus(user: any): Promise<void> {
  if (user.lockUntil && user.lockUntil > new Date()) {
    throw new Error(formatLockTimeMessage(user.lockUntil));
  }
}

// ==================== PASSWORD VALIDATION ====================

/**
 * Validates password and manages login attempts
 * Locks account after maximum failed attempts
 * @throws Error if password is invalid or account should be locked
 */
export async function validatePasswordAndUpdateAttempts(
  user: any,
  plainPassword: string
): Promise<void> {
  const isPasswordValid = await comparePassword(plainPassword, (user as any).password);

  if (!isPasswordValid) {
    await handleFailedLoginAttempt(user);
  }

  await resetLoginAttempts(user);
}

/**
 * Handles failed login attempt
 * Increments counter and locks account if needed
 * @throws Error with appropriate message
 */
async function handleFailedLoginAttempt(user: any): Promise<void> {
  (user as any).loginAttempts = ((user as any).loginAttempts || DEFAULT_VALUES.INITIAL_LOGIN_ATTEMPTS) + 1;

  const shouldLockAccount = (user as any).loginAttempts >= SECURITY_CONSTANTS.MAX_LOGIN_ATTEMPTS;

  if (shouldLockAccount) {
    user.lockUntil = new Date(Date.now() + getLockTimeInMilliseconds());
    await user.save();
    throw new Error(formatMaxAttemptsExceededMessage());
  }

  await user.save();

  const remainingAttempts = SECURITY_CONSTANTS.MAX_LOGIN_ATTEMPTS - (user as any).loginAttempts;
  throw new Error(formatLoginAttemptsMessage(remainingAttempts));
}

/**
 * Resets login attempts after successful login
 */
async function resetLoginAttempts(user: any): Promise<void> {
  const needsReset = (user as any).loginAttempts > DEFAULT_VALUES.INITIAL_LOGIN_ATTEMPTS || user.lockUntil;

  if (needsReset) {
    (user as any).loginAttempts = DEFAULT_VALUES.INITIAL_LOGIN_ATTEMPTS;
    user.lockUntil = null;
    await user.save();
  }
}

// ==================== USER LOOKUP ====================

/**
 * Finds user by email address
 * @throws Error if user not found
 */
export async function findUserByEmail(email: string): Promise<any> {
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error(ERROR_MESSAGES.INVALID_EMAIL_PASSWORD);
  }

  return user;
}