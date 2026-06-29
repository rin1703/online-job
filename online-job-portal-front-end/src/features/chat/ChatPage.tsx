import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { ChatSidebar } from "./components/ChatSidebar";
import { ChatWindow } from "./components/ChatWindow";
import type { ChatUser, UserData } from "./types";
import {
  useCreateConversationMutation,
  useGetConversationsQuery,
  useGetMessagesQuery,
  useSendMessageMutation,
} from "@/redux/features/chat/chatApi";

// =============================================
// MAIN CHAT PAGE
// =============================================
export default function ChatPage() {
  // Get current user from Redux state
  const reduxUser = useSelector((state: RootState) => state.auth.user);

  const currentUser: UserData | null = useMemo(() => {
    if (reduxUser) {
      return {
        _id: reduxUser.userId,
        id: reduxUser.userId,
        email: reduxUser.email,
        name: `${reduxUser.firstName || ""} ${reduxUser.lastName || ""}`.trim(),
        role: (reduxUser.role?.toLowerCase() === "recruiter" ? "recruiter" : "job_seeker") as
          | "recruiter"
          | "job_seeker",
      };
    }
    return null;
  }, [reduxUser]);

  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(null);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [text, setText] = useState("");

  // API Hooks
  const { data: conversations = [], refetch: refetchConversations } = useGetConversationsQuery(
    undefined,
    {
      skip: !currentUser,
      pollingInterval: 10000, // Poll every 10s for new conversations
    },
  );
  console.log("[ChatPage] Conversations:", conversations);

  const [createConversation] = useCreateConversationMutation();
  const [sendMessage] = useSendMessageMutation();

  // Helper to find conversation by partner ID
  const getConversationByPartnerId = (partnerId: string) => {
    return conversations.find((c) => {
      const partner = currentUser?.role === "recruiter" ? c.candidateId : c.recruiterId;
      return partner._id === partnerId;
    });
  };

  const selectedConversation = selectedPartnerId
    ? getConversationByPartnerId(selectedPartnerId)
    : null;

  // Fetch messages for selected conversation
  const { data: messages = [], refetch: refetchMessages } = useGetMessagesQuery(
    selectedConversation?._id || "",
    {
      skip: !selectedConversation,
      pollingInterval: 3000, // Poll every 3s for new messages
    },
  );
  console.log("[ChatPage] Messages:", messages);

  // Mock online users (replace with socket later)
  const [onlineUsers] = useState<Set<string>>(new Set([]));

  // Handle Deep Linking
  const [searchParams] = useSearchParams();
  useEffect(() => {
    const partnerId = searchParams.get("partnerId");
    console.log("[ChatPage] URL partnerId changed:", partnerId, "Current selected:", selectedPartnerId);
    if (partnerId && partnerId !== selectedPartnerId) {
      console.log("[ChatPage] Updating selectedPartnerId to:", partnerId);
      setSelectedPartnerId(partnerId);
    }
  }, [searchParams, selectedPartnerId]);

  // Create conversation if selected partner but no conversation exists
  useEffect(() => {
    const initConversation = async () => {
      if (selectedPartnerId && !selectedConversation && currentUser) {
        try {
          const isRecruiter = currentUser.role === "recruiter";
          const recruiterId = isRecruiter ? currentUser._id! : selectedPartnerId;
          const candidateId = isRecruiter ? selectedPartnerId : currentUser._id!;

          await createConversation({ recruiterId, candidateId }).unwrap();
          refetchConversations();
        } catch (error) {
          console.error("Failed to create conversation", error);
        }
      }
    };
    initConversation();
  }, [
    selectedPartnerId,
    selectedConversation,
    currentUser,
    createConversation,
    refetchConversations,
  ]);

  // Handlers
  const handleSend = async () => {
    if (!selectedConversation || !text.trim()) return;
    console.log("[ChatPage] Sending message:", text, "to conversation:", selectedConversation._id);
    try {
      await sendMessage({
        conversationId: selectedConversation._id,
        content: text.trim(),
      }).unwrap();
      setText("");
      refetchMessages();
    } catch (error) {
      console.error("Failed to send message", error);
    }
  };

  // Get partner object for ChatWindow
  const selectedPartnerUser: ChatUser | null = useMemo(() => {
    if (selectedConversation && currentUser) {
      return currentUser.role === "recruiter"
        ? selectedConversation.candidateId
        : selectedConversation.recruiterId;
    }

    // Fallback: Construct from URL params if we have a selectedPartnerId but no conversation yet
    if (selectedPartnerId && searchParams.get("partnerId") === selectedPartnerId) {
      const pName = searchParams.get("partnerName") || "";
      const pRole = searchParams.get("partnerRole") || "recruiter";
      // Split name into first/last roughly
      const parts = pName.split(" ");
      const lastName = parts.pop() || "";
      const firstName = parts.join(" ");

      return {
        _id: selectedPartnerId,
        firstName: firstName || pName, // Fallback if no space
        lastName: lastName,
        email: "", // Unknown email
        role: pRole,
      } as ChatUser;
    }

    return null;
  }, [selectedConversation, currentUser, selectedPartnerId, searchParams]);

  if (!currentUser) {
    return <div className="p-10 text-center">Please log in to use chat.</div>;
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Fixed background */}
      <div
        aria-hidden="true"
        className="fixed inset-0 -z-10 bg-gradient-to-b from-[#F97A00] from-40% to-white to-40%"
      />

      <main className="max-w-7xl mx-auto w-full px-4 py-8 pt-32 md:pt-[150px]">
        <div className="flex h-[calc(100vh-160px)] md:h-[calc(100vh-200px)] bg-gray-100 p-2 md:p-3 gap-2 md:gap-4 rounded-xl md:rounded-3xl shadow-xl backdrop-blur-sm overflow-hidden">
          <ChatSidebar
            currentUser={currentUser}
            conversations={conversations}
            selectedPartner={selectedPartnerId}
            onSelectPartner={setSelectedPartnerId}
            onlineUsers={onlineUsers}
            searchKeyword={searchKeyword}
            setSearchKeyword={setSearchKeyword}
          />
          <ChatWindow
            currentUser={currentUser}
            partner={selectedPartnerUser}
            messages={messages}
            text={text}
            setText={setText}
            onSendMessage={handleSend}
            onlineUsers={onlineUsers}
            onBack={() => setSelectedPartnerId(null)}
          />
        </div>
      </main>
    </div>
  );
}
