import mongoose, { Schema, Document } from "mongoose";

const IndustrySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true, // Auto add createdAt, updatedAt
  }
);

export const IndustryModel = mongoose.model(
  "Industry",
  IndustrySchema,
  "industries"
);
export default IndustryModel;
