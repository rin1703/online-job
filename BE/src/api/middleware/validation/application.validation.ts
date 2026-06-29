import { Request, Response, NextFunction } from "express";
import { sendBadRequestResponse } from "../../../helper/response.helper";

/**
 * ========== APPLICATION VALIDATION MIDDLEWARE ==========
 * Validates application-related requests
 */

/**
 * Validates job application submission
 */
export const validateApplicationSubmission = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { jobId, resume } = req.body;
  const errors: string[] = [];

  if (!jobId || jobId.trim().length === 0) {
    errors.push("Job ID is required");
  }

  if (!resume || resume.trim().length === 0) {
    errors.push("Resume/CV is required");
  }

  if (req.body.coverLetter && req.body.coverLetter.length > 2000) {
    errors.push("Cover letter cannot exceed 2000 characters");
  }

  if (req.body.expectedSalary !== undefined) {
    if (typeof req.body.expectedSalary !== 'number' || req.body.expectedSalary < 0) {
      errors.push("Expected salary must be a positive number");
    }
  }

  if (req.body.availableDate) {
    const availableDate = new Date(req.body.availableDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (isNaN(availableDate.getTime())) {
      errors.push("Invalid available date format");
    } else if (availableDate < today) {
      errors.push("Available date cannot be in the past");
    }
  }

  if (errors.length > 0) {
    res.status(400).json({
      success: false,
      message: "Validation failed",
      errors
    });
    return;
  }

  next();
};

/**
 * Validates application review (approve/reject)
 */
export const validateApplicationReview = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { status, recruiterNote } = req.body;
  const errors: string[] = [];

  if (!status) {
    errors.push("Status is required");
  } else if (!["approved", "rejected"].includes(status)) {
    errors.push("Status must be 'approved' or 'rejected'");
  }

  if (status === "rejected" && (!recruiterNote || recruiterNote.trim().length === 0)) {
    errors.push("Recruiter note is required when rejecting an application");
  }

  if (recruiterNote && recruiterNote.length > 1000) {
    errors.push("Recruiter note cannot exceed 1000 characters");
  }

  if (errors.length > 0) {
    res.status(400).json({
      success: false,
      message: "Validation failed",
      errors
    });
    return;
  }

  next();
};

/**
 * Validates application status update (reviewed/interview_scheduled/approved/rejected)
 */
export const validateApplicationStatusUpdate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { status, recruiterNote } = req.body;
  const errors: string[] = [];

  if (!status) {
    errors.push("Status is required");
  } else {
    const validStatuses = ["reviewed", "interview_scheduled", "approved", "rejected"];
    if (validStatuses.indexOf(status) === -1) {
      errors.push(`Status must be one of: ${validStatuses.join(", ")}`);
    }
  }

  if (recruiterNote && recruiterNote.length > 1000) {
    errors.push("Recruiter note cannot exceed 1000 characters");
  }

  if (errors.length > 0) {
    res.status(400).json({
      success: false,
      message: "Validation failed",
      errors
    });
    return;
  }

  next();
};

/**
 * Validates application withdrawal
 */
export const validateApplicationWithdrawal = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { reason } = req.body;

  if (reason && reason.length > 500) {
    res.status(400).json({
      success: false,
      message: "Withdrawal reason cannot exceed 500 characters"
    });
    return;
  }

  next();
};

/**
 * Validates application filter query params
 */
export const validateApplicationFilters = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { status, page, limit, sortBy, sortOrder } = req.query;

  const errors: string[] = [];

  if (status) {
    const validStatuses = ["pending", "reviewed", "approved", "rejected", "interview_scheduled", "withdrawn"];
    if (!validStatuses.includes(status as string)) {
      errors.push(`Invalid status. Valid values: ${validStatuses.join(", ")}`);
    }
  }

  if (page && (isNaN(Number(page)) || Number(page) < 1)) {
    errors.push("Page must be a positive number");
  }

  if (limit && (isNaN(Number(limit)) || Number(limit) < 1 || Number(limit) > 100)) {
    errors.push("Limit must be between 1 and 100");
  }

  if (sortBy) {
    const validSortFields = ["appliedAt", "reviewedAt", "status"];
    if (!validSortFields.includes(sortBy as string)) {
      errors.push(`Invalid sortBy field. Valid values: ${validSortFields.join(", ")}`);
    }
  }

  if (sortOrder && !["asc", "desc"].includes(sortOrder as string)) {
    errors.push("Sort order must be 'asc' or 'desc'");
  }

  if (errors.length > 0) {
    res.status(400).json({
      success: false,
      message: "Validation failed",
      errors
    });
    return;
  }

  next();
};
