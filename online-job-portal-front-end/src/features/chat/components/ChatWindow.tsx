import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar } from "./Avatar";
import { OnlineStatus } from "./OnlineStatus";
import { getRelativeTime, getDisplayName } from "../utils/chat.utils";
import type { Message, UserData, ChatUser } from "../types";
import { User, Send, ArrowLeft } from "lucide-react";

interface ChatWindowProps {
    currentUser: UserData;
    partner: ChatUser | null;
    messages: Message[];
    text: string;
    setText: (text: string) => void;
    onSendMessage: () => void;
    onlineUsers: Set<string>;
    onBack?: () => void;
}

export function ChatWindow({
    currentUser,
    partner,
    messages,
    text,
    setText,
    onSendMessage,
    onlineUsers,
    onBack,
}: ChatWindowProps) {
    const listRef = useRef<HTMLDivElement | null>(null);
    const navigate = useNavigate();
    const userId = currentUser._id || currentUser.id || currentUser.email;
    const userDisplayName = getDisplayName(currentUser.email, currentUser.name);

    useEffect(() => {
        if (listRef.current) {
            listRef.current.scrollTop = listRef.current.scrollHeight;
        }
    }, [messages]);

    // Mobile visibility logic
    const mobileVisibilityClass = partner ? "flex" : "hidden md:flex";

    return (
        <main className={`flex-1 flex-col overflow-hidden bg-white rounded-2xl shadow border border-gray-200 ${mobileVisibilityClass}`}>
            {/* Chat Header */}
            {partner ? (
                <div
                    className={`p-4 border-b flex items-center gap-3 ${partner.role === "recruiter"
                        ? "bg-gradient-to-r from-purple-50 to-pink-50"
                        : "bg-gradient-to-r from-green-50 to-emerald-50"
                        }`}
                >
                    {/* Back Button (Mobile Only) */}
                    <button
                        onClick={onBack}
                        className="md:hidden p-2 -ml-2 mr-1 text-gray-600 hover:bg-black/5 rounded-full transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>

                    <div
                        onClick={() => navigate(`/profile/${partner._id}?role=${partner.role}`)}
                        className="cursor-pointer hover:opacity-80 transition-opacity"
                    >
                        <Avatar name={getDisplayName(partner.email, `${partner.firstName} ${partner.lastName}`)} role={partner.role} />
                    </div>
                    <div className="flex-1">
                        <h2
                            onClick={() => navigate(`/profile/${partner._id}?role=${partner.role}`)}
                            className="text-lg font-bold cursor-pointer hover:text-blue-600 hover:underline transition-colors w-fit"
                        >
                            {getDisplayName(partner.email, `${partner.firstName} ${partner.lastName}`)}
                        </h2>
                        <div className="text-xs text-gray-600 mb-1 w-fit">
                            {partner.email}
                        </div>
                        <div className="flex items-center gap-3">
                            <span
                                className={`text-xs font-semibold flex items-center gap-1 ${partner.role === "recruiter"
                                    ? "text-purple-600"
                                    : "text-green-600"
                                    }`}
                            >
                                {partner.role === "recruiter" ? "💼 Recruiter" : "🎯 Job Seeker"}
                            </span>
                            <div className="flex items-center gap-1 text-xs">
                                <OnlineStatus isOnline={onlineUsers.has(partner.email)} />
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="p-4 border-b">
                    <h2 className="text-xl font-bold text-gray-400">Select a conversation</h2>
                </div>
            )}

            {/* Messages */}
            <div
                ref={listRef}
                className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-gray-50"
            >
                {!partner && (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center text-gray-400">
                            <User className="w-16 h-16 mx-auto mb-2 opacity-50" />
                            <p>Select a conversation to start messaging</p>
                        </div>
                    </div>
                )}

                {partner && messages.length === 0 && (
                    <div className="text-gray-500 text-center">No messages yet. Say hi 👋</div>
                )}

                {partner &&
                    messages.map((m) => {
                        // senderId can be populated object or string
                        const senderIdStr = typeof m.senderId === 'object' ? (m.senderId as any)._id : m.senderId;
                        const isMe = senderIdStr === userId;
                        const senderRole = isMe ? currentUser.role : partner.role;
                        const roleLabel = senderRole === "job_seeker" ? "Job Seeker" : "Recruiter";
                        const senderName = isMe ? userDisplayName : getDisplayName(partner.email, `${partner.firstName} ${partner.lastName}`);

                        return (
                            <div
                                key={m._id}
                                className={`w-full flex gap-2 ${isMe ? "justify-end" : "justify-start"}`}
                            >
                                {!isMe && <Avatar name={senderName} role={senderRole} />}

                                <div
                                    className={`max-w-[70%] px-4 py-3 rounded-2xl shadow-sm ${isMe
                                        ? "bg-blue-500 text-white rounded-br-sm"
                                        : "bg-white text-black border border-gray-200 rounded-bl-sm"
                                        }`}
                                >
                                    {!isMe && (
                                        <div
                                            className={`text-[10px] font-semibold mb-1 flex items-center gap-1 ${senderRole === "recruiter" ? "text-purple-600" : "text-green-600"
                                                }`}
                                        >
                                            {senderRole === "recruiter" ? "💼" : "🎯"} {roleLabel}
                                        </div>
                                    )}

                                    <div className="whitespace-pre-wrap break-words">{m.content}</div>

                                    <div className={`text-[10px] mt-1 ${isMe ? "opacity-80" : "text-gray-500"}`}>
                                        {getRelativeTime(m.createdAt)}
                                    </div>
                                </div>

                                {isMe && <Avatar name={senderName} role={senderRole} />}
                            </div>
                        );
                    })}
            </div>

            {/* Input */}
            <div className="p-4 border-t bg-white">
                <div className="flex gap-2 items-end">

                    <input
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                onSendMessage();
                            }
                        }}
                        placeholder={
                            partner ? "Type a message..." : "Select a conversation first"
                        }
                        disabled={!partner}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-full shadow-sm text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                    />

                    <button
                        onClick={onSendMessage}
                        disabled={!partner || !text.trim()}
                        className="p-3 bg-blue-600 text-white rounded-full shadow-lg disabled:opacity-50 disabled:bg-gray-400 hover:bg-blue-700 transition-colors"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </main>
    );
}
