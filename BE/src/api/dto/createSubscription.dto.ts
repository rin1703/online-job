export class CreateSubscriptionPaymentDTO {
    userId: string;
    packageId: string;
  
    constructor(userId: string, packageId: string) {
      this.userId = userId;
      this.packageId = packageId;
    }
  }
  
  export class SubscriptionWebhookDTO {
    orderCode: string;
    amount: number;
    description: string;
    status: string;
    success: boolean;
  
    constructor(
      orderCode: string,
      amount: number,
      description: string,
      status: string,
      success: boolean
    ) {
      this.orderCode = orderCode;
      this.amount = amount;
      this.description = description;
      this.status = status;
      this.success = success;
    }
  }