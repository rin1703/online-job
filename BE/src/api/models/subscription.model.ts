import mongoose, { Schema } from "mongoose";

const SubscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    packageId: {
      type: Schema.Types.ObjectId,
      ref: "SubscriptionPackage",
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "expired", "cancelled", "refunded"],
      default: "active",
    },
    autoRenew: {
      type: Boolean,
      default: false,
    },
    // Lưu snapshot của features tại thời điểm mua
    features: {
      type: Schema.Types.Mixed,
      required: true,
    },
    firstUsageAt: {
      type: Date,
      default: null,
    },

    usageCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Index để query nhanh
SubscriptionSchema.index({ userId: 1, status: 1 });
SubscriptionSchema.index({ endDate: 1, status: 1 });

export const SubscriptionModel = mongoose.model(
  "Subscription",
  SubscriptionSchema
);
export default SubscriptionModel;
