export class AddCreditDTO {
  amount: number;
  reference?: string | null;
  description?: string | null;

  constructor(data: any) {
    this.amount = data.amount;
    this.reference = data.reference || null;
    this.description = data.description || null;
  }
}
