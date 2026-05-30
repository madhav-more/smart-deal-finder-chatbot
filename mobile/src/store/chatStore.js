import { create } from 'zustand';
import { chatAPI } from '../services/api';

export const useChatStore = create((set, get) => ({
  conversations: [],
  activeConversation: null,
  messages: [],
  isLoading: false,
  error: null,

  fetchConversations: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await chatAPI.getConversations();
      set({ conversations: data.conversations || [], isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch conversations', isLoading: false });
    }
  },

  fetchConversation: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const data = await chatAPI.getConversation(id);
      set({ 
        activeConversation: data.conversation, 
        messages: data.conversation?.messages || [], 
        isLoading: false 
      });
    } catch (error) {
      set({ error: 'Failed to fetch conversation details', isLoading: false });
    }
  },

  sendMessage: async (text) => {
    const { activeConversation, messages } = get();
    const conversationId = activeConversation?._id;

    // Optimistic update
    const tempMessage = {
      _id: Date.now().toString(),
      content: text,
      role: 'user',
      createdAt: new Date().toISOString(),
    };
    
    set({ messages: [...messages, tempMessage] });

    try {
      const data = await chatAPI.sendMessage(text, conversationId);
      
      // Update with real data from server
      if (!conversationId) {
        set({ activeConversation: data.conversation });
        get().fetchConversations(); // Refresh list if new conversation
      }
      
      const newMessages = [...messages, tempMessage];
      
      if (data.reply) {
        const aiMessage = {
          _id: (Date.now() + 1).toString(),
          content: data.reply,
          role: 'assistant',
          createdAt: new Date().toISOString(),
          metadata: data.results
        };
        newMessages.push(aiMessage);
      }
      
      set({ messages: newMessages });
    } catch (error) {
      set({ error: 'Failed to send message' });
      // Rollback optimistic update if needed (optional)
    }
  },

  clearActiveConversation: () => {
    set({ activeConversation: null, messages: [] });
  }
}));
