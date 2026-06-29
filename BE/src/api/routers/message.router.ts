import { Router } from "express";
import { verifyToken } from "../middleware/auth.middleware";
import * as ctrl from "../controller/message.controller";

const r = Router();

// Get all messages in conversation
r.get("/:conversationId", verifyToken, ctrl.getMessages);

// Get latest messages
r.get("/:conversationId/latest", verifyToken, ctrl.getLatestMessages);

// Get total unread count
r.get("/unread-count", verifyToken, ctrl.getTotalUnreadCount);

// Get unread count in conversation
r.get("/:conversationId/unread-count", verifyToken, ctrl.getUnreadCount);

// Mark messages as read
r.post("/:conversationId/mark-read", verifyToken, ctrl.markMessagesRead);

// Mark messages as seen
r.post("/:conversationId/mark-seen", verifyToken, ctrl.markMessagesSeen);

// Send message
r.post("/:conversationId/send", verifyToken, ctrl.sendMessage);

export default r;
