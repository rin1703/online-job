import mongoose from "mongoose";
import { STANDARD_SCHEMA_OPTIONS, EMAIL_FIELD } from "./common/schemaConfig";

const OTPSchema = new mongoose.Schema(
  {
    email: EMAIL_FIELD,
    otp: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 },
    },
    isUsed: {
      type: Boolean,
      default: false,
    },
  },
  STANDARD_SCHEMA_OPTIONS
);

// Index để tìm kiếm nhanh
OTPSchema.index({ email: 1, otp: 1 });

const OTP = mongoose.model("OTP", OTPSchema, "otps");
export default OTP;