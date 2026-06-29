import { Request, Response } from "express";
import * as msgService from "../service/message.service";
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

export const getMessages = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const conversationId = getRequestParamString(req.params.conversationId, "conversationId");
    console.log("[getMessages] User ID:", userId, "Conversation ID:", conversationId);

    const convo = await convoService.getConversationById(conversationId);

    if (!convo) {
      return res.status(404).json({ success: false, message: "Conversation not found" });
    }

    if (
      convo.candidateId._id.toString() !== userId &&
      convo.recruiterId._id.toString() !== userId
    ) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const messages = await msgService.getMessagesByConversation(conversationId);

    res.json({ success: true, data: messages });
  } catch (err: any) {
    console.error("[getMessages] Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const sendMessage = async (req: Request, res: Response) => {
  try {
    const senderId = (req as any).user?.userId;
    const conversationId = getRequestParamString(req.params.conversationId, "conversationId");
    const { content, attachments } = req.body;
    console.log("[sendMessage] Sender ID:", senderId, "Conversation ID:", conversationId, "Content:", content);

    const msg = await msgService.sendMessage(
      conversationId,
      senderId,
      content,
      attachments
    );

    res.status(201).json({ success: true, data: msg });
  } catch (err: any) {
    console.error("[sendMessage] Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getLatestMessages = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const conversationId = getRequestParamString(req.params.conversationId, "conversationId");
    const { limit = 20 } = req.query;

    const convo = await convoService.getConversationById(conversationId);

    if (!convo) {
      return res.status(404).json({ success: false, message: "Conversation not found" });
    }

    if (
      convo.candidateId.toString() !== userId &&
      convo.recruiterId.toString() !== userId
    ) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const messages = await msgService.getLatestMessages(conversationId, Number(limit));

    res.json({ success: true, data: messages });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getTotalUnreadCount = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;

    const count = await msgService.getTotalUnreadCount(userId);

    res.json({ success: true, data: { unreadCount: count } });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getUnreadCount = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const conversationId = getRequestParamString(req.params.conversationId, "conversationId");

    const count = await msgService.getUnreadCount(conversationId, userId);

    res.json({ success: true, data: { unreadCount: count } });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const markMessagesRead = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const conversationId = getRequestParamString(req.params.conversationId, "conversationId");

    await msgService.markMessagesRead(conversationId, userId);

    res.json({ success: true, message: "Messages marked as read" });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const markMessagesSeen = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const conversationId = getRequestParamString(req.params.conversationId, "conversationId");

    await msgService.markMessagesSeen(conversationId, userId);

    res.json({ success: true, message: "Messages marked as seen" });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
