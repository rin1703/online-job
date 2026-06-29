import { Schema, model, Types } from "mongoose";

const ConversationSchema = new Schema(
  {
    recruiterId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    candidateId: { type: Schema.Types.ObjectId, ref: "User", required: true },

    lastMessage: { type: Schema.Types.ObjectId, ref: "Message" },
    lastMessageAt: { type: Date },
  },
  { timestamps: true }
);

ConversationSchema.index({ candidateId: 1, recruiterId: 1 }, { unique: true });

export const ConversationModel = model("Conversation", ConversationSchema);
