import type { Conversation, Message, UserData } from "../types";

export const StorageService = {
    // Get all conversations for a user
    getConversations(userId: string): Conversation[] {
        try {
            const stored = localStorage.getItem(`conversations_${userId}`);
            return stored ? JSON.parse(stored) : [];
        } catch {
            return [];
        }
    },

    // Get messages between two users
    getMessages(userId: string, partnerId: string): Message[] {
        try {
            const key = [userId, partnerId].sort().join("_");
            const stored = localStorage.getItem(`messages_${key}`);
            return stored ? JSON.parse(stored) : [];
        } catch {
            return [];
        }
    },

    // Send a message
    sendMessage(
        senderId: string,
        receiverId: string,
        senderRole: "job_seeker" | "recruiter",
        text: string,
        attachment?: { url: string; type: "image" | "document"; name: string }
    ): Message {
        const message: Message = {
            id: Date.now().toString(),
            senderId,
            receiverId,
            senderRole,
            text,
            createdAt: new Date().toISOString(),
            attachment,
        };

        // Save message
        const key = [senderId, receiverId].sort().join("_");
        const existing = this.getMessages(senderId, receiverId);
        localStorage.setItem(`messages_${key}`, JSON.stringify([...existing, message]));

        // Update conversations for both users
        [senderId, receiverId].forEach((userId) => {
            const convs = this.getConversations(userId);
            const partnerId = userId === senderId ? receiverId : senderId;
            const idx = convs.findIndex((c) => c.partnerId === partnerId);

            if (idx >= 0) {
                convs[idx].lastMessage = message;
            } else {
                convs.push({ partnerId, lastMessage: message });
            }
            localStorage.setItem(`conversations_${userId}`, JSON.stringify(convs));
        });

        return message;
    },

    // Get current user from localStorage
    getCurrentUser(): UserData | null {
        try {
            // Try different storage keys
            const keys = ["user", "authUser", "currentUser"];

            for (const key of keys) {
                const userStr = localStorage.getItem(key) || sessionStorage.getItem(key);
                if (userStr) {
                    const user = JSON.parse(userStr);
                    if (user && user.role) {
                        return {
                            ...user,
                            role: user.role.toLowerCase() as "job_seeker" | "recruiter"
                        };
                    }
                }
            }
        } catch (error) {
            console.error("Error reading user from storage:", error);
        }
        return null;
    },

    // Cache partner info
    cachePartnerInfo(partnerId: string, role: "job_seeker" | "recruiter", name?: string) {
        try {
            localStorage.setItem(
                `partner_cache_${partnerId}`,
                JSON.stringify({ role, name, email: partnerId })
            );
        } catch { }
    },

    // Get cached partner info
    getPartnerInfo(partnerId: string) {
        try {
            const cached = localStorage.getItem(`partner_cache_${partnerId}`);
            if (cached) {
                return JSON.parse(cached);
            }
        } catch { }

        // Fallback: guess from email OR infer from myRole
        let role = "job_seeker";
        const currentUser = this.getCurrentUser();

        if (currentUser && currentUser.role) {
            role = currentUser.role === "recruiter" ? "job_seeker" : "recruiter";
        } else {
            const lower = partnerId.toLowerCase();
            const isRecruiter =
                lower.includes("recruiter") ||
                lower.includes("hr") ||
                lower.includes("talent") ||
                lower.includes("hiring");
            role = isRecruiter ? "recruiter" : "job_seeker";
        }

        return {
            role,
            name: partnerId.split("@")[0],
            email: partnerId,
        };
    },
};
