import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequest } from "./auth.middleware";
import { getUserSubscriptionInfo } from "../service/subscription.service";
import { JobListingModel } from "../models/jobListing.model";
import { JobListingStatus } from "../models/enum/jobListingStatus.enum";

/**
 * Middleware: Kiểm tra user có subscription active không
 */
export const requireActiveSubscription = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.body.userId || req.params.userId || req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        ok: false,
        message: "User not authenticated",
      });
    }

    const subscriptionInfo = await getUserSubscriptionInfo(userId);

    if (!subscriptionInfo.hasSubscription) {
      return res.status(403).json({
        ok: false,
        message: "Active subscription required",
        requiresUpgrade: true,
      });
    }

    // Gắn subscription info vào request để dùng trong controller
    req.subscriptionInfo = subscriptionInfo;
    next();
  } catch (err: any) {
    res.status(500).json({
      ok: false,
      message: err.message,
    });
  }
};

/**
 * Middleware: Enforce job post creation limit based on current subscription features
 * - Counts recruiter's ACTIVE job posts
 * - Compares against features.jobPostings.limit (negative => unlimited)
 * - Blocks creation if used >= limit
 */
export const enforceJobPostCreationLimit = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId || (req as any).body?.recruiterId;

    if (!userId) {
      return res.status(401).json({
        ok: false,
        message: "User not authenticated",
      });
    }

    const subInfo = await getUserSubscriptionInfo(userId);
    const limit = subInfo?.features?.jobPostings?.limit;

    // If limit is undefined -> treat as no limit
    if (typeof limit !== "number" || limit < 0) {
      return next();
    }

    const used = await JobListingModel.countDocuments({
      recruiterId: userId,
      status: JobListingStatus.ACTIVE,
      isDeleted: false,
    });

    if (used >= limit) {
      return res.status(403).json({
        ok: false,
        message: "Job posting limit reached for your current plan",
        requiresUpgrade: true,
        overLimit: true,
        usage: { used, limit, available: 0 },
      });
    }

    return next();
  } catch (err: any) {
    return res.status(500).json({
      ok: false,
      message: err.message || "Failed to enforce job post creation limit",
    });
  }
};

/**
 * Middleware: Kiểm tra user có quyền sử dụng feature không
 */
export const checkFeatureAccess = (featurePath: string) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.body.userId || req.params.userId || req.user?.userId;

      if (!userId) {
        return res.status(401).json({
          ok: false,
          message: "User not authenticated",
        });
      }

      const subscriptionInfo = await getUserSubscriptionInfo(userId);
      
      // Gắn vào request
      req.subscriptionInfo = subscriptionInfo;

      // Check feature access
      const hasAccess = checkFeatureEnabled(
        subscriptionInfo.features,
        featurePath
      );

      if (!hasAccess) {
        return res.status(403).json({
          ok: false,
          message: `Feature not available in your current plan`,
          currentPlan: subscriptionInfo.packageType,
          requiresUpgrade: true,
        });
      }

      next();
    } catch (err: any) {
      res.status(500).json({
        ok: false,
        message: err.message,
      });
    }
  };
};

/**
 * Middleware: Attach subscription info vào request (không block)
 */
export const attachSubscriptionInfo = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.body.userId || req.params.userId || req.user?.userId;

    if (userId) {
      const subscriptionInfo = await getUserSubscriptionInfo(userId);
      req.subscriptionInfo = subscriptionInfo;
    }

    next();
  } catch (err: any) {
    // Không block request nếu có lỗi
    next();
  }
};

/**
 * Helper: Kiểm tra feature có enabled không
 */
function checkFeatureEnabled(features: any, path: string): boolean {
  const keys = path.split(".");
  let current = features;

  for (const key of keys) {
    if (current === undefined || current === null) {
      return false;
    }
    current = current[key];
  }

  // Check các trường hợp khác nhau
  if (typeof current === "boolean") {
    return current;
  }
  if (typeof current === "number") {
    return current > 0 || current === -1; // -1 = unlimited
  }
  if (current === "none") {
    return false;
  }

  return !!current;
}

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      subscriptionInfo?: {
        hasSubscription: boolean;
        packageType: string;
        packageName?: string;
        startDate?: Date;
        endDate?: Date;
        daysRemaining?: number;
        features: any;
      };
    }
  }
}

export default {
  requireActiveSubscription,
  checkFeatureAccess,
  attachSubscriptionInfo,
};