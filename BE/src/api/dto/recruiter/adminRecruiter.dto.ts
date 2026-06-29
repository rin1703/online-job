/**
 * Admin Recruiter Management DTOs
 * DTOs cho các chức năng admin quản lý recruiter
 */

/**
 * DTO để lấy danh sách recruiter chờ duyệt
 */
export class GetPendingRecruitersDTO {
  page?: number;
  limit?: number;
  sortBy?: string; // createdAt, email, firstName
  sortOrder?: "asc" | "desc";

  constructor(data: Partial<GetPendingRecruitersDTO> = {}) {
    this.page = data.page || 1;
    this.limit = data.limit || 10;
    this.sortBy = data.sortBy || "createdAt";
    this.sortOrder = data.sortOrder || "desc";
  }
}

/**
 * DTO để admin duyệt recruiter
 */
export class ApproveRecruiterDTO {
  recruiterId: string;

  constructor(data: { recruiterId: string }) {
    this.recruiterId = data.recruiterId;
  }

  validate(): string[] {
    const errors: string[] = [];
    
    if (!this.recruiterId) {
      errors.push("recruiterId là bắt buộc");
    }

    return errors;
  }
}

/**
 * DTO để admin từ chối recruiter
 */
export class RejectRecruiterDTO {
  recruiterId: string;
  rejectionReason: string;

  constructor(data: { recruiterId: string; rejectionReason: string }) {
    this.recruiterId = data.recruiterId;
    this.rejectionReason = data.rejectionReason;
  }

  validate(): string[] {
    const errors: string[] = [];
    
    if (!this.recruiterId) {
      errors.push("recruiterId là bắt buộc");
    }

    if (!this.rejectionReason || this.rejectionReason.trim().length === 0) {
      errors.push("Lý do từ chối không được để trống");
    } else if (this.rejectionReason.length < 10) {
      errors.push("Lý do từ chối phải có ít nhất 10 ký tự");
    } else if (this.rejectionReason.length > 500) {
      errors.push("Lý do từ chối không được vượt quá 500 ký tự");
    }

    return errors;
  }
}

/**
 * DTO để kích hoạt tài khoản recruiter qua token
 */
export class ActivateRecruiterAccountDTO {
  token: string;

  constructor(data: { token: string }) {
    this.token = data.token;
  }

  validate(): string[] {
    const errors: string[] = [];
    
    if (!this.token || this.token.trim().length === 0) {
      errors.push("Token kích hoạt là bắt buộc");
    }

    return errors;
  }
}
