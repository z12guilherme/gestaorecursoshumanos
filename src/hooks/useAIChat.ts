import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function useAIChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('ai_messages')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;

      const formattedMessages = data.map((msg: any) => ({
        id: msg.id,
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
        timestamp: new Date(msg.created_at),
      }));

      setMessages(formattedMessages);
    } catch (error) {
      console.error('Erro ao buscar mensagens:', error);
    } finally {
      setLoading(false);
    }
  };

  const addMessage = async (role: 'user' | 'assistant', content: string) => {
    try {
      // Optimistic update (atualiza a UI antes do banco responder)
      const tempId = Date.now().toString();
      const newMessage: Message = {
        id: tempId,
        role,
        content,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, newMessage]);

      const { data, error } = await supabase
        .from('ai_messages')
        .insert([{ role, content }])
        .select()
        .single();

      if (error) throw error;

      // Atualiza com o ID real do banco
      setMessages((prev) => prev.map(msg => msg.id === tempId ? { ...msg, id: data.id } : msg));
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    }
  };

  const clearHistory = async () => {
    await supabase.from('ai_messages').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    setMessages([]);
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  return { messages, loading, addMessage, clearHistory };
}