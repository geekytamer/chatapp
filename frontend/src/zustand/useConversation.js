import { create } from "zustand";
import useGetConversations from "../hooks/useGetConversations";
const useConversation = create((set) => ({
  selectedConversation: null,
  setSelectedConversation: (conversation) =>
    set({ selectedConversation: conversation }),
  messages: [],
  resultConversations: [],
  setMessages: (messages) => set({ messages: messages }),
  searchConversation: (query) => {
    set(() => {
      const { conversations } = useGetConversations();
      const filtered = conversations.filter((conversation) =>
        conversation.fullname.toLowerCase().includes(query.toLowerCase())
      );
      return { resultConversations: filtered };
    });
  },
}));

export default useConversation;
