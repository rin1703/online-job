import mongoose, { Schema } from "mongoose";

const WalletSchema = new Schema(
  {
    recruiterId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    balance: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export const WalletModel = mongoose.model("Wallet", WalletSchema, "wallet");
