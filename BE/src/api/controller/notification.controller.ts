import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import JobListing from "../models/jobListing.model";
import { HTTP_STATUS } from "../../helper/constants.helper";
import {
  getNotificationsForUser,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
  sendBroadcastNotification,
  sendInterviewInvitationNotification,
} from "../service/notification.service";
import {
  createJobReport,
  createUserReport,
  getAllReports,
  getReportById,
  getReportStatistics,
  updateReportStatus,
  getReportsByReporter,
} from "../service/report.service";
import {
  createInterview,
  getInterviewsForJobSeeker,
  getInterviewsForRecruiter,
  getInterviewById,
  respondToInterview,
  updateInterview,
  updateInterviewResult,
} from "../service/interview.service";
import {
  BroadcastDTO,
  JobReportDTO,
  UserReportDTO,
  CreateInterviewDTO,
  RespondInterviewDTO,
  InterviewResultDTO,
  ReportResolutionDTO,
} from "../dto/notification/notification.dto";

/**
 * ========== NOTIFICATION CONTROLLER ==========
 */

export const getMyNotifications = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: "Chưa xác thực người dùng",
      });
      return;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await getNotificationsForUser(userId, page, limit);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "Lấy thông báo thành công",
      data: result,
    });
  } catch (error: any) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "Lỗi server",
    });
  }
};

export const getUnreadNotificationCount = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: "Chưa xác thực người dùng",
      });
      return;
    }

    const count = await getUnreadCount(req.user.userId);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "Lấy số thông báo chưa đọc thành công",
      data: { unreadCount: count },
    });
  } catch (error: any) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "Lỗi server",
    });
  }
};

export const markNotificationAsRead = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const notificationId = req.params.notificationId as string;

    const result = await markAsRead(notificationId);

    if (!result) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: "Không tìm thấy thông báo",
      });
      return;
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "Đánh dấu thông báo là đã đọc",
    });
  } catch (error: any) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "Lỗi server",
    });
  }
};

export const markAllNotificationsAsRead = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: "Chưa xác thực người dùng",
      });
      return;
    }

    const modifiedCount = await markAllAsRead(req.user.userId);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: `Đã đánh dấu ${modifiedCount} thông báo là đã đọc`,
    });
  } catch (error: any) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "Lỗi server",
    });
  }
};

export const removeNotification = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const notificationId = req.params.notificationId as string;

    const result = await deleteNotification(notificationId);

    if (!result) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: "Không tìm thấy thông báo",
      });
      return;
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "Xóa thông báo thành công",
    });
  } catch (error: any) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "Lỗi server",
    });
  }
};

export const removeAllNotifications = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: "Chưa xác thực người dùng",
      });
      return;
    }

    const deletedCount = await deleteAllNotifications(req.user.userId);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: `Đã xóa ${deletedCount} thông báo`,
      data: { deletedCount },
    });
  } catch (error: any) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "Lỗi server",
    });
  }
};

/**
 * ========== BROADCAST CONTROLLER ==========
 */

export const sendBroadcast = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: "Chưa xác thực người dùng",
      });
      return;
    }

    const dto = new BroadcastDTO(req.body);

    const result = await sendBroadcastNotification(
      req.user.userId,
      dto.title,
      dto.content,
      dto.targetAudience,
      dto.specificEmails
    );

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: `Gửi broadcast thành công. Đã gửi: ${result.sent}, Thất bại: ${result.failed}`,
      data: result,
    });
  } catch (error: any) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "Lỗi server",
    });
  }
};

/**
 * ========== REPORT CONTROLLER ==========
 */

export const reportJob = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: "Chưa xác thực người dùng",
      });
      return;
    }

    const dto = new JobReportDTO(req.body);

    const report = await createJobReport({
      jobId: dto.jobId,
      reporterId: req.user.userId,
      reason: dto.reason,
      description: dto.description,
      evidence: dto.evidence,
    });

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: "Báo cáo công việc thành công",
      data: report,
    });
  } catch (error: any) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: error.message || "Lỗi server",
    });
  }
};

export const reportUser = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: "Chưa xác thực người dùng",
      });
      return;
    }

    const dto = new UserReportDTO(req.body);

    const report = await createUserReport({
      userId: dto.userId,
      reporterId: req.user.userId,
      reason: dto.reason,
      description: dto.description,
      evidence: dto.evidence,
    });

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: "Báo cáo người dùng thành công",
      data: report,
    });
  } catch (error: any) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: error.message || "Lỗi server",
    });
  }
};

export const getAllReportsForAdmin = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const status = req.query.status as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await getAllReports(status, page, limit);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "Lấy danh sách báo cáo thành công",
      data: result,
    });
  } catch (error: any) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "Lỗi server",
    });
  }
};

export const getReportDetail = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const reportId = req.params.reportId as string;

    const report = await getReportById(reportId);

    if (!report) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: "Không tìm thấy báo cáo",
      });
      return;
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "Lấy chi tiết báo cáo thành công",
      data: report,
    });
  } catch (error: any) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "Lỗi server",
    });
  }
};

export const resolveReport = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: "Chưa xác thực người dùng",
      });
      return;
    }

    const reportId = req.params.reportId as string;
    const dto = new ReportResolutionDTO(req.body);

    const report = await updateReportStatus(
      reportId,
      dto.status,
      req.user.userId,
      dto.adminNote
    );

    if (!report) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: "Không tìm thấy báo cáo",
      });
      return;
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "Cập nhật báo cáo thành công",
      data: report,
    });
  } catch (error: any) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "Lỗi server",
    });
  }
};

export const getReportsStats = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const stats = await getReportStatistics();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "Lấy thống kê báo cáo thành công",
      data: stats,
    });
  } catch (error: any) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "Lỗi server",
    });
  }
};

/**
 * User xem báo cáo của chính họ
 */
export const getMyReports = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: "Chưa xác thực người dùng",
      });
      return;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await getReportsByReporter(req.user.userId, page, limit);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "Lấy danh sách báo cáo của bạn thành công",
      data: result,
    });
  } catch (error: any) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "Lỗi server",
    });
  }
};

/**
 * ========== INTERVIEW CONTROLLER ==========
 */

export const createNewInterview = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: "Chưa xác thực người dùng",
      });
      return;
    }

    const dto = new CreateInterviewDTO(req.body);

    const interview = await createInterview({
      jobId: dto.jobId,
      applicationId: dto.applicationId,
      recruiterId: req.user.userId,
      jobSeekerId: dto.jobSeekerId,
      scheduledDate: new Date(dto.scheduledDate),
      scheduledTime: dto.scheduledTime,
      duration: dto.duration,
      location: dto.location,
      meetingLink: dto.meetingLink,
      note: dto.note,
    });

    const jobListing = await JobListing.findById(dto.jobId);
    
    if (jobListing) {
      await sendInterviewInvitationNotification(
        dto.jobSeekerId,
        interview._id.toString(),
        jobListing.title,
        "Công ty",
        new Date(dto.scheduledDate),
        dto.scheduledTime,
        dto.location || "",
        req.user.userId,
        dto.meetingLink,
        dto.note
      );
    }

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: "Tạo lịch phỏng vấn thành công",
      data: interview,
    });
  } catch (error: any) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: error.message || "Lỗi server",
    });
  }
};

export const getMyInterviews = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: "Chưa xác thực người dùng",
      });
      return;
    }

    const status = req.query.status as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    let result;

    if (req.user.role === "job_seeker") {
      result = await getInterviewsForJobSeeker(
        req.user.userId,
        status,
        page,
        limit
      );
    } else if (req.user.role === "recruiter") {
      result = await getInterviewsForRecruiter(
        req.user.userId,
        status,
        page,
        limit
      );
    } else {
      res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: "Bạn không có quyền truy cập",
      });
      return;
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "Lấy lịch phỏng vấn thành công",
      data: result,
    });
  } catch (error: any) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "Lỗi server",
    });
  }
};

export const getInterviewDetails = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const interviewId = req.params.interviewId as string;

    const interview = await getInterviewById(interviewId);

    if (!interview) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: "Không tìm thấy lịch phỏng vấn",
      });
      return;
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "Lấy chi tiết lịch phỏng vấn thành công",
      data: interview,
    });
  } catch (error: any) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "Lỗi server",
    });
  }
};

export const respondToInterviewInvitation = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const interviewId = req.params.interviewId as string;
    const dto = new RespondInterviewDTO(req.body);

    const interview = await respondToInterview(
      interviewId,
      dto.accepted,
      dto.rejectionReason
    );

    if (!interview) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: "Không tìm thấy lịch phỏng vấn",
      });
      return;
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "Phản hồi lịch phỏng vấn thành công",
      data: interview,
    });
  } catch (error: any) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: error.message || "Lỗi server",
    });
  }
};

export const submitInterviewResult = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const interviewId = req.params.interviewId as string;
    const dto = new InterviewResultDTO(req.body);

    const interview = await updateInterviewResult(
      interviewId,
      dto.passed,
      dto.feedback
    );

    if (!interview) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: "Không tìm thấy lịch phỏng vấn",
      });
      return;
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "Cập nhật kết quả phỏng vấn thành công",
      data: interview,
    });
  } catch (error: any) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: error.message || "Lỗi server",
    });
  }
};

export const updateInterviewSchedule = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const interviewId = req.params.interviewId as string;
    const recruiterId = req.user?.userId;

    if (!recruiterId) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: "Chưa xác thực người dùng",
      });
      return;
    }

    const updateData = {
      scheduledDate: req.body.scheduledDate,
      scheduledTime: req.body.scheduledTime,
      duration: req.body.duration,
      location: req.body.location,
      meetingLink: req.body.meetingLink,
      note: req.body.note,
    };

    const interview = await updateInterview(interviewId, updateData, recruiterId);

    if (!interview) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: "Không tìm thấy lịch phỏng vấn",
      });
      return;
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "Cập nhật lịch phỏng vấn thành công",
      data: interview,
    });
  } catch (error: any) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: error.message || "Lỗi server",
    });
  }
};
