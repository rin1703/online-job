/**
 * Profile Routes
 * Defines API endpoints for user profile management
 */

import { Router } from "express";
import * as profileController from "../controller/profile.controller";
import { validateObjectIdParam } from "../middleware/objectId.middleware";
import { verifyToken } from "../middleware/auth.middleware";
import { validateJobSeekerProfileAccess, validateRecruiterProfileAccess } from "../middleware/profileAccess.middleware";
import * as profileService from "../service/profile.service";
import {
  uploadAvatar,
  uploadCV,
  uploadToCloudinary,
} from "../middleware/upload.middleware";
import {
  sendSuccessResponse,
  sendBadRequestResponse,
  sendNotFoundResponse,
  handleInternalError,
} from "../../helper/response.helper";
import {
  validateProfileUpsert,
  validateProfilePatch,
  validateWorkExperience
} from "../middleware/validation";

const router = Router();

// ==================== Profile CRUD Operations ====================

/**
 * GET / - Get current user profile (from token)
 */
router.get(
  "/",
  verifyToken,
  profileController.getUserProfile
);

/**
 * PUT / - Create or completely update current user profile (from token)
 */
router.put(
  "/",
  verifyToken,
  validateProfileUpsert,
  profileController.createOrUpdateProfile
);

/**
 * PATCH / - Partially update current user profile (from token)
 */
router.patch(
  "/",
  verifyToken,
  validateProfilePatch,
  profileController.updateProfilePartially
);

// ==================== Work Experience Operations ====================

/**
 * POST /experiences - Add work experience to current user (from token)
 */
router.post(
  "/experiences",
  verifyToken,
  validateWorkExperience,
  profileController.addWorkExperience
);

/**
 * PUT /experiences/:expId - Update work experience of current user (from token)
 */
router.put(
  "/experiences/:expId",
  verifyToken,
  validateObjectIdParam("expId"),
  validateWorkExperience,
  profileController.updateWorkExperience
);

/**
 * DELETE /experiences/:expId - Delete work experience of current user (from token)
 */
router.delete(
  "/experiences/:expId",
  verifyToken,
  validateObjectIdParam("expId"),
  profileController.removeWorkExperience
);

// ==================== File Upload Operations ====================

/**
 * POST /avatar - Upload avatar image for current user (from token)
 */
router.post(
  "/avatar",
  verifyToken,
  uploadAvatar.single("avatar"),
  async (req, res) => {
    try {
      if (!req.file) {
        sendBadRequestResponse(res, "No file uploaded");
        return;
      }

      const uploadResult = await uploadToCloudinary(req.file.buffer, {
        folder: "jobportal/avatars",
        resource_type: "image",
      });

      const avatarUrl = uploadResult.secure_url;

      const userId = (req as any).user?.userId;
      if (!userId) {
        sendBadRequestResponse(res, "User not authenticated");
        return;
      }

      const updatedProfile = await profileService.patchProfile(
        userId,
        { avatar: avatarUrl }
      );

      if (!updatedProfile) {
        sendNotFoundResponse(res, "Profile");
        return;
      }

      sendSuccessResponse(res, "Avatar uploaded successfully", {
        avatar: avatarUrl,
        public_id: uploadResult.public_id,
      });
    } catch (error) {
      handleInternalError(res, error, "Uploading avatar");
    }
  }
);

/**
 * POST /cv - Upload CV (PDF) for current user (from token)
 */
router.post(
  "/cv",
  verifyToken,
  uploadCV.single("cv"),
  async (req, res) => {
    try {
      if (!req.file) {
        sendBadRequestResponse(res, "No PDF file uploaded");
        return;
      }

      const uploadResult = await uploadToCloudinary(req.file.buffer, {
        folder: "jobportal/cvs",
        resource_type: "raw",
      });

      const cvUrl = uploadResult.secure_url;

      const userId = (req as any).user?.userId;
      if (!userId) {
        sendBadRequestResponse(res, "User not authenticated");
        return;
      }

      const updatedProfile = await profileService.patchProfile(
        userId,
        { cv: cvUrl }
      );

      if (!updatedProfile) {
        sendNotFoundResponse(res, "Profile");
        return;
      }

      sendSuccessResponse(res, "CV uploaded successfully", {
        cv: cvUrl,
        public_id: uploadResult.public_id,
      });
    } catch (error) {
      handleInternalError(res, error, "Uploading CV");
    }
  }
);

// ==================== Cross-Role Profile Viewing ====================

/**
 * GET /jobseeker/:userId - Get JobSeeker profile for viewing by anyone (no restrictions)
 */
router.get(
  "/jobseeker/:userId",
  verifyToken,
  validateJobSeekerProfileAccess,
  validateObjectIdParam("userId"),
  profileController.getJobSeekerProfileForRecruiter
);

/**
 * GET /recruiter/:userId - Get Recruiter profile for viewing by anyone (no restrictions)
 */
router.get(
  "/recruiter/:userId",
  verifyToken,
  validateRecruiterProfileAccess,
  validateObjectIdParam("userId"),
  profileController.getRecruiterProfileForJobSeeker
);

export default router;
