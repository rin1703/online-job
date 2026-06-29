export class PayOSWebhookDTO {
  orderCode: string;
  amount: number;
  success: boolean;
  status: string;

  constructor(
    orderCode: string,
    amount: number,
    success: boolean,
    status: string
  ) {
    this.orderCode = orderCode;
    this.amount = amount;
    this.success = success;
    this.status = status;
  }
}
