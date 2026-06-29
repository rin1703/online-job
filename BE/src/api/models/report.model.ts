import mongoose, { Schema } from "mongoose";
import { UserRole } from "./enum/userRole.enum";
import { ReportStatus, ReportType } from "./enum/reportStatus.enum";
import { CUSTOM_TIMESTAMP_SCHEMA_OPTIONS } from "./common/schemaConfig";

/**
 * Report Model
 * Stores violation reports from JobSeekers/Recruiters
 */

const ReportSchema = new Schema(
  {
    reportType: {
      type: String,
      enum: Object.values(ReportType),
      required: true,
    },
    reporter: {
      userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      role: {
        type: String,
        enum: Object.values(UserRole),
        required: true,
      },
      email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
      },
      name: {
        type: String,
        required: true,
      },
    },
    reported: {
      jobId: Schema.Types.ObjectId,
      userId: Schema.Types.ObjectId,
      email: String,
      name: String,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    evidence: [String],
    status: {
      type: String,
      enum: Object.values(ReportStatus),
      default: ReportStatus.PENDING,
    },
    adminNote: String,
    resolvedBy: Schema.Types.ObjectId,
    resolvedAt: Date,
  },
  CUSTOM_TIMESTAMP_SCHEMA_OPTIONS
);

ReportSchema.index({ status: 1, createdAt: -1 });
ReportSchema.index({ "reporter.userId": 1 });
ReportSchema.index({ "reported.userId": 1 });
ReportSchema.index({ "reported.jobId": 1 });

const Report = mongoose.model("Report", ReportSchema, "reports");
export default Report;
