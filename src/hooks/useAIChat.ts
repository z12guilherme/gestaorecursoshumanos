import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const menuText = `Olá! Sou seu assistente de RH.
Selecione uma opção digitando o número correspondente:

1. Listar todos os colaboradores
2. Contar total de colaboradores
3. Ver vagas de emprego abertas
4. Ver solicitações de férias recentes
5. Criar um novo aviso (Ex: "aviso: Reunião geral amanhã")
6. Buscar funcionário por nome
7. Demitir funcionário
8. Admitir funcionários em massa

Você também pode digitar "ajuda" a qualquer momento para ver estas opções.`;

export function useAIChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('ai_messages')
        .select('*')
        .order('created_at', { ascending: true });

      if (error && error.code !== 'PGRST116') throw error;

      const formattedMessages = (data || []).map((msg: any) => ({
        id: msg.id,
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
        timestamp: new Date(msg.created_at),
      }));

      if (formattedMessages.length === 0) {
        setMessages([{
          id: 'initial-menu',
          role: 'assistant',
          content: menuText,
          timestamp: new Date(),
        }]);
      } else {
        setMessages(formattedMessages);
      }
    } catch (error) {
      console.error('Erro ao buscar mensagens:', error);
      setMessages([{
        id: 'error-initial',
        role: 'assistant',
        content: 'Não foi possível carregar o histórico. ' + menuText,
        timestamp: new Date(),
      }]);
    } finally {
      setLoading(false);
    }
  }, []);

  const addMessage = async (role: 'user' | 'assistant', content: string) => {
    try {
      // Atualização otimista para a UI
      const tempId = Date.now().toString();
      const newMessage: Message = { id: tempId, role, content, timestamp: new Date() };
      setMessages((prev) => [...prev, newMessage]);

      // Salva no banco de dados em segundo plano
      await supabase.from('ai_messages').insert([{ role, content }]);
    } catch (error) {
      console.error('Erro ao adicionar mensagem (addMessage):', error);
      // Não precisa tratar erro na UI aqui, pois a mensagem já foi adicionada otimisticamente
    }
  };

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    try {
      setSending(true);
      await addMessage('user', content);

      const msg = content.toLowerCase().trim();
      let reply = '';

      // --- INTENÇÕES DE COMANDO ---
      switch (msg) {
        case '1': {
          const { data, error } = await supabase.from('employees').select('name, role, department').limit(20);
          if (error) throw error;
          if (data && data.length > 0) {
              reply = 'Aqui estão os colaboradores cadastrados:\n' + data.map((e: any) => `- ${e.name} (${e.role} - ${e.department})`).join('\n');
          } else {
              reply = "Não encontrei nenhum colaborador cadastrado no sistema.";
          }
          break;
        }
        case '2': {
          const { count, error } = await supabase.from('employees').select('*', { count: 'exact', head: true });
          if (error) throw error;
          reply = `Atualmente, temos ${count ?? 0} colaboradores cadastrados no sistema.`;
          break;
        }
        case '3': {
          const { data, error } = await supabase.from('jobs').select('title, department').eq('status', 'Aberta').limit(10);
          if (error) throw error;
          if (data && data.length > 0) {
            reply = "Vagas abertas no momento:\n" + data.map((j: any) => `- ${j.title} (${j.department})`).join('\n');
          } else {
            reply = "Não há vagas abertas no momento.";
          }
          break;
        }
        case '4': {
          const { data, error } = await supabase.from('time_off_requests').select('*, employees(name)').order('created_at', { ascending: false }).limit(5);
          if (error) throw error;
          if (data && data.length > 0) {
            reply = `Estas são as solicitações de férias mais recentes:\n` + data.map((r: any) => `- ${r.employees?.name}: ${r.status} (Início: ${r.start_date})`).join('\n');
          } else {
            reply = "Nenhuma solicitação de férias recente encontrada.";
          }
          break;
        }
        case '5': {
          reply = 'Para criar um aviso, digite: aviso: [sua mensagem]. Exemplo: "aviso: Reunião geral às 14h".';
          break;
        }
        case '6': {
          reply = 'Para buscar um funcionário, digite: buscar [nome]. Exemplo: "buscar João".';
          break;
        }
        case '7': {
          reply = 'Para demitir um funcionário, digite: demitir [nome]. Exemplo: "demitir João Silva".';
          break;
        }
        case '8': {
          reply = 'Para admitir em massa, digite: massa: Nome, Cargo, Departamento; Nome2, Cargo2, Dept2. Exemplo: "massa: Ana, Dev, TI; Pedro, RH, Admin"';
          break;
        }
        case 'ajuda':
        case 'menu': {
            reply = menuText;
            break;
        }
        default: {
          if (msg.startsWith('aviso:')) {
            const announcementContent = content.substring('aviso:'.length).trim();
            if (announcementContent) {
                const { error } = await supabase.from('announcements').insert([{
                    title: 'Novo Aviso (via Chat)',
                    content: announcementContent,
                    priority: 'medium',
                    author: 'Assistente IA'
                }]);
                if (error) throw error;
                reply = "Aviso criado e publicado no mural com sucesso!";
            } else {
                reply = 'Para criar um aviso, use o formato "aviso: [seu texto]".';
            }
          } else if (msg.startsWith('buscar ')) {
             const searchTerm = content.substring('buscar '.length).trim();
             
             if (searchTerm) {
                const { data, error } = await supabase.from('employees').select('name, role, department').ilike('name', `%${searchTerm}%`).limit(5);
                if (error) throw error;
                if (data && data.length > 0) {
                    reply = `Encontrei os seguintes colaboradores:\n` + data.map((e: any) => `- ${e.name} (${e.role})`).join('\n');
                } else {
                    reply = `Não encontrei ninguém com o nome "${searchTerm}".`;
                }
             } else {
                 reply = "Por favor, especifique o nome que deseja buscar. Ex: 'buscar Maria'";
             }
          } else if (msg.startsWith('demitir ')) {
             const nameToTerminate = content.substring(8).trim();
             
             if (nameToTerminate) {
                const { data: employees, error: searchError } = await supabase
                  .from('employees')
                  .select('id, name, status')
                  .ilike('name', `%${nameToTerminate}%`)
                  .limit(1);
                
                if (searchError) throw searchError;

                if (employees && employees.length > 0) {
                    const emp = employees[0];
                    const { error: updateError } = await supabase
                        .from('employees')
                        .update({ status: 'terminated' })
                        .eq('id', emp.id);
                    
                    if (updateError) throw updateError;
                    reply = `O colaborador ${emp.name} foi desligado com sucesso.`;
                } else {
                    reply = `Não encontrei ninguém com o nome "${nameToTerminate}".`;
                }
             } else {
                 reply = "Por favor, especifique o nome que deseja demitir. Ex: 'demitir Maria'";
             }
          } else if (msg.startsWith('massa:')) {
             const bulkData = content.substring(6).trim();
             const entries = bulkData.split(';').map(e => e.trim()).filter(e => e);
             let successCount = 0;
             
             if (entries.length === 0) {
                 reply = 'Formato inválido. Use: massa: Nome, Cargo, Dept; Nome2, Cargo2, Dept2';
             } else {
                 for (const entry of entries) {
                     const parts = entry.split(',').map(p => p.trim());
                     if (parts.length >= 3) {
                         const [name, role, department] = parts;
                         const { error } = await supabase.from('employees').insert([{
                             name,
                             role,
                             department,
                             email: `${name.toLowerCase().replace(/\s+/g, '.')}@empresa.com`,
                             status: 'active',
                             admission_date: new Date().toISOString(),
                             password: '1234'
                         }]);
                         if (!error) successCount++;
                     }
                 }
                 reply = `Processo finalizado. ${successCount} colaboradores foram admitidos com sucesso.`;
             }
          } else {
            reply = `Comando não reconhecido. Digite "ajuda" para ver a lista de opções.`;
          }
        }
      }

      await addMessage('assistant', reply);
    } catch (error) {
      console.error('Erro ao processar mensagem:', error);
      await addMessage('assistant', 'Desculpe, ocorreu um erro ao processar sua solicitação.');
    } finally {
      setSending(false);
    }
  };

  const clearHistory = async () => {
    try {
      // Limpa o banco de dados em segundo plano
      await supabase.from('ai_messages').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      // Reinicia para a mensagem de menu na UI
      setMessages([{
        id: 'initial-menu',
        role: 'assistant',
        content: menuText,
        timestamp: new Date(),
      }]);
    } catch (error) {
      console.error('Erro ao limpar histórico:', error);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  return { messages, loading, sending, addMessage, sendMessage, clearHistory };
}