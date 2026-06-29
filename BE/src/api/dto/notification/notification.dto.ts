/**
 * ========== NOTIFICATION DTOs ==========
 * Data Transfer Objects cho notification API
 */

export class BroadcastDTO {
  title: string;
  content: string;
  targetAudience: "all" | "job_seekers" | "recruiters" | "specific";
  specificEmails?: string[];

  constructor(data: {
    title: string;
    content: string;
    targetAudience: "all" | "job_seekers" | "recruiters" | "specific";
    specificEmails?: string[];
  }) {
    this.title = data.title;
    this.content = data.content;
    this.targetAudience = data.targetAudience;
    this.specificEmails = data.specificEmails;
  }
}

export class JobReportDTO {
  jobId: string;
  reason: string;
  description: string;
  evidence?: string[];

  constructor(data: {
    jobId: string;
    reason: string;
    description: string;
    evidence?: string[];
  }) {
    this.jobId = data.jobId;
    this.reason = data.reason;
    this.description = data.description;
    this.evidence = data.evidence;
  }
}

export class UserReportDTO {
  userId: string;
  reason: string;
  description: string;
  evidence?: string[];

  constructor(data: {
    userId: string;
    reason: string;
    description: string;
    evidence?: string[];
  }) {
    this.userId = data.userId;
    this.reason = data.reason;
    this.description = data.description;
    this.evidence = data.evidence;
  }
}

export class CreateInterviewDTO {
  jobId: string;
  applicationId: string;
  jobSeekerId: string;
  scheduledDate: Date;
  scheduledTime: string;
  duration: number;
  location?: string;
  meetingLink?: string;
  note?: string;

  constructor(data: {
    jobId: string;
    applicationId: string;
    jobSeekerId: string;
    scheduledDate: Date;
    scheduledTime: string;
    duration: number;
    location?: string;
    meetingLink?: string;
    note?: string;
  }) {
    this.jobId = data.jobId;
    this.applicationId = data.applicationId;
    this.jobSeekerId = data.jobSeekerId;
    this.scheduledDate = data.scheduledDate;
    this.scheduledTime = data.scheduledTime;
    this.duration = data.duration;
    this.location = data.location;
    this.meetingLink = data.meetingLink;
    this.note = data.note;
  }
}

export class RespondInterviewDTO {
  accepted: boolean;
  rejectionReason?: string;

  constructor(data: { accepted: boolean; rejectionReason?: string }) {
    this.accepted = data.accepted;
    this.rejectionReason = data.rejectionReason;
  }
}

export class InterviewResultDTO {
  passed: boolean;
  feedback: string;

  constructor(data: { passed: boolean; feedback: string }) {
    this.passed = data.passed;
    this.feedback = data.feedback;
  }
}

export class ReportResolutionDTO {
  status: "pending" | "reviewing" | "resolved" | "rejected";
  adminNote?: string;

  constructor(data: { 
    status: "pending" | "reviewing" | "resolved" | "rejected";
    adminNote?: string;
  }) {
    this.status = data.status;
    this.adminNote = data.adminNote;
  }
}
