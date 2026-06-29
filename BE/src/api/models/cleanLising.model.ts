import mongoose, { Schema } from "mongoose";
import { DowngradeRequestStatus } from "./enum/dowgradeRequestStatus.enum";

const SubscriptionChangeRequestSchema = new mongoose.Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    fromSubscriptionId: {
      type: Schema.Types.ObjectId,
      ref: "Subscription",
      default: null,
    },
    toPackageId: {
      type: Schema.Types.ObjectId,
      ref: "SubscriptionPackage",
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(DowngradeRequestStatus),
      default: DowngradeRequestStatus.PENDING_PREVIEW,
      index: true,
    },
    currentCounts: {
      publishedJobs: { type: Number, default: 0 },
      featuredJobs: { type: Number, default: 0 },
    },
    newLimits: {
      jobPostingsLimit: { type: Number, required: true },
      featuredLimit: { type: Number, required: true },
    },
    excess: {
      jobsToHideCount: { type: Number, default: 0 },
      featuredToRemoveCount: { type: Number, default: 0 },
    },
    selectedKeepJobIds: [{ type: Schema.Types.ObjectId, ref: "JobListing" }],
    enforcementPolicy: {
      allowGraceUntil: { type: Date, default: null },
      hardCreationBlock: { type: Boolean, default: false },
    },
    notes: { type: String, default: null, trim: true },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

SubscriptionChangeRequestSchema.index({ userId: 1, status: 1, createdAt: -1 });
SubscriptionChangeRequestSchema.index({
  "enforcementPolicy.allowGraceUntil": 1,
});

export const SubscriptionChangeRequestModel = mongoose.model(
  "SubscriptionChangeRequest",
  SubscriptionChangeRequestSchema,
  "cleanListings"
);

export default SubscriptionChangeRequestModel;
