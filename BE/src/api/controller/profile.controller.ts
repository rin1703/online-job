import { Request, Response } from "express";
import * as profileService from "../service/profile.service";
import * as userService from "../service/user.service";
import { UpsertProfileDTO } from "../dto/profile/profile.dto";
import { HTTP_STATUS } from "../../helper/constants.helper";
import {
  sendSuccessResponse,
  sendNotFoundResponse,
  sendBadRequestResponse,
  handleInternalError,
} from "../../helper/response.helper";
import { ERROR_MESSAGES } from "../../helper/constants.helper";

/**
 * Retrieves user profile by userId
 * GET /profiles/:userId
 */
export async function getUserProfile(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).user?.userId as string;
    if (!userId) {
      sendBadRequestResponse(res, "User not authenticated");
      return;
    }
    const profile = await profileService.getProfileByUser(userId);

    if (!profile) {
      sendNotFoundResponse(res, "Profile");
      return;
    }

    sendSuccessResponse(res, "Profile retrieved successfully", profile);
  } catch (error) {
    handleInternalError(res, error, "Getting profile");
  }
}

/**
 * Creates or updates complete profile (PUT operation)
 * PUT /profiles/:userId
 */
export async function createOrUpdateProfile(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).user?.userId as string;
    if (!userId) {
      sendBadRequestResponse(res, "User not authenticated");
      return;
    }
    // Validation đã được xử lý ở middleware
    const profileData: UpsertProfileDTO = {
      userId,
      ...req.body
    };

    const updatedProfile = await profileService.upsertProfile(profileData);

    sendSuccessResponse(res, "Profile saved successfully", updatedProfile);
  } catch (error) {
    handleInternalError(res, error, "Upserting profile");
  }
}

/**
 * Partially updates profile (PATCH operation)
 * PATCH /profiles/:userId
 */
export async function updateProfilePartially(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).user?.userId as string;
    if (!userId) {
      sendBadRequestResponse(res, "User not authenticated");
      return;
    }
    
    const updatedProfile = await profileService.patchProfile(userId, req.body);

    if (!updatedProfile) {
      sendNotFoundResponse(res, "Profile");
      return;
    }

    sendSuccessResponse(res, "Profile updated successfully", updatedProfile);
  } catch (error) {
    handleInternalError(res, error, "Patching profile");
  }
}

// ==================== Work Experience Management ====================

/**
 * Adds new work experience to profile
 * POST /profiles/:userId/experience
 */
export async function addWorkExperience(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).user?.userId as string;
    if (!userId) {
      sendBadRequestResponse(res, "User not authenticated");
      return;
    }
    const updatedProfile = await profileService.addWorkExperience(userId, req.body);

    if (!updatedProfile) {
      sendNotFoundResponse(res, "Profile");
      return;
    }

    sendSuccessResponse(res, "Work experience added successfully", updatedProfile);
  } catch (error) {
    handleInternalError(res, error, "Adding work experience");
  }
}

/**
 * Updates existing work experience
 * PUT /profiles/:userId/experience/:expId
 */
export async function updateWorkExperience(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).user?.userId as string;
    const expId = String(req.params.expId);
    if (!userId) {
      sendBadRequestResponse(res, "User not authenticated");
      return;
    }
    const updatedProfile = await profileService.updateWorkExperience(
      userId,
      expId,
      req.body
    );

    if (!updatedProfile) {
      sendNotFoundResponse(res, "Profile or Work Experience");
      return;
    }

    sendSuccessResponse(res, "Work experience updated successfully", updatedProfile);
  } catch (error) {
    handleInternalError(res, error, "Updating work experience");
  }
}

/**
 * Removes work experience from profile
 * DELETE /profiles/:userId/experience/:expId
 */
export async function removeWorkExperience(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).user?.userId as string;
    const expId = String(req.params.expId);
    if (!userId) {
      sendBadRequestResponse(res, "User not authenticated");
      return;
    }
    const updatedProfile = await profileService.deleteWorkExperience(userId, expId);

    if (!updatedProfile) {
      sendNotFoundResponse(res, "Profile or Work Experience");
      return;
    }

    sendSuccessResponse(res, "Work experience deleted successfully", updatedProfile);
  } catch (error) {
    handleInternalError(res, error, "Deleting work experience");
  }
}

// ==================== Cross-Role Profile Viewing ====================

/**
 * Gets JobSeeker profile for viewing by anyone (no restrictions)
 * GET /profiles/jobseeker/:userId
 */
export async function getJobSeekerProfileForRecruiter(req: Request, res: Response): Promise<void> {
  try {
    const userId = String(req.params.userId);
    // Validation đã được xử lý ở middleware, targetUser đã được xác thực

    const profile = await profileService.getProfileForViewing(userId);

    if (!profile) {
      sendNotFoundResponse(res, "Profile");
      return;
    }

    sendSuccessResponse(res, "JobSeeker profile retrieved successfully", profile);
  } catch (error) {
    handleInternalError(res, error, "Getting JobSeeker profile");
  }
}

/**
 * Gets Recruiter profile for viewing by anyone (no restrictions)
 * GET /profiles/recruiter/:userId
 */
export async function getRecruiterProfileForJobSeeker(req: Request, res: Response): Promise<void> {
  try {
    const userId = String(req.params.userId);
    // Validation đã được xử lý ở middleware, targetUser đã được xác thực

    const recruiterProfile = await userService.getRecruiterProfile(userId);

    if (!recruiterProfile) {
      sendNotFoundResponse(res, "Recruiter profile");
      return;
    }

    sendSuccessResponse(res, "Recruiter profile retrieved successfully", recruiterProfile);
  } catch (error) {
    handleInternalError(res, error, "Getting Recruiter profile");
  }
}
