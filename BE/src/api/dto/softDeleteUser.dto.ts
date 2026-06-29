/**
 * ========== DELETE USER DTOs ==========
 * Data Transfer Objects cho chức năng Soft Delete tài khoản người dùng
 */

/**
 * DTO cho request soft delete user
 */
export class DeleteUserDTO {
  reason?: string; // Lý do xóa (optional)

  constructor(data: { reason?: string }) {
    this.reason = data.reason;
  }
}

/**
 * DTO cho response sau khi soft delete user
 */
export interface DeleteUserResponseDTO {
  success: boolean;
  message: string;
  data: {
    userId: string;
    email: string;
    fullName: string;
    deletedAt: Date;
    deletedBy: string; // Admin ID
    reason?: string;
  };
}






