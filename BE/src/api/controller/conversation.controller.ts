import { Request, Response } from "express";
import * as convoService from "../service/conversation.service";

const getRequestParamString = (
  param: string | string[] | undefined,
  name = "parameter"
): string => {
  if (!param) {
    throw new Error(`${name} is required`);
  }
  return Array.isArray(param) ? param[0] : param;
};

export const createConversation = async (req: Request, res: Response) => {
  try {
    const { recruiterId, candidateId } = req.body;
    console.log("[createConversation] Request body:", req.body);
    const user = (req as any).user;
    console.log("[createConversation] User:", user);

    if (!user)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    // Only recruiter hoặc candidate có thể tạo conversation
    if (user.userId !== recruiterId && user.userId !== candidateId) {
      return res.status(403).json({ success: false, message: "Not allowed" });
    }

    const convo = await convoService.findOrCreateConversation(
      recruiterId,
      candidateId
    );

    return res.json({ success: true, data: convo });
  } catch (err: any) {
    console.error("[createConversation] Error:", err);
    return res.status(400).json({ success: false, message: err.message });
  }
};

export const getUserConvos = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    console.log("[getUserConvos] User ID:", userId);

    const conversations = await convoService.getUserConversations(userId);

    return res.json({ success: true, data: conversations });
  } catch (err: any) {
    console.error("[getUserConvos] Error:", err);
    return res.status(400).json({ success: false, message: err.message });
  }
};

export const getConversationDetail = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const conversationId = getRequestParamString(req.params.conversationId, "conversationId");
    console.log("[getConversationDetail] User ID:", userId, "Conversation ID:", conversationId);

    const conversation = await convoService.getConversationById(conversationId);

    if (
      conversation.candidateId._id.toString() !== userId &&
      conversation.recruiterId._id.toString() !== userId
    ) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    return res.json({ success: true, data: conversation });
  } catch (err: any) {
    console.error("[getConversationDetail] Error:", err);
    return res.status(400).json({ success: false, message: err.message });
  }
};
