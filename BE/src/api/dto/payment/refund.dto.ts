export interface BaseRefundDTO {
  reference: string; // orderCode, subscriptionId, etc.
  reason: string;
}

export interface CancelUnusedPackageDTO extends BaseRefundDTO {
  subscriptionId: string;
}

export class RefundTransactionInternalDTO {
  recruiterId: string;
  amount: number; // BE tự tính
  reference: string;
  description: string;
}

export class AdminApproveRefundDTO {
  action: "approve" | "reject";
  notes?: string;
}

// Thêm các trường pagination vào DTO
export class GetRefundRequestDTO {
  status?: string;
  page: number; // Mới
  limit: number; // Mới
}
