/**
 * ========== VALIDATION CONSTANTS ==========
 * Centralized validation rules and error messages
 * Used by validation middleware across the application
 */

export const VALIDATION_RULES = {
  // Password
  MIN_PASSWORD_LENGTH: 6,
  MAX_PASSWORD_LENGTH: 128,
  PASSWORD_PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
  
  // Email
  EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  
  // OTP
  OTP_LENGTH: 6,
  OTP_PATTERN: /^\d{6}$/,
  OTP_EXPIRY_MINUTES: 5,
  
  // Name
  MIN_NAME_LENGTH: 2,
  MAX_NAME_LENGTH: 100,
  
  // Phone
  PHONE_PATTERN: /^[0-9+\-() ]{8,20}$/,
  
  // Job & Application
  MIN_TITLE_LENGTH: 3,
  MAX_TITLE_LENGTH: 200,
  MAX_DESCRIPTION_LENGTH: 5000,
  MAX_COVER_LETTER_LENGTH: 2000,
  
  // Salary
  MIN_SALARY: 0,
  MAX_SALARY: 1000000000,
} as const;

export const VALIDATION_ERROR_MESSAGES = {
  // Required fields
  FIELD_REQUIRED: (field: string) => `${field} là bắt buộc`,
  MISSING_FIELDS: "Thiếu thông tin bắt buộc",
  
  // Email
  EMAIL_INVALID: "Định dạng email không hợp lệ",
  EMAIL_REQUIRED: "Email là bắt buộc",
  EMAIL_NOT_FOUND: "Email không tồn tại trong hệ thống",
  
  // Password
  PASSWORD_TOO_SHORT: `Mật khẩu phải có ít nhất ${VALIDATION_RULES.MIN_PASSWORD_LENGTH} ký tự`,
  PASSWORD_TOO_LONG: `Mật khẩu không được vượt quá ${VALIDATION_RULES.MAX_PASSWORD_LENGTH} ký tự`,
  PASSWORD_MISMATCH: "Mật khẩu mới và xác nhận mật khẩu không khớp",
  PASSWORD_SAME_AS_OLD: "Mật khẩu mới phải khác mật khẩu hiện tại",
  PASSWORD_INCORRECT: "Mật khẩu hiện tại không đúng",
  PASSWORD_WEAK: "Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số",
  PASSWORD_REQUIRED: "Mật khẩu là bắt buộc",
  
  // OTP
  OTP_INVALID_FORMAT: "Mã OTP phải là 6 chữ số",
  OTP_REQUIRED: "Mã OTP là bắt buộc",
  OTP_EXPIRED: "Mã OTP đã hết hạn",
  OTP_INCORRECT: "Mã OTP không đúng",
  OTP_ALREADY_USED: "Mã OTP đã được sử dụng",
  
  // Account
  ACCOUNT_NOT_FOUND: "Không tìm thấy người dùng",
  ACCOUNT_DISABLED: "Tài khoản đã bị vô hiệu hóa",
  ACCOUNT_LOCKED: "Tài khoản đã bị khóa",
  
  // Phone
  PHONE_INVALID: "Số điện thoại không hợp lệ",
  
  // Name
  NAME_REQUIRED: "Họ tên là bắt buộc",
  NAME_TOO_SHORT: `Họ tên phải có ít nhất ${VALIDATION_RULES.MIN_NAME_LENGTH} ký tự`,
  NAME_TOO_LONG: `Họ tên không được vượt quá ${VALIDATION_RULES.MAX_NAME_LENGTH} ký tự`,
} as const;

/**
 * ========== UTILITY FUNCTIONS ==========
 * Pure validation helper functions
 */

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  if (!email || typeof email !== "string") return false;
  return VALIDATION_RULES.EMAIL_PATTERN.test(email.trim());
};

/**
 * Validate password strength
 */
export const isValidPassword = (password: string): boolean => {
  if (!password || typeof password !== "string") return false;
  return password.length >= VALIDATION_RULES.MIN_PASSWORD_LENGTH &&
         password.length <= VALIDATION_RULES.MAX_PASSWORD_LENGTH;
};

/**
 * Validate password strength with pattern
 */
export const isStrongPassword = (password: string): boolean => {
  if (!isValidPassword(password)) return false;
  return VALIDATION_RULES.PASSWORD_PATTERN.test(password);
};

/**
 * Validate OTP format
 */
export const isValidOTP = (otp: string): boolean => {
  if (!otp || typeof otp !== "string") return false;
  return VALIDATION_RULES.OTP_PATTERN.test(otp.trim());
};

/**
 * Validate phone number
 */
export const isValidPhone = (phone: string): boolean => {
  if (!phone || typeof phone !== "string") return false;
  return VALIDATION_RULES.PHONE_PATTERN.test(phone.trim());
};

/**
 * Check if array has missing fields
 */
export const getMissingFields = (requiredFields: string[], data: Record<string, any>): string[] => {
  return requiredFields.filter(field => 
    data[field] === undefined || 
    data[field] === null || 
    (typeof data[field] === "string" && data[field].trim().length === 0)
  );
};

/**
 * Validate field length
 */
export const isValidLength = (value: string, min: number, max: number): boolean => {
  if (!value || typeof value !== "string") return false;
  const length = value.trim().length;
  return length >= min && length <= max;
};
