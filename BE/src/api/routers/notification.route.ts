import { Router } from "express";
import { UserRole } from "../models/enum/userRole.enum";
import { verifyToken, requireRole } from "../middleware/auth.middleware";
import {
  getMyNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  removeNotification,
  removeAllNotifications,
  sendBroadcast,
  reportJob,
  reportUser,
  getAllReportsForAdmin,
  getReportDetail,
  resolveReport,
  getReportsStats,
  getMyReports,
  createNewInterview,
  getMyInterviews,
  getInterviewDetails,
  respondToInterviewInvitation,
  updateInterviewSchedule,
  submitInterviewResult,
} from "../controller/notification.controller";
import {
  validateBroadcast,
  validateJobReport,
  validateUserReport,
  validateReportResolution,
  validateInterviewCreation,
  validateInterviewResponse,
  validateInterviewResult
} from "../middleware/validation";

/**
 * ========== NOTIFICATION ROUTES ==========
 * Routes cho Notification System
 */

const notificationRouter = Router();

// ============== NOTIFICATION ROUTES ==============
/**
 * GET /api/v1/notifications
 * Lấy thông báo của user (cần JWT)
 */
notificationRouter.get("/", verifyToken, getMyNotifications);

/**
 * GET /api/v1/notifications/unread-count
 * Lấy số thông báo chưa đọc
 */
notificationRouter.get(
  "/unread-count",
  verifyToken,
  getUnreadNotificationCount
);

/**
 * PUT /api/v1/notifications/:notificationId/read
 * Đánh dấu 1 thông báo là đã đọc
 */
notificationRouter.put(
  "/:notificationId/read",
  verifyToken,
  markNotificationAsRead
);

/**
 * PUT /api/v1/notifications/read-all
 * Đánh dấu tất cả thông báo là đã đọc
 */
notificationRouter.put(
  "/read-all",
  verifyToken,
  markAllNotificationsAsRead
);

/**
 * DELETE /api/v1/notifications/:notificationId
 * Xóa 1 thông báo
 */
notificationRouter.delete(
  "/:notificationId",
  verifyToken,
  removeNotification
);

/**
 * DELETE /api/v1/notifications
 * Xóa tất cả thông báo của user
 */
notificationRouter.delete(
  "/",
  verifyToken,
  removeAllNotifications
);

// ============== BROADCAST ROUTES (ADMIN ONLY) ==============
/**
 * POST /api/v1/notifications/admin/broadcast
 * Admin gửi thông báo broadcast cho người dùng
 * Body: {
 *   title: string,
 *   content: string,
 *   targetAudience: "all" | "job_seekers" | "recruiters" | "specific",
 *   specificEmails?: string[]
 * }
 */
notificationRouter.post(
  "/admin/broadcast",
  verifyToken,
  requireRole(UserRole.ADMIN),
  validateBroadcast,
  sendBroadcast
);

// ============== REPORT ROUTES ==============
/**
 * POST /api/v1/notifications/reports/job
 * JobSeeker báo cáo job
 * Body: {
 *   jobId: string,
 *   reason: string,
 *   description: string,
 *   evidence?: string[]
 * }
 */
notificationRouter.post(
  "/reports/job",
  verifyToken,
  requireRole(UserRole.JOB_SEEKER),
  validateJobReport,
  reportJob
);

/**
 * POST /api/v1/notifications/reports/user
 * Recruiter tố cáo user
 * Body: {
 *   userId: string,
 *   reason: string,
 *   description: string,
 *   evidence?: string[]
 * }
 */
notificationRouter.post(
  "/reports/user",
  verifyToken,
  requireRole(UserRole.RECRUITER),
  validateUserReport,
  reportUser
);

/**
 * GET /api/v1/notifications/reports
 * Xem tất cả báo cáo (Admin only)
 * Query: ?status=pending&page=1&limit=10
 */
notificationRouter.get(
  "/reports",
  verifyToken,
  requireRole(UserRole.ADMIN),
  getAllReportsForAdmin
);

/**
 * GET /api/v1/notifications/reports/:reportId
 * Xem chi tiết 1 báo cáo (Admin only)
 */
notificationRouter.get(
  "/reports/:reportId",
  verifyToken,
  requireRole(UserRole.ADMIN),
  getReportDetail
);

/**
 * PUT /api/v1/notifications/reports/:reportId/resolve
 * Admin xử lý báo cáo
 * Body: {
 *   status: "pending" | "reviewing" | "resolved" | "rejected",
 *   adminNote?: string
 * }
 */
notificationRouter.put(
  "/reports/:reportId/resolve",
  verifyToken,
  requireRole(UserRole.ADMIN),
  validateReportResolution,
  resolveReport
);

/**
 * GET /api/v1/notifications/reports-stats
 * Lấy thống kê báo cáo (Admin only)
 */
notificationRouter.get(
  "/reports-stats",
  verifyToken,
  requireRole(UserRole.ADMIN),
  getReportsStats
);

/**
 * GET /api/v1/notifications/my-reports
 * User xem báo cáo của chính họ
 * Query: ?page=1&limit=10
 * Role: JobSeeker hoặc Recruiter
 */
notificationRouter.get(
  "/my-reports",
  verifyToken,
  requireRole(UserRole.JOB_SEEKER, UserRole.RECRUITER),
  getMyReports
);

// ============== INTERVIEW ROUTES ==============
/**
 * POST /api/v1/notifications/interviews
 * Recruiter tạo lịch phỏng vấn
 * Body: {
 *   jobId: string,
 *   applicationId: string,
 *   jobSeekerId: string,
 *   scheduledDate: Date,
 *   scheduledTime: string (HH:mm),
 *   duration: number,
 *   location?: string,
 *   meetingLink?: string,
 *   note?: string
 * }
 */
notificationRouter.post(
  "/interviews",
  verifyToken,
  requireRole(UserRole.RECRUITER),
  validateInterviewCreation,
  createNewInterview
);

/**
 * GET /api/v1/notifications/interviews
 * Lấy lịch phỏng vấn của user (JobSeeker hoặc Recruiter)
 * Query: ?status=pending&page=1&limit=10
 */
notificationRouter.get(
  "/interviews",
  verifyToken,
  requireRole(UserRole.JOB_SEEKER, UserRole.RECRUITER),
  getMyInterviews
);

/**
 * GET /api/v1/notifications/interviews/:interviewId
 * Xem chi tiết 1 lịch phỏng vấn
 */
notificationRouter.get(
  "/interviews/:interviewId",
  verifyToken,
  getInterviewDetails
);

/**
 * PUT /api/v1/notifications/interviews/:interviewId
 * Recruiter cập nhật thông tin lịch phỏng vấn (ngày, giờ, địa điểm, link, ghi chú)
 * Body: {
 *   scheduledDate?: string,
 *   scheduledTime?: string,
 *   duration?: number,
 *   location?: string,
 *   meetingLink?: string,
 *   note?: string
 * }
 */
notificationRouter.put(
  "/interviews/:interviewId",
  verifyToken,
  requireRole(UserRole.RECRUITER),
  updateInterviewSchedule
);

/**
 * PUT /api/v1/notifications/interviews/:interviewId/respond
 * JobSeeker phản hồi lịch phỏng vấn
 * Body: {
 *   accepted: boolean,
 *   rejectionReason?: string (bắt buộc nếu accepted = false)
 * }
 */
notificationRouter.put(
  "/interviews/:interviewId/respond",
  verifyToken,
  requireRole(UserRole.JOB_SEEKER),
  validateInterviewResponse,
  respondToInterviewInvitation
);

/**
 * PUT /api/v1/notifications/interviews/:interviewId/result
 * Recruiter cập nhật kết quả phỏng vấn
 * Body: {
 *   passed: boolean,
 *   feedback: string
 * }
 */
notificationRouter.put(
  "/interviews/:interviewId/result",
  verifyToken,
  requireRole(UserRole.RECRUITER),
  validateInterviewResult,
  submitInterviewResult
);

export default notificationRouter;
