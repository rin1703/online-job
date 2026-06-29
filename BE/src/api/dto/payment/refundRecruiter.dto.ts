export class CreateRefundRequestDTO {
  reference?: string;
  reason: string;
  refundType: "unused" | "system";
}
