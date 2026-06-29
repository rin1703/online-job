export class ChangeRequestStatusDTO {
  requestId: string;
  status: string;
  currentCounts: {
    publishedJobs: number;
    featuredJobs: number;
  };
  newLimits: {
    jobPostingsLimit: number;
    featuredLimit: number;
  };
  excess: {
    jobsToHideCount: number;
    featuredToRemoveCount: number;
  };
  selectedKeepJobIds: string[];
  enforcementPolicy: {
    allowGraceUntil: Date | null;
    hardCreationBlock: boolean;
  };
  notes: string | null;
  createdAt: Date;

  constructor(
    requestId: string,
    status: string,
    currentCounts: { publishedJobs: number; featuredJobs: number },
    newLimits: { jobPostingsLimit: number; featuredLimit: number },
    excess: { jobsToHideCount: number; featuredToRemoveCount: number },
    selectedKeepJobIds: string[],
    enforcementPolicy: {
      allowGraceUntil: Date | null;
      hardCreationBlock: boolean;
    },
    notes: string | null,
    createdAt: Date
  ) {
    this.requestId = requestId;
    this.status = status;
    this.currentCounts = currentCounts;
    this.newLimits = newLimits;
    this.excess = excess;
    this.selectedKeepJobIds = selectedKeepJobIds;
    this.enforcementPolicy = enforcementPolicy;
    this.notes = notes;
    this.createdAt = createdAt;
  }
}
