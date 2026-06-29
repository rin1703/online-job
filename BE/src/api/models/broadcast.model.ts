import mongoose, { Schema } from "mongoose";
import { BroadcastStatus, BroadcastAudience } from "./enum/broadcastStatus.enum";
import { CUSTOM_TIMESTAMP_SCHEMA_OPTIONS } from "./common/schemaConfig";

/**
 * Broadcast Model
 * Stores broadcast notifications from Admin to multiple users
 */

const BroadcastSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    adminId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    adminName: {
      type: String,
      required: true,
    },
    targetAudience: {
      type: String,
      enum: Object.values(BroadcastAudience),
      required: true,
    },
    specificEmails: [
      {
        type: String,
        lowercase: true,
        trim: true,
      },
    ],
    totalRecipients: {
      type: Number,
      default: 0,
    },
    sentCount: {
      type: Number,
      default: 0,
    },
    readCount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: Object.values(BroadcastStatus),
      default: BroadcastStatus.DRAFT,
    },
    failedEmails: [String],
    sentAt: Date,
  },
  CUSTOM_TIMESTAMP_SCHEMA_OPTIONS
);

// Chỉ mục
BroadcastSchema.index({ status: 1, createdAt: -1 });
BroadcastSchema.index({ adminId: 1 });

const Broadcast = mongoose.model("Broadcast", BroadcastSchema, "broadcasts");
export default Broadcast;
