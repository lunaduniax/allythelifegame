import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  action?: AllyGPTAction | null;
  createdAt: Date;
}

export interface AllyGPTAction {
  type: 'goal' | 'tasks';
  goal?: {
    name: string;
    category: string;
  };
  tasks?: string[];
}

interface ProjectContext {
  id: string;
  name: string;
  category: string;
}

const STORAGE_KEY = 'allygpt-chat-history';

export const useAllyGPT = (projectContext: ProjectContext | null) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load chat history from localStorage
  useEffect(() => {
    if (user) {
      const stored = localStorage.getItem(`${STORAGE_KEY}-${user.id}`);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setMessages(parsed.map((m: any) => ({
            ...m,
            createdAt: new Date(m.createdAt),
          })));
        } catch (e) {
          console.error('Failed to parse chat history:', e);
        }
      }
    }
  }, [user]);

  // Save chat history to localStorage
  useEffect(() => {
    if (user && messages.length > 0) {
      localStorage.setItem(`${STORAGE_KEY}-${user.id}`, JSON.stringify(messages));
    }
  }, [messages, user]);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    setError(null);
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: content.trim(),
      createdAt: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Build conversation history for API
      const conversationHistory = messages.map(m => ({
        role: m.role,
        content: m.content,
      }));
      conversationHistory.push({ role: 'user', content: content.trim() });

      const { data, error: fnError } = await supabase.functions.invoke('allygpt-chat', {
        body: {
          messages: conversationHistory,
          projectContext,
        },
      });

      if (fnError) {
        throw new Error(fnError.message);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.message,
        action: data.action,
        createdAt: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (e) {
      console.error('AllyGPT error:', e);
      setError(e instanceof Error ? e.message : 'Error al comunicarse con AllyGPT');
    } finally {
      setIsLoading(false);
    }
  }, [messages, projectContext]);

  const clearHistory = useCallback(() => {
    setMessages([]);
    if (user) {
      localStorage.removeItem(`${STORAGE_KEY}-${user.id}`);
    }
  }, [user]);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearHistory,
  };
};
