import { Schema, model } from "mongoose";

const JobPackageSchema = new Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String },
    price: { type: Number, required: true },
    durationDays: { type: Number, required: true }, // Thời gian đăng bài (vd: 30 ngày)
    maxJobPosts: { type: Number, required: true }, // Số lượng bài đăng
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const JobPackageModel = model("JobPackage", JobPackageSchema);
export default JobPackageModel;
