import { Router } from "express";
import { toggleFavoriteJob, getJobsForUser, getJobDetail } from "../controller/jobsFavorite.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

// GET all jobs
router.get("/", authMiddleware, getJobsForUser);

// GET job detail
router.get("/:jobId", authMiddleware, getJobDetail);

// POST toggle favorite
router.post("/:jobId/favorite", authMiddleware, toggleFavoriteJob);

export default router;
