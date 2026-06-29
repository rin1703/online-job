import SubscriptionChangeRequestModel from "../models/cleanLising.model";
import { DowngradeRequestStatus } from "../models/enum/dowgradeRequestStatus.enum";
import SubscriptionModel from "../models/subscription.model";
import SubscriptionPackage from "../models/subscriptionPackage.model";
import JobListingModel from "../models/jobListing.model";
import { Types } from "mongoose";
import {
  CreatePreviewDowngradeDTO,
  PreviewDowngradeResponseDTO,
} from "../dto/dowgrade/createDowgrade.dto";
import {
  SelectKeepJobsDTO,
  SelectKeepJobsResponseDTO,
} from "../dto/dowgrade/keepListing.dto";
import {
  ConfirmDowngradeDTO,
  ConfirmDowngradeResponseDTO,
} from "../dto/dowgrade/confirmDowgrade.dto";
import {
  ApplyDowngradeDTO,
  ApplyDowngradeResponseDTO,
} from "../dto/dowgrade/applyDowgade.dto";

import { ChangeRequestStatusDTO } from "../dto/dowgrade/changeStatus.dto";

export const createPreviewService = async (
  userId: string,
  dto: CreatePreviewDowngradeDTO
): Promise<PreviewDowngradeResponseDTO> => {
  const currentSub = await SubscriptionModel.findOne({
    userId,
    status: "active",
  }).populate("packageId");

  if (!currentSub) throw new Error("No active subscription found");

  const newPackage = await SubscriptionPackage.findById(dto.packageId);
  if (!newPackage) throw new Error("Package not found");

  const publishedJobs = await JobListingModel.countDocuments({
    recruiterId: userId,
    status: "active",
    approvalStatus: "approved",
  });

  const allowed = newPackage.features.jobPostings.limit;
  const excess = Math.max(0, publishedJobs - allowed);

  const request = await SubscriptionChangeRequestModel.create({
    userId,
    fromSubscriptionId: currentSub._id,
    toPackageId: dto.packageId,
    newLimits: {
      jobPostingsLimit: allowed,
      featuredLimit: 0,
    },
    currentCounts: {
      publishedJobs,
      featuredJobs: 0,
    },
    excess: {
      jobsToHideCount: excess,
      featuredToRemoveCount: 0,
    },
    status: DowngradeRequestStatus.PENDING_PREVIEW,
  });

  return {
    requestId: request._id.toString(),
    currentPublished: publishedJobs,
    allowed,
    excess,
    currentPackage: (currentSub.packageId as any)?.name,
    newPackage: newPackage.name,
  };
};

export const selectKeepJobsService = async (
  userId: string,
  dto: SelectKeepJobsDTO
): Promise<SelectKeepJobsResponseDTO> => {
  const reqDoc = await SubscriptionChangeRequestModel.findById(dto.requestId);

  if (!reqDoc) throw new Error("Downgrade request not found");
  if (reqDoc.userId.toString() !== userId.toString())
    throw new Error("Not authorized");

  if (reqDoc.status !== DowngradeRequestStatus.PENDING_PREVIEW)
    throw new Error("Invalid state");

  if (dto.keepJobIds.length > reqDoc.newLimits.jobPostingsLimit)
    throw new Error("Too many jobs selected");

  reqDoc.selectedKeepJobIds = dto.keepJobIds.map(
    (id) => new Types.ObjectId(id)
  );
  reqDoc.status = DowngradeRequestStatus.AWAITING_CONFIRMATION;
  await reqDoc.save();

  return {
    message: "Selection saved",
    requestId: reqDoc._id.toString(),
    selectedCount: dto.keepJobIds.length,
    allowed: reqDoc.newLimits.jobPostingsLimit,
    excess: reqDoc.excess.jobsToHideCount,
  };
};

export const confirmDowngradeService = async (
  userId: string,
  dto: ConfirmDowngradeDTO
): Promise<ConfirmDowngradeResponseDTO> => {
  const reqDoc = await SubscriptionChangeRequestModel.findById(dto.requestId);

  if (!reqDoc) throw new Error("Request not found");
  if (reqDoc.userId.toString() !== userId.toString())
    throw new Error("Not authorized");

  if (reqDoc.status !== DowngradeRequestStatus.AWAITING_CONFIRMATION)
    throw new Error("Invalid state");

  reqDoc.status = DowngradeRequestStatus.APPLYING;
  await reqDoc.save();

  return {
    message: "Confirmed. Applying downgrade.",
    requestId: reqDoc._id.toString(),
    status: DowngradeRequestStatus.APPLYING,
  };
};

export const applyDowngradeService = async (
  userId: string,
  dto: ApplyDowngradeDTO
): Promise<ApplyDowngradeResponseDTO> => {
  const reqDoc = await SubscriptionChangeRequestModel.findById(
    dto.requestId
  ).populate("toPackageId");

  if (!reqDoc) throw new Error("Downgrade request not found");

  if (reqDoc.userId.toString() !== userId.toString())
    throw new Error("Not authorized");

  if (reqDoc.status !== DowngradeRequestStatus.APPLYING)
    throw new Error("Invalid state");

  // Expire old subscription
  const oldSub = await SubscriptionModel.findOne({
    userId,
    status: "active",
  });

  if (oldSub) {
    oldSub.status = "expired";
    await oldSub.save();
  }

  // Create new subscription
  const pkg: any = reqDoc.toPackageId;
  const startDate = new Date();
  const endDate = new Date();

  endDate.setMonth(endDate.getMonth() + pkg.duration.value);

  const newSub = await SubscriptionModel.create({
    userId,
    packageId: pkg._id,
    remainingPosts: pkg.features.postLimit,
    startDate,
    endDate,
    status: "active",
  });

  // Hide excess jobs
  const hideResult = await JobListingModel.updateMany(
    {
      recruiterId: userId,
      status: "active",
      _id: { $nin: reqDoc.selectedKeepJobIds },
    },
    { $set: { status: "hidden" } }
  );

  reqDoc.status = DowngradeRequestStatus.APPLIED;
  await reqDoc.save();

  return {
    message: "Downgrade applied successfully",
    newSubscriptionId: newSub._id.toString(),
    hiddenJobsCount: hideResult.modifiedCount,
    keptJobsCount: reqDoc.selectedKeepJobIds.length,
  };
};

export const getChangeRequestService = async (
  requestId: string
): Promise<ChangeRequestStatusDTO> => {
  const reqDoc = await SubscriptionChangeRequestModel.findById(
    requestId
  ).lean();
  if (!reqDoc) throw new Error("Request not found");

  const dto: ChangeRequestStatusDTO = {
    requestId: reqDoc._id.toString(),
    status: reqDoc.status,
    currentCounts: reqDoc.currentCounts,
    newLimits: reqDoc.newLimits,
    excess: reqDoc.excess,
    selectedKeepJobIds: (reqDoc.selectedKeepJobIds || []).map((id: any) =>
      id.toString()
    ),
    enforcementPolicy: {
      allowGraceUntil:
        reqDoc.enforcementPolicy?.allowGraceUntil ?? null,
      hardCreationBlock:
        reqDoc.enforcementPolicy?.hardCreationBlock ?? false,
    },
    notes: reqDoc.notes ?? null,
    createdAt: reqDoc.createdAt,
  };

  return dto;
};
