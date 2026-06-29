import mongoose, { Schema } from "mongoose";

/**
 * Blacklisted Token Model
 * Lưu trữ các JWT token đã bị blacklist (đăng xuất)
 * Token sẽ được kiểm tra khi verify để đảm bảo không sử dụng lại
 */


const blacklistedTokenSchema = new Schema(
  {
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// TTL Index để tự động xóa token đã hết hạn
blacklistedTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const BlacklistedToken = mongoose.model("BlacklistedToken", blacklistedTokenSchema, "blacklisted_tokens");

export default BlacklistedToken;