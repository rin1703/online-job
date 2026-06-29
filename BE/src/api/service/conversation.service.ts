import { Types } from "mongoose";
import { ConversationModel } from "../models/conversation.model";

export const findOrCreateConversation = async (
  recruiterId: string,
  candidateId: string
) => {
  const convo = await ConversationModel.findOne({
    recruiterId: new Types.ObjectId(recruiterId),
    candidateId: new Types.ObjectId(candidateId),
  });

  if (convo) return convo;

  return await ConversationModel.create({
    recruiterId,
    candidateId,
  });
};

export const getUserConversations = async (userId: string) => {
  return await ConversationModel.find({
    $or: [{ candidateId: userId }, { recruiterId: userId }],
  })
    .populate("candidateId", "firstName lastName email role profilePicture")
    .populate("recruiterId", "firstName lastName email role profilePicture")
    .populate("lastMessage")
    .sort({ updatedAt: -1 })
    .lean();
};

export const getConversationById = async (conversationId: string) => {
  return await ConversationModel.findById(conversationId)
    .populate("candidateId", "_id firstName lastName email role profilePicture")
    .populate("recruiterId", "_id firstName lastName email role profilePicture")
    .populate("lastMessage");
};
