export interface ChatUser {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: "job_seeker" | "recruiter" | string;
    profilePicture?: string;
}

export interface Message {
    _id: string;
    conversationId: string;
    senderId: string;
    content: string;
    attachments?: Array<{
        url: string;
        type: "image" | "document" | "video";
        name: string;
    }>;
    isRead: boolean;
    createdAt: string;
}

export interface UserData {
    _id?: string;
    id?: string;
    email: string;
    name?: string;
    role: "job_seeker" | "recruiter";
}

export interface Conversation {
    _id: string;
    candidateId: ChatUser;
    recruiterId: ChatUser;
    lastMessage?: Message;
    updatedAt: string;
}
