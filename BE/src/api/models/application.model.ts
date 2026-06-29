import mongoose, { Schema } from "mongoose";
import { ApplicationStatus } from "./enum/applicationStatus.enum";
import { CUSTOM_TIMESTAMP_SCHEMA_OPTIONS, FIELD_CONSTRAINTS } from "./common/schemaConfig";
import { preventDuplicateApplication } from "../middleware/application.middleware";

const ApplicationSchema = new mongoose.Schema(
  {
    jobId: {
      type: Schema.Types.ObjectId,
      ref: "JobListing", // Reference to JobListing model from main
      required: true,
    },
    jobSeekerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recruiterId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    candidateProfileId: {
      type: Schema.Types.ObjectId,
      ref: "Profile",
    },
    resume: {
      type: String,
      trim: true,
    },
    resumeUrl: {
      type: String,
      trim: true,
    },
    coverLetter: {
      type: String,
      maxlength: FIELD_CONSTRAINTS.LONG_TEXT_MAX,
    },
    expectedSalary: {
      type: Number,
      min: FIELD_CONSTRAINTS.MIN_SALARY,
    },
    availableDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: Object.values(ApplicationStatus),
      default: ApplicationStatus.PENDING,
    },
    recruiterNote: {
      type: String,
      maxlength: FIELD_CONSTRAINTS.RECRUITER_NOTE_MAX,
    },
    notes: {
      type: String,
    },
    reviewedAt: {
      type: Date,
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    source: {
      type: String,
      trim: true,
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
    statusUpdatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  CUSTOM_TIMESTAMP_SCHEMA_OPTIONS
);

// Indexes để tối ưu query
ApplicationSchema.index({ jobSeekerId: 1, status: 1 }); // JobSeeker xem đơn của mình
ApplicationSchema.index({ jobId: 1, status: 1 }); // Lấy applications theo job
ApplicationSchema.index({ recruiterId: 1, status: 1 }); // Recruiter xem đơn cần duyệt
ApplicationSchema.index({ status: 1, appliedAt: -1 }); // Sắp xếp theo thời gian
ApplicationSchema.index({ jobId: 1, jobSeekerId: 1 }); // Kiểm tra đã apply chưa
ApplicationSchema.index({ candidateProfileId: 1 }); // Tối ưu query CV

// Apply middleware
ApplicationSchema.pre("save", preventDuplicateApplication);

const Application = mongoose.model(
  "Application",
  ApplicationSchema,
  "applications"
);
export default Application;
