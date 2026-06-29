import { Types } from "mongoose";
import { MessageModel } from "../models/message.model";
import { ConversationModel } from "../models/conversation.model";

/**
 * Send a message in a conversation
 */
export const sendMessage = async (
  conversationId: string,
  senderId: string,
  content?: string,
  attachments?: { url: string; type?: string }[],
  messageType = "text"
) => {
  try {
    // Validate content
    if (!content && (!attachments || attachments.length === 0)) {
      throw new Error("Message cannot be empty");
    }

    const convo = await ConversationModel.findById(conversationId);
    if (!convo) throw new Error("Conversation not found");

    const sender = senderId.toString();

    // Bảo vệ: sender phải là recruiter hoặc candidate của conversation
    if (
      sender !== convo.recruiterId._id.toString() &&
      sender !== convo.candidateId._id.toString()
    ) {
      throw new Error("You are not allowed to send messages in this conversation");
    }



    const receiver =
      convo.recruiterId.toString() === sender
        ? convo.candidateId.toString()
        : convo.recruiterId.toString();

    // Create message
    const msg = await MessageModel.create({
      conversationId,
      senderId,
      receiverId: receiver,
      content,
      attachments,
      messageType,
    });

    // Update last message
    convo.lastMessage = msg._id;
    convo.lastMessageAt = new Date();
    await convo.save();

    // Populate for FE
    await msg.populate("senderId", "firstName lastName email role profilePicture");
    await msg.populate("receiverId", "firstName lastName email role profilePicture");

    return msg;
  } catch (err: any) {
    throw new Error(`Failed to send message: ${err.message}`);
  }
};

/**
 * Get full messages with pagination
 */
export const getMessagesByConversation = async (
  conversationId: string,
  page = 1,
  limit = 50
) => {
  try {
    const skip = (page - 1) * limit;
    const convObjId = new Types.ObjectId(conversationId);

    const messages = await MessageModel.find({ conversationId: convObjId })
      .populate("senderId", "firstName lastName email role profilePicture")
      .populate("receiverId", "firstName lastName email role profilePicture")
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await MessageModel.countDocuments({ conversationId: convObjId });

    return {
      messages,
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    };
  } catch (err: any) {
    throw new Error(`Failed to get messages: ${err.message}`);
  }
};

/**
 * Mark messages as read
 */
export const markMessagesRead = async (conversationId: string, userId: string) => {
  try {
    return await MessageModel.updateMany(
      {
        conversationId,
        receiverId: userId,
        read: false,
      },
      {
        read: true,
        readAt: new Date(),
      }
    );
  } catch (err: any) {
    throw new Error(`Failed to mark messages as read: ${err.message}`);
  }
};

/**
 * Mark messages as seen
 */
export const markMessagesSeen = async (conversationId: string, userId: string) => {
  try {
    return await MessageModel.updateMany(
      {
        conversationId,
        seenBy: { $ne: userId },
      },
      {
        $addToSet: { seenBy: userId },
      }
    );
  } catch (err: any) {
    throw new Error(`Failed to mark messages as seen: ${err.message}`);
  }
};

/**
 * Get newest messages
 */
export const getLatestMessages = async (conversationId: string, limit = 20) => {
  try {
    const convObjId = new Types.ObjectId(conversationId);

    const messages = await MessageModel.find({ conversationId: convObjId })
      .populate("senderId", "firstName lastName email role profilePicture")
      .populate("receiverId", "firstName lastName email role profilePicture")
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return messages.reverse();
  } catch (err: any) {
    throw new Error(`Failed to get latest messages: ${err.message}`);
  }
};

/**
 * Get unread count in 1 conversation
 */
export const getUnreadCount = async (conversationId: string, userId: string) => {
  try {
    return await MessageModel.countDocuments({
      conversationId,
      receiverId: userId,
      read: false,
    });
  } catch (err: any) {
    throw new Error(`Failed to get unread count: ${err.message}`);
  }
};

/**
 * Get ALL unread messages for user
 */
export const getTotalUnreadCount = async (userId: string) => {
  try {
    return await MessageModel.countDocuments({
      receiverId: userId,
      read: false,
    });
  } catch (err: any) {
    throw new Error(`Failed to get total unread count: ${err.message}`);
  }
};
