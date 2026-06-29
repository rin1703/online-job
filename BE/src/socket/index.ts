import { Server } from "socket.io";
import http from "http";
import * as msgService from "../api/service/message.service";
import * as convoService from "../api/service/conversation.service";

// Track online users
interface OnlineUser {
  socketId: string;
  userId: string;
  role: "recruiter" | "jobseeker";
}

const onlineUsers = new Map<string, OnlineUser>();

export const setupSocket = (server: http.Server) => {
  const io = new Server(server, {
    cors: { origin: "http://localhost:5173", credentials: true },
  });

  io.on("connection", (socket) => {
    console.log("🔌 Connected:", socket.id);

    /**
     * User comes online with their role
     */
    socket.on("user_online", (data: { userId: string; role: "recruiter" | "jobseeker" }) => {
      const { userId, role } = data;
      onlineUsers.set(userId, {
        socketId: socket.id,
        userId,
        role,
      });
      console.log(`👤 User online: ${userId} (${role})`);
      io.emit("update_online_users", Array.from(onlineUsers.keys()));
    });

    socket.on("disconnect", () => {
      for (const [uid, user] of onlineUsers.entries()) {
        if (user.socketId === socket.id) {
          console.log(`👤 User offline: ${uid}`);
          onlineUsers.delete(uid);
        }
      }
      io.emit("update_online_users", Array.from(onlineUsers.keys()));
    });

    /**
     * User joins a conversation room
     */
    socket.on("join_conversation", (conversationId: string) => {
      socket.join(conversationId);
      console.log(`📍 User joined conversation: ${conversationId}`);
    });

    socket.on("leave_conversation", (conversationId: string) => {
      socket.leave(conversationId);
      console.log(`📍 User left conversation: ${conversationId}`);
    });

    /**
     * Typing indicator
     */
    socket.on("typing", ({ conversationId, userId }) => {
      socket.to(conversationId).emit("user_typing", { conversationId, userId });
    });

    socket.on("stop_typing", ({ conversationId, userId }) => {
      socket.to(conversationId).emit("user_stop_typing", { conversationId, userId });
    });

    /**
     * Send message in conversation
     */
    socket.on("send_message", async (data) => {
      try {
        const { conversationId, senderId, content, attachments } = data;

        const msg = await msgService.sendMessage(
          conversationId,
          senderId,
          content,
          attachments
        );

        const payload = {
          message: msg,
          conversationId,
        };

        // Broadcast to conversation room
        io.to(conversationId).emit("receive_message", payload);

        // Notify receiver if online
        const receiverId = msg.receiverId.toString();
        if (onlineUsers.has(receiverId)) {
          const receiver = onlineUsers.get(receiverId)!;
          io.to(receiver.socketId).emit("new_message_notification", payload);
        }
      } catch (err) {
        console.error("❌ send_message error:", err);
        socket.emit("message_error", { error: (err as any).message });
      }
    });

    /**
     * Mark messages as read
     */
    socket.on("mark_read", async (data) => {
      try {
        const { conversationId, userId } = data;
        await msgService.markMessagesRead(conversationId, userId);

        io.to(conversationId).emit("messages_marked_read", {
          conversationId,
          userId,
        });
      } catch (err) {
        console.error("❌ mark_read error:", err);
      }
    });

    /**
     * Get online users
     */
    socket.on("get_online_users", () => {
      socket.emit("online_users_list", Array.from(onlineUsers.keys()));
    });
  });

  return io;
};
