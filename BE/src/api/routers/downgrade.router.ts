import { Router } from "express";
import {
  createDowngradePreview,
  selectKeepJobs,
  confirmDowngrade,
  applyDowngrade,
  getChangeRequestStatus,
} from "../controller/downgrade.controller";
import { authMiddleware, requireRole } from "../middleware/auth.middleware";
import { UserRole } from "../models/enum/userRole.enum";

const router = Router();

router.post(
  "/downgrade/preview",
  authMiddleware,
  requireRole(UserRole.RECRUITER),
  createDowngradePreview
);

router.post(
  "/downgrade/select",
  authMiddleware,
  requireRole(UserRole.RECRUITER),
  selectKeepJobs
);

router.post(
  "/downgrade/confirm/:id",
  authMiddleware,
  requireRole(UserRole.RECRUITER),
  confirmDowngrade
);

router.post(
  "/downgrade/apply/:id",
  authMiddleware,
  requireRole(UserRole.RECRUITER),
  applyDowngrade
);

router.get(
  "/downgrade/status/:id",
  authMiddleware,
  requireRole(UserRole.RECRUITER),
  getChangeRequestStatus
);

export default router;
