// @ts-nocheck
import Notification from "../models/notification.model";
import { NotificationType } from "../models/enum/notificationType.enum";
import User from "../models/user.model";
import { UserRole } from "../models/enum/userRole.enum";
import {
  sendApplicationStatusEmail,
  sendInterviewInvitationEmail,
  sendInterviewUpdateEmail,
  sendInterviewResponseEmail,
  sendReportNotificationEmail,
  sendBroadcastEmail,
} from "./email.service";
import mongoose from "mongoose";

/**
 * ========== NOTIFICATION SERVICE ==========
 * Handle all notification-related logic
 * Create, send email, mark as read
 */

// ============== CREATE NOTIFICATION ==============

/**
 * Create basic notification
 */
export const createNotification = async (data: {
  title: string;
  content: string;
  type: NotificationType;
  sender: {
    userId?: string;
    role: UserRole;
    name?: string;
  };
  recipientId: string;
  recipientEmail: string;
  recipientRole: UserRole;
  metadata?: {
    jobId?: string;
    applicationId?: string;
    interviewId?: string;
    reportId?: string;
    actionUrl?: string;
  };
  sendEmail?: boolean;
}): Promise<any> => {
  try {
    const notification = new Notification({
      title: (data as any).title,
      content: data.content,
      type: (data as any).type,
      sender: {
        userId: data.sender.userId,
        role: (data.sender as any).role,
        name: data.sender.name,
      },
      recipient: {
        userId: data.recipientId,
        email: data.recipientEmail,
        role: data.recipientRole,
      },
      metadata: data.metadata,
      isRead: false,
      sentViaEmail: data.sendEmail || false,
    });

    const savedNotification = await notification.save();
    return savedNotification;
  } catch (error) {
    throw error;
  }
};

// ============== GET NOTIFICATIONS ==============

/**
 * Get user's notification list
 * FIX: Use aggregation with $toString to match both String and ObjectId userId
 */
export const getNotificationsForUser = async (
  userId: string,
  page: number = 1,
  limit: number = 10
): Promise<{
  notifications: any[];
  total: number;
  page: number;
  totalPages: number;
}> => {
  try {
    const skip = (page - 1) * limit;

    // Aggregation để convert recipient.userId thành string trước khi match
    const notifications = await Notification.aggregate([
      {
        $addFields: {
          recipientUserIdStr: { $toString: "$recipient.userId" }
        }
      },
      {
        $match: {
          recipientUserIdStr: userId
        }
      },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit }
    ]);

    const totalResult = await Notification.aggregate([
      {
        $addFields: {
          recipientUserIdStr: { $toString: "$recipient.userId" }
        }
      },
      {
        $match: {
          recipientUserIdStr: userId
        }
      },
      { $count: "total" }
    ]);

    const total = totalResult.length > 0 ? totalResult[0].total : 0;

    return {
      notifications,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Get unread notification count
 * FIX: Use aggregation with $toString
 */
export const getUnreadCount = async (userId: string): Promise<number> => {
  try {
    const result = await Notification.aggregate([
      {
        $addFields: {
          recipientUserIdStr: { $toString: "$recipient.userId" }
        }
      },
      {
        $match: {
          recipientUserIdStr: userId,
          isRead: false
        }
      },
      { $count: "total" }
    ]);

    return result.length > 0 ? result[0].total : 0;
  } catch (error) {
    throw error;
  }
};

/**
 * Get notification details
 */
export const getNotificationById = async (
  notificationId: string
): Promise<any | null> => {
  try {
    const notification = await Notification.findById(notificationId);
    return notification;
  } catch (error) {
    throw error;
  }
};

// ============== MARK AS READ ==============

/**
 * Mark one notification as read
 */
export const markAsRead = async (notificationId: string): Promise<boolean> => {
  try {
    const result = await Notification.findByIdAndUpdate(
      notificationId,
      {
        isRead: true,
        readAt: new Date(),
      },
      { new: true }
    );

    return result ? true : false;
  } catch (error) {
    throw error;
  }
};

/**
 * Mark all user's notifications as read
 * FIX: Find notifications by aggregation, then update by IDs
 */
export const markAllAsRead = async (userId: string): Promise<number> => {
  try {
    // Tìm tất cả notification IDs với userId
    const notificationIds = await Notification.aggregate([
      {
        $addFields: {
          recipientUserIdStr: { $toString: "$recipient.userId" }
        }
      },
      {
        $match: {
          recipientUserIdStr: userId,
          isRead: false
        }
      },
      {
        $project: { _id: 1 }
      }
    ]);

    const ids = notificationIds.map(n => n._id);

    if (ids.length === 0) {
      return 0;
    }

    // Update bằng IDs
    const result = await Notification.updateMany(
      { _id: { $in: ids } },
      {
        isRead: true,
        readAt: new Date(),
      }
    );

    return result.modifiedCount;
  } catch (error) {
    throw error;
  }
};

// ============== DELETE NOTIFICATION ==============

/**
 * Delete one notification
 */
export const deleteNotification = async (
  notificationId: string
): Promise<boolean> => {
  try {
    const result = await Notification.findByIdAndDelete(notificationId);
    return result ? true : false;
  } catch (error) {
    throw error;
  }
};

/**
 * Delete all user's notifications
 * FIX: Find notifications by aggregation, then delete by IDs
 */
export const deleteAllNotifications = async (userId: string): Promise<number> => {
  try {
    // Tìm tất cả notification IDs với userId
    const notificationIds = await Notification.aggregate([
      {
        $addFields: {
          recipientUserIdStr: { $toString: "$recipient.userId" }
        }
      },
      {
        $match: {
          recipientUserIdStr: userId
        }
      },
      {
        $project: { _id: 1 }
      }
    ]);

    const ids = notificationIds.map(n => n._id);

    if (ids.length === 0) {
      return 0;
    }

    // Delete bằng IDs
    const result = await Notification.deleteMany({
      _id: { $in: ids }
    });

    return result.deletedCount;
  } catch (error) {
    throw error;
  }
};

// ============== SEND NOTIFICATIONS ==============

/**
 * Send application status notification to JobSeeker
 */
export const sendApplicationStatusNotification = async (
  jobSeekerId: string,
  applicationId: string,
  jobTitle: string,
  status: "approved" | "rejected",
  recruiterName: string,
  note?: string
): Promise<void> => {
  try {
    const jobSeeker = await User.findById(jobSeekerId);
    if (!jobSeeker) {
      throw new Error("JobSeeker not found");
    }

    const title =
      status === "approved"
        ? "Application Approved"
        : "Application Status Update";
    
    const content =
      status === "approved"
        ? `Congratulations! Your application for "${jobTitle}" has been approved!`
        : `Your application for "${jobTitle}" was not suitable at this time. Thank you for your interest!`;

    const finalContent = note ? `${content}\n\nNote: ${note}` : content;

    await createNotification({
      title,
      content: finalContent,
      type: NotificationType.APPLICATION_STATUS,
      sender: {
        role: UserRole.RECRUITER,
        name: recruiterName,
      },
      recipientId: jobSeekerId,
      recipientEmail: (jobSeeker as any).email,
      recipientRole: UserRole.JOB_SEEKER,
      metadata: {
        applicationId,
        actionUrl: `/applications/${applicationId}`,
        status,
      },
      sendEmail: true,
    });

    await sendApplicationStatusEmail(
      (jobSeeker as any).email,
      (jobSeeker as any).firstName + " " + (jobSeeker as any).lastName,
      jobTitle,
      recruiterName,
      status,
      note
    );
  } catch (error) {
    throw error;
  }
};

/**
 * NEW: Send notification when recruiter marks as "reviewed"
 */
export const sendApplicationReviewedNotification = async (
  jobSeekerId: string,
  applicationId: string,
  jobTitle: string,
  recruiterName: string,
  note?: string
): Promise<void> => {
  try {
    const jobSeeker = await User.findById(jobSeekerId);
    if (!jobSeeker) {
      throw new Error("JobSeeker not found");
    }

    const title = "Application Reviewed";
    const content = `Your application for "${jobTitle}" has been reviewed by the recruiter. Please wait for further information.`;
    const finalContent = note ? `${content}\n\nNote: ${note}` : content;

    await createNotification({
      title,
      content: finalContent,
      type: NotificationType.APPLICATION_STATUS,
      sender: {
        role: UserRole.RECRUITER,
        name: recruiterName,
      },
      recipientId: jobSeekerId,
      recipientEmail: (jobSeeker as any).email,
      recipientRole: UserRole.JOB_SEEKER,
      metadata: {
        applicationId,
        actionUrl: `/applications/${applicationId}`,
        status: "reviewed",
      },
      sendEmail: false, // No need to send email for "reviewed"
    });
  } catch (error) {
    throw error;
  }
};

/**
 * NEW: Send notification when interview is scheduled
 */
export const sendInterviewScheduledNotification = async (
  jobSeekerId: string,
  applicationId: string,
  jobTitle: string,
  recruiterName: string,
  note?: string
): Promise<void> => {
  try {
    const jobSeeker = await User.findById(jobSeekerId);
    if (!jobSeeker) {
      throw new Error("JobSeeker not found");
    }

    const title = "Interview Scheduled";
    const content = `Your application for "${jobTitle}" has been approved. The recruiter will contact you soon to arrange an interview.`;
    const finalContent = note ? `${content}\n\nNote: ${note}` : content;

    await createNotification({
      title,
      content: finalContent,
      type: NotificationType.APPLICATION_STATUS,
      sender: {
        role: UserRole.RECRUITER,
        name: recruiterName,
      },
      recipientId: jobSeekerId,
      recipientEmail: (jobSeeker as any).email,
      recipientRole: UserRole.JOB_SEEKER,
      metadata: {
        applicationId,
        actionUrl: `/applications/${applicationId}`,
        status: "interview_scheduled",
      },
      sendEmail: true,
    });

    // Send email for interview scheduled
    await sendApplicationStatusEmail(
      (jobSeeker as any).email,
      (jobSeeker as any).firstName + " " + (jobSeeker as any).lastName,
      jobTitle,
      recruiterName,
      "interview_scheduled" as any,
      note
    );
  } catch (error) {
    throw error;
  }
};

/**
 * Send interview invitation to JobSeeker
 */
export const sendInterviewInvitationNotification = async (
  jobSeekerId: string,
  interviewId: string,
  jobTitle: string,
  companyName: string,
  scheduledDate: Date,
  scheduledTime: string,
  location: string,
  recruiterId: string,
  meetingLink?: string,
  note?: string
): Promise<void> => {
  try {
    const jobSeeker = await User.findById(jobSeekerId);
    const recruiter = await User.findById(recruiterId);

    if (!jobSeeker || !recruiter) {
      throw new Error("JobSeeker or Recruiter not found");
    }

    const title = "Interview Invitation";
    const content = `You are invited to interview for "${jobTitle}" at "${companyName}" on ${scheduledDate.toLocaleDateString("en-US")} at ${scheduledTime}`;

    // Create in-app notification
    await createNotification({
      title,
      content,
      type: NotificationType.INTERVIEW_INVITATION,
      sender: {
        userId: recruiterId,
        role: UserRole.RECRUITER,
        name: (recruiter as any).firstName + " " + (recruiter as any).lastName,
      },
      recipientId: jobSeekerId,
      recipientEmail: (jobSeeker as any).email,
      recipientRole: UserRole.JOB_SEEKER,
      metadata: {
        interviewId,
        actionUrl: `/interviews/${interviewId}/respond`,
      },
      sendEmail: true,
    });

    // Gửi email
    await sendInterviewInvitationEmail(
      (jobSeeker as any).email,
      (jobSeeker as any).firstName + " " + (jobSeeker as any).lastName,
      jobTitle,
      companyName,
      scheduledDate,
      scheduledTime,
      location,
      meetingLink,
      note
    );
  } catch (error) {
    throw error;
  }
};

/**
 * Send interview response notification to Recruiter
 */
export const sendInterviewResponseNotification = async (
  recruiterId: string,
  interviewId: string,
  jobSeekerName: string,
  jobTitle: string,
  accepted: boolean,
  rejectionReason?: string
): Promise<void> => {
  try {
    const recruiter = await User.findById(recruiterId);
    if (!recruiter) {
      throw new Error("Recruiter not found");
    }

    const title = accepted
      ? "JobSeeker Accepted Interview"
      : "JobSeeker Declined Interview";
    const content = accepted
      ? `${jobSeekerName} has agreed to attend the interview for "${jobTitle}"`
      : `${jobSeekerName} has declined the interview for "${jobTitle}"`;

    // Create in-app notification
    await createNotification({
      title,
      content,
      type: NotificationType.INTERVIEW_RESPONSE,
      sender: {
        role: UserRole.JOB_SEEKER,
        name: jobSeekerName,
      },
      recipientId: recruiterId,
      recipientEmail: (recruiter as any).email,
      recipientRole: UserRole.RECRUITER,
      metadata: {
        interviewId,
        actionUrl: `/interviews/${interviewId}`
      },
      sendEmail: true,
    });

    // Gửi email
    await sendInterviewResponseEmail(
      (recruiter as any).email,
      jobSeekerName,
      jobTitle,
      accepted,
      rejectionReason
    );
  } catch (error) {
    throw error;
  }
};

/**
 * Gửi thông báo cập nhật lịch phỏng vấn cho JobSeeker
 */
export const sendInterviewUpdateNotification = async (
  jobSeekerId: string,
  interviewId: string,
  jobTitle: string,
  companyName: string,
  scheduledDate: Date | string,
  scheduledTime: string,
  location: string,
  recruiterId: string,
  meetingLink?: string,
  note?: string
): Promise<void> => {
  try {
    const jobSeeker = await User.findById(jobSeekerId);
    const recruiter = await User.findById(recruiterId);

    if (!jobSeeker || !recruiter) {
      throw new Error("Do not find JobSeeker or Recruiter");
    }

    // Convert scheduledDate to Date object if it's a string
    const dateObj = scheduledDate instanceof Date ? scheduledDate : new Date(scheduledDate);
    const formattedDate = dateObj.toLocaleDateString("vi-VN");

    const title = "Interview schedule updated";
    const content = `Interview schedule for the position "${jobTitle}" at "${companyName}" has been updated. New time: ${formattedDate} at ${scheduledTime}`;
    
    // Tạo notification in-app
    await createNotification({
      title,
      content,
      type: NotificationType.INTERVIEW_INVITATION,
      sender: {
        userId: recruiterId,
        role: UserRole.RECRUITER,
        name: (recruiter as any).firstName + " " + (recruiter as any).lastName,
      },
      recipientId: jobSeekerId,
      recipientEmail: (jobSeeker as any).email,
      recipientRole: UserRole.JOB_SEEKER,
      metadata: {
        interviewId,
        actionUrl: `/job-seeker/interviews/${interviewId}`,
      },
      sendEmail: true,
    });

    // Gửi email
    await sendInterviewUpdateEmail(
      (jobSeeker as any).email,
      (jobSeeker as any).firstName + " " + (jobSeeker as any).lastName,
      jobTitle,
      companyName,
      scheduledDate,
      scheduledTime,
      location,
      meetingLink,
      note
    );
  } catch (error) {
    throw error;
  }
};

/**
 * Gửi thông báo báo cáo cho Admin
 */
export const sendReportNotification = async (
  reporterName: string,
  reportType: "job" | "user",
  reason: string,
  description: string
): Promise<void> => {
  try {
    // Get all admins
    const admins = await User.find({ role: "admin" });

    if (admins.length === 0) {
      throw new Error("No admin in system");
    }

    // Send notification to all admins
    for (const admin of admins) {
      const title = reportType === "job" ? "Job Report" : "User Report";

      await createNotification({
        title,
        content: `${reporterName} has reported a ${reportType === "job" ? "job" : "user"}. Reason: ${reason}`,
        type:
          reportType === "job"
            ? NotificationType.REPORT_JOB
            : NotificationType.REPORT_USER,
        sender: {
          role: UserRole.JOB_SEEKER,
          name: reporterName,
        },
        recipientId: admin._id.toString(),
        recipientEmail: (admin as any).email,
        recipientRole: UserRole.ADMIN,
        metadata: {
          actionUrl: reportType === "job" ? `/reports/job` : `/reports/user`
        },
        sendEmail: true,
      });

      // Send email
      await sendReportNotificationEmail(
        (admin as any).email,
        reporterName,
        reportType,
        reason,
        description
      );
    }
  } catch (error) {
    throw error;
  }
};

/**
 * NEW: Send notification to reporter when admin takes action
 */
export const sendReportResolutionNotification = async (
  reporterId: string,
  reporterEmail: string,
  reporterRole: UserRole,
  reportType: "job" | "user",
  status: "pending" | "reviewing" | "resolved" | "rejected",
  adminNote?: string,
  reportId?: string
): Promise<void> => {
  try {
    let title = "";
    let content = "";
    
    const typeText = reportType === "job" ? "job" : "user";

    switch (status) {
      case "reviewing":
        title = "Report Under Review";
        content = `Your ${typeText} report is being reviewed by admin.`;
        break;
      case "resolved":
        title = "Report Resolved";
        content = `Your ${typeText} report has been successfully handled by admin.`;
        break;
      case "rejected":
        title = "Report Rejected";
        content = `Your ${typeText} report was not accepted.`;
        break;
      default:
        title = "Report Update";
        content = `Your ${typeText} report has been updated.`;
    }

    // Add admin note if available
    const finalContent = adminNote 
      ? `${content}\n\nAdmin note: ${adminNote}`
      : content;

    await createNotification({
      title,
      content: finalContent,
      type: reportType === "job" 
        ? NotificationType.REPORT_JOB 
        : NotificationType.REPORT_USER,
      sender: {
        role: UserRole.ADMIN,
        name: "Admin",
      },
      recipientId: reporterId,
      recipientEmail: reporterEmail,
      recipientRole: reporterRole,
      metadata: {
        reportId,
        actionUrl: `/reports/${reportId}`
      },
      sendEmail: true,
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Send broadcast email to multiple recipients
 */
export const sendBroadcastNotification = async (
  adminId: string,
  title: string,
  content: string,
  targetAudience: "all" | "job_seekers" | "recruiters" | "specific",
  specificEmails?: string[]
): Promise<{ sent: number; failed: number }> => {
  try {
    const admin = await User.findById(adminId);
    if (!admin) {
      throw new Error("Admin not found");
    }

    let recipients: typeof User[] = [];

    // Get recipient list
    if (targetAudience === "all") {
      recipients = await User.find({ isActive: true });
    } else if (targetAudience === "job_seekers") {
      recipients = await User.find({ role: "job_seeker", isActive: true });
    } else if (targetAudience === "recruiters") {
      recipients = await User.find({ role: "recruiter", isActive: true });
    } else if (targetAudience === "specific" && specificEmails) {
      recipients = await User.find({ email: { $in: specificEmails } });
    }

    let sent = 0;
    let failed = 0;

    // Send notification to each recipient
    for (const recipient of recipients) {
      try {
        await createNotification({
          title,
          content,
          type: NotificationType.ADMIN_BROADCAST,
          sender: {
            userId: adminId,
            role: UserRole.ADMIN,
            name: (admin as any).firstName + " " + (admin as any).lastName,
          },
          recipientId: (recipient as any)._id.toString(),
          recipientEmail: (recipient as any).email,
          recipientRole: (recipient as any).role as UserRole,
          metadata: {
            actionUrl: `/notifications` // broadcast usually leads to notification list
          },
          sendEmail: true,
        });

        // Send email
        await sendBroadcastEmail((recipient as any).email, title, content);
        sent++;
      } catch (error) {
        console.error(`Failed to send to ${(recipient as any).email}:`, error);
        failed++;
      }
    }

    return { sent, failed };
  } catch (error) {
    throw error;
  }
};

// ============== SEND NEW APPLICATION NOTIFICATION (to Recruiter) ==============

/**
 * Send notification to Recruiter when JobSeeker submits application
 */
export const sendNewApplicationNotification = async (
  recruiterId: string,
  jobSeekerName: string,
  jobTitle: string,
  applicationId: string
): Promise<void> => {
  try {
    const recruiter = await User.findById(recruiterId);
    if (!recruiter) {
      throw new Error("Recruiter not found");
    }

    const title = "New Job Application";
    const content = `${jobSeekerName} has submitted an application for "${jobTitle}"`;

    // Create in-app notification
    await createNotification({
      title,
      content,
      type: NotificationType.APPLICATION_RECEIVED,
      sender: {
        role: UserRole.JOB_SEEKER,
        name: jobSeekerName,
      },
      recipientId: recruiterId,
      recipientEmail: (recruiter as any).email,
      recipientRole: UserRole.RECRUITER,
      metadata: {
        applicationId,
        actionUrl: `/applications/${applicationId}`
      },
      sendEmail: true,
    });
  } catch (error) {
    throw error;
  }
};
