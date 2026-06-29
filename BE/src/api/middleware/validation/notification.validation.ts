import { Request, Response, NextFunction } from "express";
import { sendBadRequestResponse } from "../../../helper/response.helper";
import User from "../../models/user.model";
import JobListingModel from "../../models/jobListing.model";
import Report from "../../models/report.model";

/**
 * ========== NOTIFICATION VALIDATION MIDDLEWARE ==========
 * Validates notification, broadcast, report, and interview-related requests
 */

/**
 * Validates broadcast notification
 */
export const validateBroadcast = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { title, content, targetAudience, specificEmails } = req.body;
  const errors: string[] = [];

  if (!title || title.trim().length === 0) {
    errors.push("Broadcast title is required");
  } else if (title.length > 200) {
    errors.push("Title cannot exceed 200 characters");
  }

  if (!content || content.trim().length === 0) {
    errors.push("Broadcast content is required");
  } else if (content.length > 2000) {
    errors.push("Content cannot exceed 2000 characters");
  }

  if (!targetAudience) {
    errors.push("Target audience is required");
  } else {
    const validAudiences = ["all", "job_seekers", "recruiters", "specific"];
    if (!validAudiences.includes(targetAudience)) {
      errors.push(`Invalid target audience. Valid values: ${validAudiences.join(", ")}`);
    }
  }

  // Validate specific emails if targetAudience is "specific"
  if (targetAudience === "specific") {
    if (!specificEmails || !Array.isArray(specificEmails) || specificEmails.length === 0) {
      errors.push("Specific emails are required when target audience is 'specific'");
    }
  }

  if (errors.length > 0) {
    res.status(400).json({
      success: false,
      message: "Validation failed",
      errors
    });
  }

  next();
};

/**
 * Validates job report
 */
export const validateJobReport = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { jobId, reason, description } = req.body;
  const errors: string[] = [];

  if (!jobId || jobId.trim().length === 0) {
    errors.push("Job ID is required");
  }

  if (!reason || reason.trim().length === 0) {
    errors.push("Report reason is required");
  } else if (reason.length > 200) {
    errors.push("Reason cannot exceed 200 characters");
  }

  if (!description || description.trim().length === 0) {
    errors.push("Report description is required");
  } else if (description.length > 1000) {
    errors.push("Description cannot exceed 1000 characters");
  }

  if (errors.length > 0) {
    res.status(400).json({
      success: false,
      message: "Validation failed",
      errors
    });
    return;
  }

  // ✅ Validate jobId tồn tại trong DB
  try {
    const job = await JobListingModel.findById(jobId);
    if (!job) {
      res.status(404).json({
        success: false,
        message: "Không tìm thấy công việc này"
      });
      return;
    }

    // ✅ Kiểm tra báo cáo trùng lặp
    if ((req as any).user) {
      const existingReport = await Report.findOne({
        "reporter.userId": (req as any).user.userId,
        "reported.jobId": jobId,
        status: { $in: ["pending", "reviewing"] }
      });

      if (existingReport) {
        res.status(400).json({
          success: false,
          message: "Bạn đã báo cáo công việc này trước đó. Vui lòng đợi admin xử lý."
        });
        return;
      }
    }

    next();
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi khi validate báo cáo"
    });
  }
};

/**
 * Validates user report
 */
export const validateUserReport = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { userId, reason, description } = req.body;
  const errors: string[] = [];

  if (!userId || userId.trim().length === 0) {
    errors.push("User ID is required");
  }

  if (!reason || reason.trim().length === 0) {
    errors.push("Report reason is required");
  } else if (reason.length > 200) {
    errors.push("Reason cannot exceed 200 characters");
  }

  if (!description || description.trim().length === 0) {
    errors.push("Report description is required");
  } else if (description.length > 1000) {
    errors.push("Description cannot exceed 1000 characters");
  }

  if (errors.length > 0) {
    res.status(400).json({
      success: false,
      message: "Validation failed",
      errors
    });
    return;
  }

  // ✅ Validate userId tồn tại trong DB
  try {
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng này"
      });
      return;
    }

    // ✅ Kiểm tra báo cáo trùng lặp
    if ((req as any).user) {
      const existingReport = await Report.findOne({
        "reporter.userId": (req as any).user.userId,
        "reported.userId": userId,
        status: { $in: ["pending", "reviewing"] }
      });

      if (existingReport) {
        res.status(400).json({
          success: false,
          message: "Bạn đã báo cáo người dùng này trước đó. Vui lòng đợi admin xử lý."
        });
        return;
      }
    }

    next();
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi khi validate báo cáo"
    });
  }
};

/**
 * Validates report resolution
 */
export const validateReportResolution = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { status, adminNote } = req.body;

  if (!status) {
    sendBadRequestResponse(res, "Status is required");
    return;
  }

  const validStatuses = ["pending", "reviewing", "resolved", "rejected"];
  if (!validStatuses.includes(status)) {
    res.status(400).json({
      success: false,
      message: `Invalid status. Valid values: ${validStatuses.join(", ")}`
    });
  }

  if (adminNote && adminNote.length > 1000) {
    sendBadRequestResponse(res, "Admin note cannot exceed 1000 characters");
    return;
  }

  next();
};

/**
 * Validates interview creation
 */
export const validateInterviewCreation = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const {
    jobId,
    applicationId,
    jobSeekerId,
    scheduledDate,
    scheduledTime,
    duration
  } = req.body;

  const errors: string[] = [];

  // Required fields
  if (!jobId) errors.push("Job ID is required");
  if (!applicationId) errors.push("Application ID is required");
  if (!jobSeekerId) errors.push("Job Seeker ID is required");
  if (!scheduledDate) errors.push("Scheduled date is required");
  if (!scheduledTime) errors.push("Scheduled time is required");
  if (!duration) errors.push("Duration is required");

  // Validate scheduled date
  if (scheduledDate) {
    const schedDate = new Date(scheduledDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (isNaN(schedDate.getTime())) {
      errors.push("Invalid scheduled date format");
    } else if (schedDate < today) {
      errors.push("Scheduled date cannot be in the past");
    }
  }

  // Validate time format (HH:mm)
  if (scheduledTime) {
    const timePattern = /^([0-1][0-9]|2[0-3]):([0-5][0-9])$/;
    if (!timePattern.test(scheduledTime)) {
      errors.push("Invalid time format. Expected HH:mm (24-hour format)");
    }
  }

  // Validate duration (in minutes)
  if (duration !== undefined) {
    if (!Number.isInteger(duration) || duration < 15 || duration > 480) {
      errors.push("Duration must be between 15 and 480 minutes");
    }
  }

  // Validate location or meeting link
  if (!req.body.location && !req.body.meetingLink) {
    errors.push("Either location or meeting link is required");
  }

  if (errors.length > 0) {
    res.status(400).json({
      success: false,
      message: "Validation failed",
      errors
    });
  }

  next();
};

/**
 * Validates interview response
 */
export const validateInterviewResponse = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { accepted, rejectionReason } = req.body;

  if (accepted === undefined) {
    sendBadRequestResponse(res, "Accepted field is required (true/false)");
    return;
  }

  if (typeof accepted !== 'boolean') {
    sendBadRequestResponse(res, "Accepted must be a boolean value");
    return;
  }

  // Rejection reason is required if not accepted
  if (accepted === false && (!rejectionReason || rejectionReason.trim().length === 0)) {
    sendBadRequestResponse(res, "Rejection reason is required when declining interview");
    return;
  }

  if (rejectionReason && rejectionReason.length > 500) {
    sendBadRequestResponse(res, "Rejection reason cannot exceed 500 characters");
    return;
  }

  next();
};

/**
 * Validates interview result submission
 */
export const validateInterviewResult = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { passed, feedback } = req.body;

  if (passed === undefined) {
    sendBadRequestResponse(res, "Passed field is required (true/false)");
    return;
  }

  if (typeof passed !== 'boolean') {
    sendBadRequestResponse(res, "Passed must be a boolean value");
    return;
  }

  if (!feedback || feedback.trim().length === 0) {
    sendBadRequestResponse(res, "Feedback is required");
    return;
  }

  if (feedback.length > 2000) {
    sendBadRequestResponse(res, "Feedback cannot exceed 2000 characters");
    return;
  }

  next();
};
