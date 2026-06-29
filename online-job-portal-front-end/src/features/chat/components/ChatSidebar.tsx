import { useState } from "react";
import { Avatar } from "./Avatar";
import { getRelativeTime, getDisplayName } from "../utils/chat.utils";
import type { Conversation, UserData, ChatUser } from "../types";
import { Paperclip } from "lucide-react";

interface ChatSidebarProps {
    currentUser: UserData;
    conversations: Conversation[];
    selectedPartner: string | null;
    onSelectPartner: (partnerId: string) => void;
    onlineUsers: Set<string>;
    searchKeyword: string;
    setSearchKeyword: (keyword: string) => void;
}

export function ChatSidebar({
    currentUser,
    conversations,
    selectedPartner,
    onSelectPartner,
    onlineUsers,
    searchKeyword,
    setSearchKeyword,
}: ChatSidebarProps) {
    const [newChatInput, setNewChatInput] = useState("");
    const [showNewChatForm, setShowNewChatForm] = useState(false);

    const userDisplayName = getDisplayName(currentUser.email, currentUser.name);

    // Helper to get partner info
    const getPartner = (c: Conversation): ChatUser => {
        // If I am recruiter, partner is candidate
        if (currentUser.role === "recruiter") return c.candidateId;
        // If I am job_seeker, partner is recruiter
        return c.recruiterId;
    };

    // Filter conversations
    const filteredConversations = conversations.filter((c) => {
        const partner = getPartner(c);
        const name = getDisplayName(partner.email, `${partner.firstName} ${partner.lastName}`);
        return name.toLowerCase().includes(searchKeyword.toLowerCase());
    });

    // Mobile visibility logic
    const mobileVisibilityClass = selectedPartner ? "hidden md:flex" : "flex";

    return (
        <aside className={`w-full md:w-80 bg-gradient-to-b from-gray-50 to-white border border-gray-200 rounded-2xl shadow-sm flex-col overflow-hidden ${mobileVisibilityClass}`}>
            {/* User Profile Header */}
            <div className="p-4 text-gray-800 bg-white border-b border-gray-100 relative hover:bg-gray-50 transition-colors">
                <div className="w-full text-left">
                    <div className="flex items-center gap-3 justify-between">
                        <div className="flex items-center gap-3 flex-1">
                            <Avatar name={userDisplayName} role={currentUser.role} />
                            <div className="flex-1 min-w-0">
                                <div className="font-bold text-lg truncate">{userDisplayName}</div>
                                <div className="text-xs opacity-90 truncate">{currentUser.email}</div>
                                <div className="text-xs opacity-90 flex items-center gap-1 mt-1">
                                    {currentUser.role === "job_seeker" ? "🎯 Job Seeker" : "💼 Recruiter"}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="h-0.5 bg-gradient-to-r from-transparent via-orange-300 to-transparent"></div>

            {/* Search & New Chat */}
            <div className="p-4 space-y-2">
                <input
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    placeholder="Search conversations..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />

                {!showNewChatForm ? (
                    <button
                        onClick={() => setShowNewChatForm(true)}
                        className="w-full bg-orange-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-orange-600 transition-colors font-semibold"
                    >
                        + New Chat
                    </button>
                ) : (
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <input
                            type="text"
                            value={newChatInput}
                            onChange={(e) => setNewChatInput(e.target.value)}
                            placeholder="Enter partner email..."
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-2"
                            autoFocus
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && newChatInput.trim()) {
                                    onSelectPartner(newChatInput.trim());
                                    setNewChatInput("");
                                    setShowNewChatForm(false);
                                }
                            }}
                        />
                        <div className="flex gap-2">
                            <button
                                onClick={() => {
                                    if (newChatInput.trim()) {
                                        onSelectPartner(newChatInput.trim());
                                        setNewChatInput("");
                                        setShowNewChatForm(false);
                                    }
                                }}
                                className="flex-1 bg-orange-500 text-white px-3 py-1.5 rounded text-xs hover:bg-orange-600 font-semibold"
                            >
                                Start
                            </button>
                            <button
                                onClick={() => {
                                    setShowNewChatForm(false);
                                    setNewChatInput("");
                                }}
                                className="flex-1 bg-gray-200 text-gray-700 px-3 py-1.5 rounded text-xs hover:bg-gray-300"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto">
                {filteredConversations.length === 0 && (
                    <div className="text-gray-500 text-sm text-center p-4">
                        {searchKeyword ? "No conversations found" : "No conversations yet"}
                    </div>
                )}

                {filteredConversations.map((c) => {
                    const partner = getPartner(c);
                    // Use partner._id as the key for selection
                    const partnerId = partner._id;
                    const partnerName = getDisplayName(partner.email, `${partner.firstName} ${partner.lastName}`);
                    const isOnline = onlineUsers.has(partner.email); // Assuming onlineUsers uses email
                    const isSelected = selectedPartner === partnerId;

                    return (
                        <div
                            key={c._id}
                            onClick={() => onSelectPartner(partnerId)}
                            className={`p-4 cursor-pointer border-b border-gray-100 transition-all hover:bg-blue-50 ${isSelected ? "bg-blue-50 border-l-4 border-l-blue-500" : ""
                                }`}
                        >
                            <div className="flex items-start gap-3">
                                <div className="relative">
                                    <Avatar name={partnerName} role={partner.role} />
                                    {isOnline && (
                                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <div className="font-semibold text-sm truncate">
                                            {partnerName}
                                        </div>
                                        {c.lastMessage && (
                                            <div className="text-[10px] text-gray-500 ml-2">
                                                {getRelativeTime(c.lastMessage.createdAt)}
                                            </div>
                                        )}
                                    </div>

                                    <div className="text-[10px] text-gray-500 truncate mb-1">
                                        {partner.email}
                                    </div>

                                    <div
                                        className={`text-xs mb-1 font-semibold flex items-center gap-1 ${partner.role === "recruiter"
                                            ? "text-purple-600"
                                            : "text-green-600"
                                            }`}
                                    >
                                        {partner.role === "recruiter" ? "💼 Recruiter" : "🎯 Job Seeker"}
                                    </div>

                                    <div className="text-xs text-gray-600 truncate flex items-center gap-1">
                                        {c.lastMessage?.attachments && c.lastMessage.attachments.length > 0 && <Paperclip className="w-3 h-3" />}
                                        {c.lastMessage?.content ?? "Start conversation"}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </aside>
    );
}
