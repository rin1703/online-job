export class ConfirmDowngradeDTO {
  requestId: string; // lấy từ params

  constructor(requestId: string) {
    this.requestId = requestId;
  }
}

export class ConfirmDowngradeResponseDTO {
  message: string;
  requestId: string;
  status: string; // e.g., 'applying', 'pending', 'success'

  constructor(message: string, requestId: string, status: string) {
    this.message = message;
    this.requestId = requestId;
    this.status = status;
  }
}
