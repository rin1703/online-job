import mongoose, { Schema } from "mongoose";

const RefundRequestSchema = new mongoose.Schema(
  {
    recruiterId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    subscriptionId: {
      type: Schema.Types.ObjectId,
      ref: "Subscription",
      required: true,
    },
    reference: { type: String },
    reason: { type: String, required: true },
    // Type of refund requested — recruiter must choose when creating request
    refundType: {
      type: String,
      enum: ["unused", "system"],
      required: true,
      default: "unused",
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "processed", "failed"],
      default: "pending",
    },
    processedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    processedAt: { type: Date, default: null },
    notes: { type: String, default: null },
  },
  { timestamps: true }
);
RefundRequestSchema.index({ recruiterId: 1, status: 1 });

export const RefundRequestModel = mongoose.model(
  "RefundRequest",
  RefundRequestSchema
);
export default RefundRequestModel;
