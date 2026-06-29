export class RefundRequestDTO {
  reason: string; // Lý do refund từ user/admin
}

export class RefundResponseDTO {
  orderCode: string;
  amount: number;
  status: string;
  refundStatus: string;
  refundReason?: string | null;
  message?: string;
}
