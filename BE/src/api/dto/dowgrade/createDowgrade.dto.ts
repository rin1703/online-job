export class CreatePreviewDowngradeDTO {
  packageId: string;

  constructor(packageId: string) {
    this.packageId = packageId;
  }
}

export class PreviewDowngradeResponseDTO {
  requestId!: string;
  currentPublished!: number; // số bài đang active
  allowed!: number; // limit của gói mới
  excess!: number; // số bài dư
  currentPackage!: string; // tên gói hiện tại
  newPackage!: string; // tên gói downgrade

  constructor(
    requestId: string,
    currentPublished: number,
    allowed: number,
    excess: number,
    currentPackage: string,
    newPackage: string
  ) {
    this.requestId = requestId;
    this.currentPublished = currentPublished;
    this.allowed = allowed;
    this.excess = excess;
    this.currentPackage = currentPackage;
    this.newPackage = newPackage;
  }
}
