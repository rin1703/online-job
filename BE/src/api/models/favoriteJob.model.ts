import mongoose, { Schema, Document } from "mongoose";

// Interface cho TypeScript
export interface IFavoriteJob extends Document {
  userId: mongoose.Types.ObjectId;
  jobId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Schema Mongoose
const favoriteJobSchema: Schema<IFavoriteJob> = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    jobId: { type: Schema.Types.ObjectId, ref: "Job", required: true },
  },
  { timestamps: true }
);

// Model
const FavoriteJob = mongoose.model<IFavoriteJob>("FavoriteJob", favoriteJobSchema);

// Export default để TypeScript nhận dạng module
export default FavoriteJob;
