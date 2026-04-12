import { useState, useCallback } from 'react';
import { api } from '../services/api';
import type { ChatMessage, ChatResponse } from '../types';

interface UseChatReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  suggestions: string[];
  sendMessage: (sessionId: string, message: string) => Promise<void>;
  loadChatHistory: (sessionId: string) => Promise<void>;
  loadSuggestions: (sessionId: string) => Promise<void>;
  clearChat: () => void;
}

export function useChat(): UseChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const sendMessage = useCallback(async (sessionId: string, message: string) => {
    setIsLoading(true);
    setError(null);

    // Add user message immediately
    const userMessage: ChatMessage = {
      role: 'user',
      content: message,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const response: ChatResponse = await api.sendMessage(sessionId, message);

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response.content,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      if (response.suggestedFollowups) {
        setSuggestions(response.suggestedFollowups);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadChatHistory = useCallback(async (sessionId: string) => {
    try {
      const history = await api.getChatHistory(sessionId);
      setMessages(history.messages);
    } catch (err) {
      console.error('Failed to load chat history:', err);
    }
  }, []);

  const loadSuggestions = useCallback(async (sessionId: string) => {
    try {
      const response = await api.getSuggestedFollowups(sessionId);
      setSuggestions(response.suggestions);
    } catch (err) {
      console.error('Failed to load suggestions:', err);
    }
  }, []);

  const clearChat = useCallback(() => {
    setMessages([]);
    setSuggestions([]);
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    error,
    suggestions,
    sendMessage,
    loadChatHistory,
    loadSuggestions,
    clearChat,
  };
}