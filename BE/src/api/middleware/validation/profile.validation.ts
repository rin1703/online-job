import { Request, Response, NextFunction } from "express";
import { sendBadRequestResponse } from "../../../helper/response.helper";
import { VALIDATION_ERROR_MESSAGES, VALIDATION_RULES, isValidEmail, isValidPhone } from "./constants";

/**
 * ========== PROFILE VALIDATION MIDDLEWARE ==========
 * Validates profile-related requests before reaching controllers
 */

/**
 * Validates profile creation/update (PUT)
 * name is REQUIRED for PUT requests
 */
export const validateProfileUpsert = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { name } = req.body;

  if (!name || name.trim().length === 0) {
    sendBadRequestResponse(res, "Name is required");
    return;
  }

  if (name.length < 2 || name.length > 100) {
    sendBadRequestResponse(res, "Name must be between 2 and 100 characters");
    return;
  }

  next();
};

/**
 * Validates profile partial update (PATCH)
 * No required fields - all optional
 */
export const validateProfilePatch = (
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

  // Validate expectedSalary if provided
  if (body.expectedSalary !== undefined) {
    if (typeof body.expectedSalary !== 'number' || body.expectedSalary < 0) {
      sendBadRequestResponse(res, "Expected salary must be a positive number");
      return;
    }
  }

  next();
};

/**
 * Validates work experience data
 */
export const validateWorkExperience = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { title, company, startDate, isCurrent } = req.body;
  const errors: string[] = [];

  if (!title || title.trim().length === 0) {
    errors.push("Job title is required");
  }

  if (!company || company.trim().length === 0) {
    errors.push("Company name is required");
  }

  if (!startDate) {
    errors.push("Start date is required");
  } else {
    const start = new Date(startDate);
    if (isNaN(start.getTime())) {
      errors.push("Invalid start date format");
    }
  }

  if (isCurrent === undefined) {
    errors.push("isCurrent field is required (true/false)");
  }

  // Validate endDate if not current job
  if (!isCurrent && req.body.endDate) {
    const end = new Date(req.body.endDate);
    const start = new Date(startDate);
    
    if (isNaN(end.getTime())) {
      errors.push("Invalid end date format");
    } else if (end < start) {
      errors.push("End date cannot be before start date");
    }
  }

  if (errors.length > 0) {
    res.status(400).json({
      success: false,
      message: "Work experience validation failed",
      errors
    });
    return;
  }

  next();
};

/**
 * Validates education data
 */
export const validateEducation = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { school, degree, startDate } = req.body;
  const errors: string[] = [];

  if (!school || school.trim().length === 0) {
    errors.push("School name is required");
  }

  if (!degree || degree.trim().length === 0) {
    errors.push("Degree is required");
  }

  if (!startDate) {
    errors.push("Start date is required");
  } else {
    const start = new Date(startDate);
    if (isNaN(start.getTime())) {
      errors.push("Invalid start date format");
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
 * Validates project data
 */
export const validateProject = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { name } = req.body;

  if (!name || name.trim().length === 0) {
    sendBadRequestResponse(res, "Project name is required");
    return;
  }

  next();
};

/**
 * Validates certificate data
 */
export const validateCertificate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { title, organization, issueDate } = req.body;
  const errors: string[] = [];

  if (!title || title.trim().length === 0) {
    errors.push("Certificate title is required");
  }

  if (!organization || organization.trim().length === 0) {
    errors.push("Organization is required");
  }

  if (!issueDate) {
    errors.push("Issue date is required");
  } else {
    const issue = new Date(issueDate);
    if (isNaN(issue.getTime())) {
      errors.push("Invalid issue date format");
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
