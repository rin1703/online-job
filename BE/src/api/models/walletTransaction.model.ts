import mongoose, { Schema } from "mongoose";

const WalletTransactionSchema = new Schema(
  {
    walletId: {
      type: Schema.Types.ObjectId,
      ref: "Wallet",
      required: true,
    },
    type: {
      type: String,
      enum: ["credit", "debit"],
      required: true,
    },
    amount: { type: Number, required: true },
    reference: { type: String }, // orderCode, subscriptionId...
    description: { type: String },
  },
  { timestamps: true }
);

export const WalletTransactionModel = mongoose.model(
  "WalletTransaction",
  WalletTransactionSchema
);
