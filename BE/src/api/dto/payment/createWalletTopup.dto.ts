export class CreateWalletTopupDTO {
  recruiterId: string;
  amount: number;

  constructor(recruiterId: string, amount: number) {
    this.recruiterId = recruiterId;
    this.amount = amount;
  }
}
