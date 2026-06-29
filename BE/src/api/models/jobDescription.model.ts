import mongoose from "mongoose";
import { STANDARD_SCHEMA_OPTIONS } from "./common/schemaConfig";

const JobDescriptionSchema = new mongoose.Schema(
  {
    jobListingId: {
      type: mongoose.Types.ObjectId,
      ref: "JobListing",
      required: true,
      index: true,
    },
    overview: {
      type: [String],
      required: true,
      validate: {
        validator: (arr: string[]) => arr.length > 0,
        message: "At least one overview is required.",
      },
    },
    responsibilities: {
      type: [String],
      required: true,
      validate: {
        validator: (arr: string[]) => arr.length > 0,
        message: "At least one responsibility is required.",
      },
    },
    requirements: {
      type: [String],
      required: true,
      validate: {
        validator: (arr: string[]) => arr.length > 0,
        message: "At least one requirement is required.",
      },
    },
    benefits: {
      type: [String],
      default: [],
    },
    niceToHave: {
      type: [String],
      default: [],
    },
    workingSchedule: {
      type: [String],
      default: [],
    },
  },
  STANDARD_SCHEMA_OPTIONS
);

export const JobDescriptionModel = mongoose.model(
  "JobDescription",
  JobDescriptionSchema,
  "jobdescriptions"
);
export default JobDescriptionModel;
