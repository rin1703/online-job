export class RecruiterStatusDTO {
  status!: "active" | "hidden" | "closed";

  constructor(partial: Partial<RecruiterStatusDTO> = {}) {
    this.status = partial.status as "active" | "hidden" | "closed";
  }
}

export class AdminApprovalDTO {
  approvalStatus!: "approved" | "rejected";
  rejectionReason?: string;

  constructor(partial: Partial<AdminApprovalDTO> = {}) {
    this.approvalStatus = partial.approvalStatus as "approved" | "rejected";
    this.rejectionReason = partial.rejectionReason;
  }
}
