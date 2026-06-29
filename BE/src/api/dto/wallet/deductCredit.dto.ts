export class DeductCreditDTO {
  amount: number;
  reference?: string | null;
  description?: string | null;
  subscriptionId?: string | null;

  constructor(data: any) {
    this.amount = data.amount;
    this.reference = data.reference || null;
    this.description = data.description || null;
    this.subscriptionId = data.subscriptionId || null;
  }
}
