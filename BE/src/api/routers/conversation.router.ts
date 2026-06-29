import { Router } from "express";
import {
    createConversation,
    getUserConvos,
    getConversationDetail,
} from "../controller/conversation.controller";
import { verifyToken } from "../middleware/auth.middleware";

const r = Router();

console.log("Loading conversation routes...");

/**
 * Get all conversations for logged-in user
 * MOVED TO TOP to avoid conflict with /:conversationId (though it shouldn't matter if logic is correct, safety first)
 */
r.get("/me", verifyToken, getUserConvos);

/**
 * Create or get existing conversation
 * body: { recruiterId, candidateId }
 */
r.post("/", verifyToken, createConversation);

/**
 * Get conversation detail
 */
r.get("/:conversationId", verifyToken, getConversationDetail);

export default r;
