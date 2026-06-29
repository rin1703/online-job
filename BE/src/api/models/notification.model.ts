import mongoose, { Schema } from "mongoose";
import { UserRole } from "./enum/userRole.enum";
import { NotificationType } from "./enum/notificationType.enum";
import { CUSTOM_TIMESTAMP_SCHEMA_OPTIONS } from "./common/schemaConfig";

/**
 * ========== NOTIFICATION MODEL ==========
 * Lưu trữ tất cả thông báo trong hệ thống
 * Gửi qua 2 kênh: Email + In-App
 */

const NotificationSchema = new mongoose.Schema(
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
    type: {
      type: String,
      enum: Object.values(NotificationType),
      required: true,
    },
    sender: {
      userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: false,
      },
      role: {
        type: String,
        enum: Object.values(UserRole),
        required: true,
      },
      name: String,
    },
    recipient: {
      userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      role: {
        type: String,
        enum: Object.values(UserRole),
        required: true,
      },
      email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
      },
    },
    metadata: {
      jobId: Schema.Types.ObjectId,
      applicationId: Schema.Types.ObjectId,
      interviewId: Schema.Types.ObjectId,
      reportId: Schema.Types.ObjectId,
      actionUrl: String,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    sentViaEmail: {
      type: Boolean,
      default: false,
    },
    emailSentAt: Date,
    readAt: Date,
  },
  CUSTOM_TIMESTAMP_SCHEMA_OPTIONS
);

// Indexes để tối ưu query
NotificationSchema.index({
  "recipient.userId": 1,
  createdAt: -1,
});
NotificationSchema.index({
  "recipient.userId": 1,
  isRead: 1,
});
NotificationSchema.index({
  type: 1,
  createdAt: -1,
});

const Notification = mongoose.model(
  "Notification",
  NotificationSchema,
  "notifications"
);
export default Notification;
