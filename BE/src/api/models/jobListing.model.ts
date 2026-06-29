import mongoose, { Schema } from "mongoose";
import {
  JobListingStatus,
  JobApprovalStatus,
} from "./enum/jobListingStatus.enum";
import "../models/industry.model";

const JobListingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 100,
    },
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },
    recruiterId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    locationId: {
      type: Schema.Types.ObjectId,
      ref: "CompanyLocation",
      required: true,
    },
    jobDescriptionId: { type: Schema.Types.ObjectId, ref: "JobDescription" },
    industryIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "Industry",
        required: true,
      },
    ],
    jobTypeId: {
      type: Schema.Types.ObjectId,
      ref: "JobType",
      required: true,
    },
    experienceLevel: {
      type: String,
      required: true,
    },
    salaryMin: { type: Number, min: 0 },
    salaryMax: { type: Number, min: 0 },
    salaryCurrency: { type: String, default: "USD" },
    numberOfPositions: { type: Number, min: 1, default: 1 },
    applicationDeadline: { type: Date },

    status: {
      type: String,
      enum: Object.values(JobListingStatus),
      default: JobListingStatus.DRAFT,
    },

    approvalStatus: {
      type: String,
      enum: Object.values(JobApprovalStatus),
      default: JobApprovalStatus.PENDING,
      index: true,
    },
    rejectionReason: {
      type: String,
      trim: true,
      maxlength: 500,
      default: null,
    },
    rejectCount: {
      type: Number,
      default: 0,
    },

    autoHideAt: {
      type: Date,
      default: null,
    },

    views: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },

    isRemote: { type: Boolean, default: false },
    isHybrid: { type: Boolean, default: false },

    // ⚡ Thêm trường skills & benefits để phục vụ search
    skills: [{ type: String, trim: true }],
    benefits: [{ type: String, trim: true }],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// 4️⃣ Index for search
JobListingSchema.index({ title: "text", skills: "text", benefits: "text" });
// ⚡ Optional: Composite index để filter nhanh hơn
JobListingSchema.index({ status: 1, approvalStatus: 1, isDeleted: 1 });
JobListingSchema.index({ experienceLevel: 1 });
JobListingSchema.index({ isRemote: 1 });
JobListingSchema.index({ isHybrid: 1 });

export const JobListingModel = mongoose.model(
  "JobListing",
  JobListingSchema,
  "joblistings"
);
export default JobListingModel;
