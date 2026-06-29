import mongoose, { Schema, Document } from "mongoose";

/**
 * Activation Token Model
 * Lưu token kích hoạt tài khoản recruiter sau khi admin duyệt
 * Token có thời hạn 30 phút
 */

export interface IActivationToken extends Document {
  userId: mongoose.Types.ObjectId;
  token: string;
  expiresAt: Date;
  isUsed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const activationTokenSchema = new Schema<IActivationToken>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      // TTL index được khai báo bên dưới
    },
    isUsed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Tự động xóa token đã hết hạn (TTL Index)
activationTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const ActivationToken = mongoose.model<IActivationToken>(
  "ActivationToken",
  activationTokenSchema,
  "activation_tokens"
);

export default ActivationToken;
