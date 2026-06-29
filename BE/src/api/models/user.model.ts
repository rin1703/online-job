import mongoose, { Schema } from "mongoose";
import { UserRole } from "./enum/userRole.enum";
import { AccountStatus } from "./enum/accountStatus.enum";
import {
  CUSTOM_TIMESTAMP_SCHEMA_OPTIONS,
  FIELD_CONSTRAINTS,
} from "./common/schemaConfig";

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: Object.values(UserRole),
      required: true,
    },
    birthday: { type: Date, required: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },

    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: false,
      index: true,
    },

    profileId: {
      type: Schema.Types.ObjectId,
      ref: "Profile",
      required: false,
      index: true,
      sparse: true,
    },

    isActive: { type: Boolean, default: true },

    // Account Status cho Recruiter (pending -> approved -> active)
    accountStatus: {
      type: String,
      enum: Object.values(AccountStatus),
      default: function(this: any) {
        // Recruiter mặc định là pending, các role khác là active
        return this.role === UserRole.RECRUITER ? AccountStatus.PENDING : AccountStatus.ACTIVE;
      },
      index: true,
    },

    // Lý do từ chối (nếu admin reject)
    rejectionReason: {
      type: String,
      required: false,
    },

    // Thời gian admin duyệt/từ chối
    reviewedAt: {
      type: Date,
      required: false,
    },

    // Admin đã duyệt/từ chối
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    managerId: {
      type: Schema.Types.ObjectId,
      ref: "CompanyLocation",
      required: false,
      index: true,
      default: null,
    },
    loginAttempts: {
      type: Number,
      default: FIELD_CONSTRAINTS.INITIAL_LOGIN_ATTEMPTS,
    },
    lockUntil: { type: Date, default: null },

  // Soft delete
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null },
  deletedBy: { type: Schema.Types.ObjectId, ref: "users", default: null }, // Admin ID who deleted
  deleteReason: { type: String, default: null }, // Lý do xóa (optional)
  // Google login
  googleId: { type: String, required: false },
  },
  CUSTOM_TIMESTAMP_SCHEMA_OPTIONS
);

const User = mongoose.model("User", UserSchema, "users");
export default User;



