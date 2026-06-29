/**
 * ========== APPLICATION DTOs ==========
 * Data Transfer Objects cho Application operations
 */

export class CreateApplicationDTO {
  jobId: string;

  // Accept BOTH
  fileBuffer?: Buffer;     // CV dạng file upload
  resumeLink?: string;     // CV dạng link

  coverLetter?: string;
  expectedSalary?: number;
  availableDate?: Date;
  source?: string;

  constructor(data: {
    jobId: string;
    fileBuffer?: Buffer;
    resumeLink?: string;
    coverLetter?: string;
    expectedSalary?: number;
    availableDate?: Date;
    source?: string;
  }) {
    this.jobId = data.jobId;
    this.fileBuffer = data.fileBuffer;
    this.resumeLink = data.resumeLink;
    this.coverLetter = data.coverLetter;
    this.expectedSalary = data.expectedSalary;
    this.availableDate = data.availableDate;
    this.source = data.source;
  }

  validate(): string[] {
    const errors: string[] = [];

    // Validate jobId
    if (!this.jobId) {
      errors.push("ID công việc là bắt buộc");
    }

    // Resume validation
    if (!this.fileBuffer && (!this.resumeLink || this.resumeLink.trim().length === 0)) {
      errors.push("Bạn phải cung cấp CV dạng file hoặc link");
    }

    if (this.coverLetter && this.coverLetter.length > 2000) {
      errors.push("Thư xin việc không được vượt quá 2000 ký tự");
    }

    if (this.expectedSalary && this.expectedSalary < 0) {
      errors.push("Mức lương mong muốn không hợp lệ");
    }

    if (
      this.availableDate &&
      new Date(this.availableDate) < new Date(new Date().setHours(0, 0, 0, 0))
    ) {
      errors.push("Ngày có thể bắt đầu làm không được là ngày trong quá khứ");
    }

    return errors;
  }
}


export class ReviewApplicationDTO {
  status: "approved" | "rejected";
  recruiterNote?: string;

  constructor(data: { status: "approved" | "rejected"; recruiterNote?: string }) {
    this.status = data.status;
    this.recruiterNote = data.recruiterNote;
  }

  validate(): string[] {
    const errors: string[] = [];

    if (!this.status) {
      errors.push("Trạng thái duyệt là bắt buộc");
    }
    if (!["approved", "rejected"].includes(this.status)) {
      errors.push("Trạng thái chỉ có thể là 'approved' hoặc 'rejected'");
    }
    if (this.recruiterNote && this.recruiterNote.length > 1000) {
      errors.push("Ghi chú không được vượt quá 1000 ký tự");
    }
    if (this.status === "rejected" && !this.recruiterNote) {
      errors.push("Ghi chú là bắt buộc khi từ chối đơn ứng tuyển");
    }

    return errors;
  }
}

export class ApplicationFilterDTO {
  jobId?: string;
  jobSeekerId?: string;
  recruiterId?: string;
  status?:
    | "pending"
    | "reviewed"
    | "approved"
    | "rejected"
    | "interview_scheduled"
    | "withdrawn";
  page?: number;
  limit?: number;
  sortBy?: "appliedAt" | "reviewedAt" | "status";
  sortOrder?: "asc" | "desc";

  constructor(data: Partial<ApplicationFilterDTO>) {
    this.jobId = data.jobId;
    this.jobSeekerId = data.jobSeekerId;
    this.recruiterId = data.recruiterId;
    this.status = data.status;
    this.page = data.page || 1;
    this.limit = data.limit || 10;
    this.sortBy = data.sortBy || "appliedAt";
    this.sortOrder = data.sortOrder || "desc";
  }
}

export class WithdrawApplicationDTO {
  reason?: string;

  constructor(data: { reason?: string }) {
    this.reason = data.reason;
  }

  validate(): string[] {
    const errors: string[] = [];

    if (this.reason && this.reason.length > 500) {
      errors.push("Lý do rút đơn không được vượt quá 500 ký tự");
    }

    return errors;
  }
}

export class UpdateApplicationStatusDTO {
  status: "reviewed" | "interview_scheduled" | "approved" | "rejected";
  recruiterNote?: string;

  constructor(data: { status: "reviewed" | "interview_scheduled" | "approved" | "rejected"; recruiterNote?: string }) {
    this.status = data.status;
    this.recruiterNote = data.recruiterNote;
  }

  validate(): string[] {
    const errors: string[] = [];

    if (!this.status) {
      errors.push("Trạng thái là bắt buộc");
    }
    const validStatuses = ["reviewed", "interview_scheduled", "approved", "rejected"];
    if (validStatuses.indexOf(this.status) === -1) {
      errors.push("Trạng thái không hợp lệ");
    }
    if (this.recruiterNote && this.recruiterNote.length > 1000) {
      errors.push("Ghi chú không được vượt quá 1000 ký tự");
    }

    return errors;
  }
}
