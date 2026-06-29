export class CreatePaymentDTO {
  jobPackageId: string;

  constructor(recruiterId: string, jobPackageId: string) {
    this.jobPackageId = jobPackageId;
  }
}

export class BuySubscriptionDTO {
  packageId: string;

  constructor(packageId: string) {
    this.packageId = packageId;
  }
}
