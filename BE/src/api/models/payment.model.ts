import mongoose, { Schema } from "mongoose";

const PaymentSchema = new mongoose.Schema(
  {
    orderCode: { type: String, required: true, unique: true },

    recruiterId: { type: Schema.Types.ObjectId, ref: "User", required: true },

    jobPackageId: {
      type: Schema.Types.ObjectId,
      ref: "JobPackage",
      required: false,
    },

    purpose: {
      type: String,
      enum: ["subscription", "wallet_topup", "wallet_payment"],
      default: "subscription",
    },

    publicCode: { type: String, required: true, unique: true },

    amount: { type: Number, required: true }, // số tiền thực tế phải nạp

    originAmount: { type: Number, required: false }, // giá gốc package

    walletBalanceBefore: { type: Number, required: false }, // số dư ví trước khi tạo QR

    description: { type: String, required: true },

    status: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },

    paymentUrl: { type: String },

    refundStatus: {
      type: String,
      enum: ["none", "pending", "success", "failed"],
      default: "none",
    },

    refundReason: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

export const PaymentModel = mongoose.model("Payment", PaymentSchema);
