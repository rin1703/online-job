/**
 * Application Model Middleware
 * Handles pre-save validations and business logic for Application documents
 */

import mongoose from "mongoose";
import { ApplicationStatus } from "../models/enum/applicationStatus.enum";
import { ERROR_MESSAGES } from "../../helper/constants.helper";

/**
 * Prevents duplicate job applications
 * Allows reapplication only if previous application was withdrawn or rejected
 */
export async function preventDuplicateApplication(next: Function) {
  // @ts-ignore - 'this' refers to the document being saved
  const application = this;

  if (!application.isNew) {
    return next();
  }

  try {
    const existingApplication = await mongoose.model("Application").findOne({
      jobId: application.jobId,
      jobSeekerId: application.jobSeekerId,
      status: {
        $nin: [ApplicationStatus.WITHDRAWN, ApplicationStatus.REJECTED],
      },
    });

    if (existingApplication) {
      const error = new Error(ERROR_MESSAGES.DUPLICATE_APPLICATION);
      return next(error);
    }

    next();
  } catch (error) {
    next(error);
  }
}
