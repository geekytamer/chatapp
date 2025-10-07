import { create } from "zustand";

const useConversation = create((set) => ({
  selectedConversation: null,
  setSelectedConversation: (conversation) =>
    set({ selectedConversation: conversation }),
  messages: [],
  setMessages: (messages) => set({ messages }),
  resultConversations: [],
  setResultConversations: (conversations) => set({ resultConversations: conversations }),
  searchConversation: (query, conversations) => {
    const filtered = conversations.filter((conversation) =>
      conversation.fullname.toLowerCase().includes(query.toLowerCase())
    );
    set({ resultConversations: filtered });
  },
}));

export default useConversation;