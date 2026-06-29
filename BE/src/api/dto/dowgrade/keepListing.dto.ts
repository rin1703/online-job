export class SelectKeepJobsDTO {
  requestId: string;
  keepJobIds: string[]; // danh sách bài muốn giữ lại

  constructor(requestId: string, keepJobIds: string[]) {
    this.requestId = requestId;
    this.keepJobIds = keepJobIds;
  }
}

export class SelectKeepJobsResponseDTO {
  message: string;
  requestId: string;
  selectedCount: number;
  allowed: number;
  excess: number;

  constructor(
    message: string,
    requestId: string,
    selectedCount: number,
    allowed: number,
    excess: number
  ) {
    this.message = message;
    this.requestId = requestId;
    this.selectedCount = selectedCount;
    this.allowed = allowed;
    this.excess = excess;
  }
}
