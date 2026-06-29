import mongoose from "mongoose";

const jobTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
});

export const JobTypeModel = mongoose.model(
  "JobType",
  jobTypeSchema,
  "jobtypes"
);
export default JobTypeModel;
