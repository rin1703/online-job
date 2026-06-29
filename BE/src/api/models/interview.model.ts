import mongoose, { Schema } from "mongoose";
import { InterviewStatus } from "./enum/interviewStatus.enum";
import { STANDARD_SCHEMA_OPTIONS, FIELD_CONSTRAINTS } from "./common/schemaConfig";
/**
 * Interview Model
 * Stores interview schedules and responses from JobSeekers
 */

const InterviewSchema = new mongoose.Schema(
  {
    jobId: {
      type: Schema.Types.ObjectId,
      ref: "JobListing",
      required: true,
    },
    applicationId: {
      type: Schema.Types.ObjectId,
      ref: "Application",
      required: true,
    },
    recruiterId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    jobSeekerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    scheduledDate: {
      type: Date,
      required: true,
    },
    scheduledTime: {
      type: String,
      required: true,
      validate: {
        validator: (v: string) => FIELD_CONSTRAINTS.TIME_FORMAT_REGEX.test(v),
        message: 'Time must be in "HH:mm" format',
      },
    },
    duration: {
      type: Number,
      required: true,
      min: FIELD_CONSTRAINTS.MIN_INTERVIEW_DURATION,
      max: FIELD_CONSTRAINTS.MAX_INTERVIEW_DURATION,
    },
    location: String,
    meetingLink: String,
    note: String,
    status: {
      type: String,
      enum: Object.values(InterviewStatus),
      default: InterviewStatus.PENDING,
    },
    jobSeekerResponse: {
      accepted: Boolean,
      respondedAt: Date,
      rejectionReason: String,
    },
    result: {
      passed: Boolean,
      feedback: String,
      evaluatedAt: Date,
    },
  },
  STANDARD_SCHEMA_OPTIONS
);

// Indexes
InterviewSchema.index({ jobSeekerId: 1, status: 1 });
InterviewSchema.index({ recruiterId: 1, scheduledDate: 1 });
InterviewSchema.index({ status: 1, scheduledDate: 1 });
InterviewSchema.index({ applicationId: 1 });

const Interview = mongoose.model("Interview", InterviewSchema, "interviews");
export default Interview;
