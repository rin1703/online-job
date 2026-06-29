export class ApplyDowngradeDTO {
  requestId!: string;

  constructor(requestId: string) {
    this.requestId = requestId;
  }
}

export class ApplyDowngradeResponseDTO {
  message!: string;
  newSubscriptionId!: string;
  hiddenJobsCount!: number;
  keptJobsCount!: number;

  constructor(
    message: string,
    newSubscriptionId: string,
    hiddenJobsCount: number,
    keptJobsCount: number
  ) {
    this.message = message;
    this.newSubscriptionId = newSubscriptionId;
    this.hiddenJobsCount = hiddenJobsCount;
    this.keptJobsCount = keptJobsCount;
  }
}
