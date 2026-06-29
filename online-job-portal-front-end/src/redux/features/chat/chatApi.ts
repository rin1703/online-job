import { baseApi } from "@/redux/baseApi";

export interface ChatUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
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

export interface Conversation {
  _id: string;
  candidateId: ChatUser;
  recruiterId: ChatUser;
  lastMessage?: Message;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const chatApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getConversations: builder.query<Conversation[], void>({
      query: () => "/conversations/me",
      providesTags: ["Chat"],
      transformResponse: (response: ApiResponse<Conversation[]>) => response.data,
    }),
    getMessages: builder.query<Message[], string>({
      query: (conversationId) => `/messages/${conversationId}`,
      providesTags: (result, error, conversationId) => [{ type: "Chat", id: conversationId }],
      transformResponse: (response: ApiResponse<{ messages: Message[] }>) => response.data.messages,
    }),
    sendMessage: builder.mutation<Message, { conversationId: string; content: string; attachments?: any[] }>({
      query: ({ conversationId, ...body }) => ({
        url: `/messages/${conversationId}/send`,
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error, { conversationId }) => [
        "Chat",
        { type: "Chat", id: conversationId }
      ],
      transformResponse: (response: ApiResponse<Message>) => response.data,
    }),
    createConversation: builder.mutation<Conversation, { recruiterId: string; candidateId: string }>({
      query: (body) => ({
        url: "/conversations",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Chat"],
      transformResponse: (response: ApiResponse<Conversation>) => response.data,
    }),
  }),
});

export const {
  useGetConversationsQuery,
  useGetMessagesQuery,
  useSendMessageMutation,
  useCreateConversationMutation,
} = chatApi;
