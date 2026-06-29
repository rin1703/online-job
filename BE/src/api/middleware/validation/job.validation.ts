import { Request, Response, NextFunction } from "express";
import { sendBadRequestResponse } from "../../../helper/response.helper";

/**
 * ========== JOB LISTING VALIDATION MIDDLEWARE ==========
 * Validates job listing-related requests
 */

/**
 * Validates job listing creation
 */
export const validateJobCreation = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const {
    title,
    experienceLevel,
    salaryMin,
    salaryMax,
    numberOfPositions,
    overview,
    responsibilities,
    requirements,
  } = req.body;

  const errors: string[] = [];

  if (!title || title.trim().length === 0) {
    errors.push("Job title is required");
  } else if (title.length < 5 || title.length > 100) {
    errors.push("Job title must be between 5 and 100 characters");
  }

  if (!experienceLevel) errors.push("Experience level is required");

  if (salaryMin !== undefined && salaryMin < 0) {
    errors.push("Minimum salary cannot be negative");
  }

  if (salaryMax !== undefined && salaryMax < 0) {
    errors.push("Maximum salary cannot be negative");
  }

  if (salaryMin && salaryMax && salaryMax < salaryMin) {
    errors.push(
      "Maximum salary must be greater than or equal to minimum salary"
    );
  }

  if (numberOfPositions !== undefined) {
    if (!Number.isInteger(numberOfPositions) || numberOfPositions < 1) {
      errors.push("Number of positions must be a positive integer");
    }
  }

  if (!overview || !Array.isArray(overview) || overview.length === 0) {
    errors.push("Job overview is required and must be an array of strings");
  }

  if (
    !responsibilities ||
    !Array.isArray(responsibilities) ||
    responsibilities.length === 0
  ) {
    errors.push("At least one responsibility is required (must be an array)");
  }

  if (
    !requirements ||
    !Array.isArray(requirements) ||
    requirements.length === 0
  ) {
    errors.push("At least one requirement is required (must be an array)");
  }

  if (req.body.applicationDeadline) {
    const deadline = new Date(req.body.applicationDeadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (isNaN(deadline.getTime())) {
      errors.push("Invalid application deadline format");
    } else if (deadline < today) {
      errors.push("Application deadline cannot be in the past");
    }
  }

  if (errors.length > 0) {
    res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
    return;
  }

  return next();
};

/**
 * Validates job listing update
 */
export const validateJobUpdate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const body = req.body;

  // Check if body is empty
  if (!body || Object.keys(body).length === 0) {
    sendBadRequestResponse(res, "Request body cannot be empty");
    return;
  }

  const errors: string[] = [];

  // Validate title if provided
  if (body.title !== undefined) {
    if (!body.title || body.title.trim().length === 0) {
      errors.push("Job title cannot be empty");
    } else if (body.title.length < 5 || body.title.length > 100) {
      errors.push("Job title must be between 5 and 100 characters");
    }
  }

  // Validate salary if provided
  if (body.salaryMin !== undefined && body.salaryMin < 0) {
    errors.push("Minimum salary cannot be negative");
  }

  if (body.salaryMax !== undefined && body.salaryMax < 0) {
    errors.push("Maximum salary cannot be negative");
  }

  if (body.salaryMin && body.salaryMax && body.salaryMax < body.salaryMin) {
    errors.push(
      "Maximum salary must be greater than or equal to minimum salary"
    );
  }

  // Validate number of positions if provided
  if (body.numberOfPositions !== undefined) {
    if (
      !Number.isInteger(body.numberOfPositions) ||
      body.numberOfPositions < 1
    ) {
      errors.push("Number of positions must be a positive integer");
    }
  }

  if (errors.length > 0) {
    res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
    return;
  }

  return next();
};

/**
 * Validates job status update
 */
export const validateJobStatusUpdate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { status } = req.body;

  if (!status) {
    sendBadRequestResponse(res, "Status is required");
    return;
  }

  const validStatuses = ["draft", "active", "hidden", "closed"];
  if (!validStatuses.includes(status)) {
    res.status(400).json({
      success: false,
      message: `Invalid status. Valid values: ${validStatuses.join(", ")}`,
    });
    return;
  }

  return next();
};

/**
 * Validates admin approval/rejection
 */
export const validateJobApproval = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { approvalStatus, rejectionReason } = req.body;

  if (!approvalStatus) {
    sendBadRequestResponse(res, "Approval status is required");
    return;
  }

  const validStatuses = ["approved", "rejected", "pending"];
  if (!validStatuses.includes(approvalStatus)) {
    res.status(400).json({
      success: false,
      message: `Invalid approval status. Valid values: ${validStatuses.join(
        ", "
      )}`,
    });
    return;
  }

  // Rejection reason is required for rejected status
  if (
    approvalStatus === "rejected" &&
    (!rejectionReason || rejectionReason.trim().length === 0)
  ) {
    sendBadRequestResponse(
      res,
      "Rejection reason is required when rejecting a job"
    );
    return;
  }

  return next();
};

/**
 * Validates job listing query filters
 */
export const validateJobFilters = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { status, page, limit } = req.query;

  // Validate status
  if (status) {
    const validStatuses = ["draft", "active", "hidden", "closed"];
    if (!validStatuses.includes(status as string)) {
      res.status(400).json({
        success: false,
        message: `Invalid status. Valid values: ${validStatuses.join(", ")}`,
      });
      return;
    }
  }

  // Validate pagination
  if (page && (isNaN(Number(page)) || Number(page) < 1)) {
    res.status(400).json({
      success: false,
      message: "Page must be a positive number",
    });
    return;
  }

  if (
    limit &&
    (isNaN(Number(limit)) || Number(limit) < 1 || Number(limit) > 100)
  ) {
    res.status(400).json({
      success: false,
      message: "Limit must be between 1 and 100",
    });
    return;
  }

  return next();
};
