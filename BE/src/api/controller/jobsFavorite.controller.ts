// src/api/routers/jobsFavorite.route.ts

import { Request, Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import jobService from "../service/jobsFavorite.service";

const getRequestParamString = (param: string | string[] | undefined, name = "parameter"): string => {
  if (!param) {
    throw new Error(`${name} is required`);
  }
  return Array.isArray(param) ? param[0] : param;
};

/**
 * Toggle favorite job
 * POST /jobs/:jobId/favorite
 */
export const toggleFavoriteJob = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const jobId = getRequestParamString(req.params.jobId, "jobId");

        const result = await jobService.toggleFavorite(userId, jobId);

        return res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error("toggleFavoriteJob error:", error);
        return res.status(500).json({ message: "Error updating favorite" });
    }
};

/**
 * Get all jobs with isFavorite flag
 * GET /jobs
 */
export const getJobsForUser = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const jobs = await jobService.getJobsForUser(userId);

        return res.json({
            success: true,
            data: jobs
        });
    } catch (error) {
        console.error("getJobsForUser error:", error);
        return res.status(500).json({ message: "Error fetching jobs" });
    }
};

/**
 * Get job detail with isFavorite
 * GET /jobs/:jobId
 */
export const getJobDetail = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const jobId = getRequestParamString(req.params.jobId, "jobId");

        const job = await jobService.getJobDetail(userId, jobId);
        if (!job) {
            return res.status(404).json({ message: "Job not found" });
        }

        return res.json({
            success: true,
            data: job
        });
    } catch (error) {
        console.error("getJobDetail error:", error);
        return res.status(500).json({ message: "Error fetching job detail" });
    }
};
