/**
 * Account Status Enum
 * Quản lý trạng thái tài khoản người dùng (đặc biệt cho Recruiter)
 */
export enum AccountStatus {
  PENDING = "pending",      // Chờ admin duyệt (mặc định cho recruiter mới đăng ký)
  APPROVED = "approved",    // Đã được admin duyệt
  ACTIVE = "active",        // Đã kích hoạt qua email (recruiter có thể login)
  REJECTED = "rejected",    // Bị admin từ chối
  SUSPENDED = "suspended",  // Bị tạm ngưng
}
