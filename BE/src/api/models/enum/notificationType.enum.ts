export enum NotificationType {
  // Admin notifications
  ADMIN_BROADCAST = "admin_broadcast",
  REPORT_JOB = "report_job",
  REPORT_USER = "report_user",

  // Recruiter notifications
  APPLICATION_RECEIVED = "application_received",
  APPLICATION_APPROVED = "application_approved",
  APPLICATION_REJECTED = "application_rejected",
  INTERVIEW_RESPONSE = "interview_response",

  // JobSeeker notifications
  APPLICATION_STATUS = "application_status",
  INTERVIEW_INVITATION = "interview_invitation",
  JOB_RECOMMENDATION = "job_recommendation",
  // Wallet notifications
  WALLET_TOPUP = "wallet_topup",
}
