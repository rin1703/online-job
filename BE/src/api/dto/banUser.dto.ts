/**
 * ========== BAN USER DTOs ==========
 * Data Transfer Objects cho chức năng Ban tài khoản người dùng
 */

import { BanDuration } from "../models/enum/banDuration.enum";

/**
 * DTO cho request ban user
 */
export class BanUserDTO {
  duration: BanDuration;
  reason?: string; // Lý do ban (optional)

  constructor(data: { duration: string; reason?: string }) {
    this.duration = data.duration as BanDuration;
    this.reason = data.reason;
  }
}

/**
 * DTO cho response sau khi ban user
 */
export interface BanUserResponseDTO {
  success: boolean;
  message: string;
  data: {
    userId: string;
    email: string;
    fullName: string;
    bannedUntil: Date;
    banDuration: BanDuration;
    banDurationLabel: string;
    reason?: string;
    bannedBy: string; // Admin ID
    bannedAt: Date;
  };
}





