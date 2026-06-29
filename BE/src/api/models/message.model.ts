import { Schema, model } from "mongoose";

const MessageSchema = new Schema(
  {
    conversationId: { type: Schema.Types.ObjectId, ref: "Conversation", required: true },
    senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    receiverId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },

    attachments: [
      {
        url: String,
        type: String,
      },
    ],

    // Read status
    read: { type: Boolean, default: false },
    readAt: { type: Date },
    seenBy: [{ type: Schema.Types.ObjectId, ref: "User" }],

    // Message type: text, file, system message
    messageType: { type: String, enum: ["text", "file", "system"], default: "text" },

    // Reply to message
    replyToMessageId: { type: Schema.Types.ObjectId, ref: "Message" },
  },
  { timestamps: true }
);

// Indexes để optimize query
MessageSchema.index({ conversationId: 1, createdAt: -1 });
MessageSchema.index({ receiverId: 1, read: 1 }); // Unread count
MessageSchema.index({ senderId: 1, createdAt: -1 });

export const MessageModel = model("Message", MessageSchema);
