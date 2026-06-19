import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { mockDatabase, USE_MOCK } from '@/lib/mockDatabase';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const menuText = `Olá! Sou seu assistente de RH inteligente. 🤖
Estou aqui para agilizar sua gestão. Você pode conversar comigo naturalmente ou usar os comandos numéricos.

Exemplos do que posso fazer:
• "Liste os colaboradores do setor de Tecnologia"
• "Quantas pessoas temos na empresa?"
• "Há vagas abertas para Desenvolvedor?"
• "Quem pediu férias recentemente?"
• "Cadastre o funcionário João Silva..."

Menu Rápido:
1. Listar todos
2. Contagem total
3. Vagas abertas
4. Férias
5. Criar aviso
6. Buscar
7. Demitir
8. Admissão em massa`;

export function useAIChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // Sugestões de prompt para a UI (Chips/Botões)
  const suggestions = [
    "Listar colaboradores",
    "Quantos funcionários temos?",
    "Vagas abertas",
    "Criar vaga de Analista",
    "Dar férias para...",
    "Solicitações de férias",
    "Criar aviso: Reunião Geral",
    "Ajuda"
  ];

  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true);

      // 🔀 Desvio Offline (Mock)
      if (USE_MOCK) {
        const data = mockDatabase.get('ai_messages');
        const formattedMessages = (data || []).map((msg: any) => ({
          id: msg.id,
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
          timestamp: new Date(msg.created_at),
        }));
        if (formattedMessages.length === 0) {
          setMessages([{ id: 'initial-menu', role: 'assistant', content: menuText, timestamp: new Date() }]);
        } else {
          setMessages(formattedMessages);
        }
        setLoading(false);
        return;
      }

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

      // 🔀 Desvio Offline (Mock)
      if (USE_MOCK) {
        mockDatabase.add('ai_messages', { id: tempId, role, content, created_at: new Date().toISOString() });
        return;
      }

      // Salva no banco de dados em segundo plano
      await supabase.from('ai_messages').insert([{ role, content }]);
    } catch (error) {
      console.error('Erro ao adicionar mensagem (addMessage):', error);
    }
  };

  // 🔀 Função auxiliar: processa mensagem usando dados locais do mockDatabase
  const processMockMessage = (content: string): string => {
    const msg = content.toLowerCase().trim();
    const employees = mockDatabase.get('employees');
    const jobs = mockDatabase.get('jobs');
    const timeOff = mockDatabase.get('time_off');

    // 1. Listar colaboradores
    if (/(listar|ver|mostrar|quais|quem)\s+(?:s[aã]o\s+os\s+)?(?:todos\s+os\s+)?(?:colaboradores|funcion[aá]rios)|^1$/i.test(msg)) {
      if (employees.length > 0) {
        return 'Aqui estão os colaboradores:\n' + employees.map((e: any) => `- ${e.name} (${e.role} - ${e.department})`).join('\n');
      }
      return 'Não encontrei colaboradores cadastrados.';
    }

    // 2. Contagem
    if (/quantos\s+(?:colaboradores|funcion[aá]rios|pessoas)|total|^2$/i.test(msg)) {
      return `Atualmente, a empresa conta com ${employees.length} colaboradores.`;
    }

    // 3. Vagas
    if (/vagas|oportunidades|recrutamento|^3$/i.test(msg)) {
      const open = jobs.filter((j: any) => j.status === 'Aberta');
      if (open.length > 0) {
        return 'Vagas abertas:\n' + open.map((j: any) => `- ${j.title} (${j.department})`).join('\n');
      }
      return 'Não há vagas abertas no momento.';
    }

    // 4. Férias
    if (/f[eé]rias|aus[eê]ncias|folgas|^4$/i.test(msg)) {
      if (timeOff.length > 0) {
        return 'Últimas movimentações de férias:\n' + timeOff.map((r: any) => `- ${r.employee?.name || 'Funcionário'}: ${r.status === 'approved' ? 'Aprovado' : 'Pendente'}`).join('\n');
      }
      return 'Não há registros recentes de férias.';
    }

    // 5. Criar aviso
    if (/(?:criar|crie|novo|publicar)\s+(?:um\s+)?aviso|^aviso:/i.test(msg)) {
      const match = content.match(/(?:aviso:|criar\s+aviso)\s*(.+)/i);
      if (match) {
        mockDatabase.add('announcements', { id: Date.now().toString(), title: 'Aviso do Assistente', content: match[1].trim(), priority: 'medium', author: 'IA', created_at: new Date().toISOString() });
        return `✅ Aviso publicado: "${match[1].trim()}"`;
      }
      return 'Para publicar, diga: "aviso: [sua mensagem]".';
    }

    // 6. Buscar
    if (/buscar|procurar|encontrar|^6$/i.test(msg)) {
      const match = content.match(/(?:buscar|procurar|encontrar)\s+(.+)/i);
      if (match) {
        const term = match[1].trim().toLowerCase();
        const found = employees.filter((e: any) => e.name.toLowerCase().includes(term));
        if (found.length > 0) {
          return 'Encontrei:\n' + found.map((e: any) => `- ${e.name}\n  Cargo: ${e.role}\n  Dept: ${e.department}`).join('\n\n');
        }
        return `Não encontrei ninguém chamado "${match[1].trim()}".`;
      }
      return 'Diga o nome que deseja buscar. Ex: "buscar Carlos"';
    }

    // Help / Fallback
    if (/ajuda|menu|op[cç][oõ]es|^help$/i.test(msg)) {
      return menuText;
    }

    return '🤖 Modo Demo: Tente comandos como "listar colaboradores", "vagas abertas", "buscar Carlos" ou "ajuda".';
  };

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    try {
      setSending(true);
      await addMessage('user', content);

      // 🔀 Desvio Offline (Mock) — Usa NLP local com dados do mockDatabase
      if (USE_MOCK) {
        const reply = processMockMessage(content);
        await addMessage('assistant', reply);
        setSending(false);
        return;
      }

      const msg = content.toLowerCase().trim();
      let reply = '';

      // --- LÓGICA INTELIGENTE (NLP Básico + Regex) ---

      // 1. Listar Colaboradores (Com filtro opcional de departamento)
      // Ex: "Listar colaboradores", "Ver funcionários de TI", "1"
      if (/(listar|ver|mostrar|quais|quem)\s+(?:s[aã]o\s+os\s+)?(?:todos\s+os\s+)?(?:colaboradores|funcion[aá]rios|empregados)|op[cç][aã]o\s*1|^1$/i.test(msg)) {
          // Tenta extrair departamento: "de TI", "do setor Financeiro"
          const deptMatch = msg.match(/(?:de|do|da|no|na)\s+(?:setor\s+|departamento\s+)?([a-z\u00C0-\u00FF\s]+)/i);
          let query = supabase.from('employees').select('name, role, department');
          
          if (deptMatch && !msg.includes('todos')) {
             const dept = deptMatch[1].trim();
             // Ignora palavras comuns que não são departamentos
             if (!['empresa', 'rh', 'aqui'].includes(dept)) {
                 query = query.ilike('department', `%${dept}%`);
             }
          }
          
          const { data, error } = await query.limit(20);
          if (error) throw error;
          
          if (data && data.length > 0) {
              reply = `Aqui estão os colaboradores${deptMatch ? ` (filtro: ${deptMatch[1]})` : ''}:\n` + 
                      data.map((e: any) => `- ${e.name} (${e.role} - ${e.department})`).join('\n');
          } else {
              reply = "Não encontrei colaboradores com esses critérios.";
          }
      }

      // 2. Contagem
      // Ex: "Quantos funcionários?", "Total de colaboradores", "2"
      else if (/quantos\s+(?:colaboradores|funcion[aá]rios|pessoas)|total\s+de\s+(?:colaboradores|funcion[aá]rios)|op[cç][aã]o\s*2|^2$/i.test(msg)) {
          const { count, error } = await supabase.from('employees').select('*', { count: 'exact', head: true });
          if (error) throw error;
          reply = `Atualmente, a empresa conta com ${count ?? 0} colaboradores ativos.`;
      }

      // 3. Vagas (Com filtro opcional)
      // Ex: "Vagas abertas", "Tem vaga para Dev?", "3"
      else if (/vagas|oportunidades|recrutamento|op[cç][aã]o\s*3|^3$/i.test(msg)) {
          let query = supabase.from('jobs').select('title, department').eq('status', 'Aberta');
          
          // Filtro por título ou departamento se mencionado
          const termMatch = msg.match(/(?:para|de)\s+([a-z\u00C0-\u00FF\s]+)/i);
          if (termMatch && !msg.match(/^3$/)) {
             const term = termMatch[1].trim();
             query = query.or(`title.ilike.%${term}%,department.ilike.%${term}%`);
          }

          const { data, error } = await query.limit(10);
          if (error) throw error;
          
          if (data && data.length > 0) {
            reply = "Encontrei estas vagas abertas:\n" + data.map((j: any) => `- ${j.title} (${j.department})`).join('\n');
          } else {
            reply = "Não encontrei vagas abertas com esses critérios no momento.";
          }
      }

      // 4. Férias
      // Ex: "Quem está de férias?", "Solicitações de férias", "4"
      else if (/f[eé]rias|aus[eê]ncias|folgas|op[cç][aã]o\s*4|^4$/i.test(msg)) {
          const { data, error } = await supabase.from('time_off_requests').select('*, employees(name)').order('created_at', { ascending: false }).limit(5);
          if (error) throw error;
          if (data && data.length > 0) {
            reply = `Últimas movimentações de férias/ausências:\n` + data.map((r: any) => `- ${r.employees?.name}: ${r.status === 'approved' ? 'Aprovado' : r.status === 'pending' ? 'Pendente' : 'Rejeitado'} (Início: ${new Date(r.start_date).toLocaleDateString()})`).join('\n');
          } else {
            reply = "Não há registros recentes de férias.";
          }
      }

      // 5. Criar Aviso
      else if (/(?:criar|crie|novo|publicar|adicionar)\s+(?:um\s+)?aviso|^aviso:|op[cç][aã]o\s*5|^5$/i.test(msg)) {
          const contentMatch = content.match(/(?:aviso:|criar\s+aviso|crie\s+(?:um\s+)?aviso|novo\s+aviso|publicar\s+aviso)(?:\s+(?:com\s+o\s+texto|sobre|que\s+diga|dizendo)[:\s]*)?\s*(.+)/i);
          if (contentMatch) {
             const noticeText = contentMatch[1].trim();
             const { error } = await supabase.from('announcements').insert([{
                title: 'Aviso do Assistente',
                content: noticeText,
                priority: 'medium',
                author: 'IA'
            }]);
            if (error) throw error;
            reply = `✅ Aviso publicado no mural: "${noticeText}"`;
          } else {
             reply = 'Para publicar, diga: "aviso: [sua mensagem]" ou "criar aviso [mensagem]".';
          }
      }

      // 6. Buscar Funcionário
      else if (/buscar|procurar|quem\s+[eé]|encontrar|op[cç][aã]o\s*6|^6$/i.test(msg)) {
          const searchMatch = content.match(/(?:buscar|procurar|quem\s+[eé]|encontrar)\s+(?:o\s+|a\s+|pelo\s+|pela\s+)?([a-z\u00C0-\u00FF\s]+)/i);
          if (searchMatch && !msg.match(/^6$/)) {
             const term = searchMatch[1].trim();
             const { data, error } = await supabase.from('employees').select('name, role, department, email').ilike('name', `%${term}%`).limit(5);
             if (error) throw error;
             if (data && data.length > 0) {
                 reply = `Encontrei:\n` + data.map((e: any) => `- ${e.name}\n  Cargo: ${e.role}\n  Dept: ${e.department}\n  Email: ${e.email}`).join('\n\n');
             } else {
                 reply = `Não encontrei ninguém chamado "${term}".`;
             }
          } else {
             reply = 'Diga o nome que deseja buscar. Ex: "buscar Mariana"';
          }
      }

      // 7. Demitir
      else if (/demitir|desligar|remover\s+funcion[aá]rio|op[cç][aã]o\s*7|^7$/i.test(msg)) {
          const termMatch = content.match(/(?:demitir|desligar)\s+([a-z\u00C0-\u00FF\s]+)/i);
          if (termMatch) {
             const name = termMatch[1].trim();
             // Lógica de busca e demissão (simplificada para segurança, idealmente pediria confirmação)
             const { data, error } = await supabase.from('employees').select('id, name').ilike('name', `%${name}%`).limit(1);
             if (error) throw error;
             if (data && data.length > 0) {
                 const emp = data[0];
                 await supabase.from('employees').update({ status: 'terminated' }).eq('id', emp.id);
                 reply = `O colaborador ${emp.name} foi desligado.`;
             } else {
                 reply = `Colaborador "${name}" não encontrado.`;
             }
          } else {
             reply = 'Diga o nome para desligamento. Ex: "demitir Carlos"';
          }
      }

      // 8. Admissão em Massa
      else if (/massa:|admiss[aã]o\s+em\s+massa|importar|op[cç][aã]o\s*8|^8$/i.test(msg)) {
          if (msg.includes('massa:')) {
             const bulkData = content.substring(content.indexOf('massa:') + 6).trim();
             const entries = bulkData.split(';').map(e => e.trim()).filter(e => e);
             let successCount = 0;
             let errors: string[] = [];
             
             if (entries.length === 0) {
                 reply = 'Formato: "massa: Nome, Cargo, Dept; Nome2, Cargo2, Dept2"';
             } else {
                 for (const entry of entries) {
                     const parts = entry.split(',').map(p => p.trim());
                     if (parts.length >= 3) {
                         const [name, role, department] = parts;
                         // Normaliza email removendo acentos e espaços
                         const normalizedEmail = name.toLowerCase()
                            .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                            .replace(/\s+/g, '.') + '@demo.com';

                         const { error } = await supabase.from('employees').insert([{
                             name,
                             role,
                             department,
                             email: normalizedEmail,
                             status: 'active',
                             admission_date: new Date().toISOString(),
                             password: '1234'
                         }]);
                         if (!error) {
                             successCount++;
                         } else {
                             console.error(error);
                             errors.push(`${name}: ${error.message}`);
                         }
                     }
                 }
                 reply = `Processo finalizado. ${successCount} colaboradores foram admitidos com sucesso.`;
                 if (errors.length > 0) {
                     reply += `\n\nErros encontrados:\n` + errors.join('\n');
                 }
             }
          } else {
             reply = 'Para admissão em massa, use: "massa: Nome, Cargo, Dept; Nome2..."';
          }
      }

      // 9. Abrir Vaga (Novo)
      else if (/(?:abrir|criar|nova)\s+(?:uma\s+)?vaga/i.test(msg)) {
          const jobMatch = content.match(/(?:abrir|criar|nova)\s+(?:uma\s+)?vaga\s+(?:para\s+|de\s+)?(.+?)(?:\s+(?:no\s+)?(?:departamento\s+|setor\s+)\s*(.+))?$/i);
          
          if (jobMatch) {
              const title = jobMatch[1].trim().replace(/["']/g, '');
              const department = jobMatch[2] ? jobMatch[2].trim().replace(/["']/g, '') : 'Geral';
              
              const { error } = await supabase.from('jobs').insert([{
                  title: title,
                  department: department,
                  location: 'Híbrido',
                  type: 'Tempo Integral',
                  status: 'Aberta',
                  description: `Vaga para ${title} no departamento ${department}.`,
                  requirements: ['Experiência relevante', 'Trabalho em equipe']
              }]);

              if (error) {
                  console.error(error);
                  reply = `Erro ao criar vaga: ${error.message}`;
              } else {
                  reply = `✅ Vaga para "${title}" criada com sucesso no departamento "${department}".`;
              }
          } else {
              reply = 'Para criar uma vaga, diga: "Abra uma vaga para [Cargo] no departamento [Setor]".';
          }
      }

      // 10. Confirmar Recesso (Segurança para Setor)
      else if (/(?:confirmar|sim)\s+(?:recesso|f[eé]rias coletivas?)/i.test(msg)) {
          const confirmMatch = content.match(/(?:confirmar|sim)\s+(?:recesso|f[eé]rias coletivas?)\s+(?:do\s+|no\s+)?(?:setor|departamento)\s+(?:de\s+|da\s+)?(.+?)\s+(?:de|do\s+dia|desde|a\s+partir\s+de)\s+(\d{1,2}\/\d{1,2}(?:\/\d{2,4})?)\s+(?:at[eé]|a)\s+(\d{1,2}\/\d{1,2}(?:\/\d{2,4})?)/i);
          
          if (confirmMatch) {
              const dept = confirmMatch[1].trim();
              const startStr = confirmMatch[2];
              const endStr = confirmMatch[3];

              const parseDate = (d: string) => {
                  const parts = d.split('/');
                  const day = parts[0].padStart(2, '0');
                  const month = parts[1].padStart(2, '0');
                  const year = parts[2] ? (parts[2].length === 2 ? '20' + parts[2] : parts[2]) : new Date().getFullYear().toString();
                  return `${year}-${month}-${day}`;
              };

              const startDate = parseDate(startStr);
              const endDate = parseDate(endStr);

              // Busca funcionários do setor
              const { data: employees, error: searchError } = await supabase
                 .from('employees')
                 .select('id, name')
                 .ilike('department', `%${dept}%`)
                 .eq('status', 'active');

              if (searchError) throw searchError;

              if (!employees || employees.length === 0) {
                  reply = `Não encontrei funcionários ativos no departamento "${dept}".`;
              } else {
                  let successCount = 0;
                  for (const emp of employees) {
                      await supabase.from('time_off_requests').insert([{
                         employee_id: emp.id,
                         type: 'vacation',
                         start_date: startDate,
                         end_date: endDate,
                         status: 'approved',
                         reason: 'Recesso Coletivo (Via IA)'
                      }]);
                      await supabase.from('employees').update({ status: 'vacation' }).eq('id', emp.id);
                      successCount++;
                  }
                  reply = `✅ Recesso confirmado! ${successCount} colaboradores do setor ${dept} estão de férias de ${startStr} a ${endStr}.`;
              }
          } else {
              reply = 'Para confirmar, digite exatamente: "Confirmar recesso setor [Nome] de [Data] a [Data]".';
          }
      }

      // 11. Dar Férias por Setor (Detecta tentativa em massa)
      else if (/(?:dar|conceder|agendar|marcar)\s+f[eé]rias\s+(?:para\s+|ao\s+|a\s+)?(?:o\s+)?(?:todo\s+o\s+)?(?:setor|departamento)/i.test(msg)) {
           const deptMatch = content.match(/(?:dar|conceder|agendar|marcar)\s+f[eé]rias\s+(?:para\s+|ao\s+|a\s+)?(?:o\s+)?(?:todo\s+o\s+)?(?:setor|departamento)\s+(?:de\s+|da\s+)?(.+?)\s+(?:de|do\s+dia|desde|a\s+partir\s+de)\s+(\d{1,2}\/\d{1,2}(?:\/\d{2,4})?)\s+(?:at[eé]|a)\s+(\d{1,2}\/\d{1,2}(?:\/\d{2,4})?)/i);

           if (deptMatch) {
               const dept = deptMatch[1].trim();
               const startStr = deptMatch[2];
               const endStr = deptMatch[3];

               const { count, error } = await supabase
                  .from('employees')
                  .select('*', { count: 'exact', head: true })
                  .ilike('department', `%${dept}%`)
                  .eq('status', 'active');
                
               if (error) throw error;

               if (count && count > 0) {
                   reply = `⚠️ **Atenção:** Você solicitou férias para **${count} colaboradores** do setor **${dept}**.\n\nIsso configura um **Recesso Coletivo**? Se sim, confirme digitando:\n\n👉 "Confirmar recesso setor ${dept} de ${startStr} a ${endStr}"`;
               } else {
                   reply = `Não encontrei funcionários ativos no setor "${dept}".`;
               }
           } else {
               reply = 'Não entendi o setor ou as datas. Use: "Dar férias setor [Nome] de [Data] a [Data]".';
           }
      }

      // 12. Dar Férias Individual (Mantido)
      else if (/(?:dar|conceder|agendar|marcar)\s+f[eé]rias/i.test(msg)) {
          // Ex: "Dar férias para João Silva de 01/10 a 15/10"
          const vacationMatch = content.match(/(?:dar|conceder|agendar|marcar)\s+f[eé]rias\s+(?:para\s+|ao\s+|a\s+)?(.+?)\s+(?:de|do\s+dia|desde|a\s+partir\s+de)\s+(\d{1,2}\/\d{1,2}(?:\/\d{2,4})?)\s+(?:at[eé]|a)\s+(\d{1,2}\/\d{1,2}(?:\/\d{2,4})?)/i);

          if (vacationMatch) {
              const name = vacationMatch[1].trim();
              const startStr = vacationMatch[2];
              const endStr = vacationMatch[3];

              const parseDate = (d: string) => {
                  const parts = d.split('/');
                  const day = parts[0].padStart(2, '0');
                  const month = parts[1].padStart(2, '0');
                  const year = parts[2] ? (parts[2].length === 2 ? '20' + parts[2] : parts[2]) : new Date().getFullYear().toString();
                  return `${year}-${month}-${day}`;
              };

              const startDate = parseDate(startStr);
              const endDate = parseDate(endStr);

              const { data: employees, error: empError } = await supabase
                  .from('employees')
                  .select('id, name')
                  .ilike('name', `%${name}%`)
                  .limit(1);

              if (empError) throw empError;
              if (!employees || employees.length === 0) {
                  reply = `Não encontrei o funcionário "${name}".`;
              } else {
                  const emp = employees[0];
                  
                  const { error: reqError } = await supabase.from('time_off_requests').insert([{
                      employee_id: emp.id,
                      type: 'vacation',
                      start_date: startDate,
                      end_date: endDate,
                      status: 'approved',
                      reason: 'Solicitado via Assistente IA'
                  }]);

                  if (reqError) throw reqError;

                  await supabase.from('employees').update({ status: 'vacation' }).eq('id', emp.id);

                  reply = `✅ Férias agendadas para ${emp.name} de ${startStr} a ${endStr}.`;
              }
          } else {
              reply = 'Para dar férias, use: "Dar férias para [Nome] de [DD/MM] a [DD/MM]".';
          }
      }

      // 13. Cancelar/Encerrar Férias (Mantido)
      else if (/(?:cancelar|encerrar|cortar|voltar|tirar)\s+(?:das\s+)?f[eé]rias/i.test(msg)) {
          const cancelMatch = content.match(/(?:cancelar|encerrar|cortar|voltar|tirar)\s+(?:das\s+)?f[eé]rias\s+(?:de\s+|do\s+|da\s+)?(.+)/i);
          
          if (cancelMatch) {
              const name = cancelMatch[1].trim();

              const { data: employees, error: empError } = await supabase
                  .from('employees')
                  .select('id, name')
                  .ilike('name', `%${name}%`)
                  .limit(1);

              if (empError) throw empError;
              if (!employees || employees.length === 0) {
                  reply = `Não encontrei o funcionário "${name}".`;
              } else {
                  const emp = employees[0];

                  await supabase.from('employees').update({ status: 'active' }).eq('id', emp.id);

                  // Encerra solicitações ativas ajustando a data final para ontem
                  const today = new Date().toISOString().split('T')[0];
                  const { data: requests } = await supabase
                      .from('time_off_requests')
                      .select('id')
                      .eq('employee_id', emp.id)
                      .eq('status', 'approved')
                      .eq('type', 'vacation')
                      .gte('end_date', today);
                  
                  if (requests && requests.length > 0) {
                      const yesterday = new Date();
                      yesterday.setDate(yesterday.getDate() - 1);
                      const yesterdayStr = yesterday.toISOString().split('T')[0];

                      for (const req of requests) {
                          await supabase.from('time_off_requests').update({ end_date: yesterdayStr }).eq('id', req.id);
                      }
                  }

                  reply = `✅ Férias de ${emp.name} encerradas. Status atualizado para Ativo.`;
              }
          } else {
              reply = 'Para encerrar férias, use: "Encerrar férias de [Nome]".';
          }
      }

      // 14. Cadastro Individual (Mantido)
      else {
          const registrationMatch = content.match(/(?:cadastre|admitir|novo)\s+(?:o\s+|a\s+)?(?:funcionário|colaborador)\s+["']?([^"',;]+)["']?[\s,;]+(?:cargo\s+)?["']?([^"',;]+)["']?[\s,;]+(?:no\s+)?(?:departamento\s+|setor\s+)?["']?([^"';]+)["']?/i);
          
          if (registrationMatch) {
             const [_, name, role, department] = registrationMatch;
             const normalizedEmail = name.trim().toLowerCase()
                .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                .replace(/\s+/g, '.') + '@demo.com';

             const { error } = await supabase.from('employees').insert([{
                 name: name.trim(),
                 role: role.trim(),
                 department: department.trim(),
                 email: normalizedEmail,
                 status: 'active',
                 admission_date: new Date().toISOString(),
                 password: '1234'
             }]);

             if (error) {
                 console.error(error);
                 reply = `Erro ao cadastrar: ${error.message}`;
             } else {
                 reply = `✅ Colaborador ${name.trim()} cadastrado com sucesso no cargo de ${role.trim()} (Dept: ${department.trim()}).`;
             }
          } 
          
          // 10. Help / Fallback
          else if (/ajuda|menu|op[cç][oõ]es|o\s+que\s+voc[eê]\s+faz/i.test(msg)) {
              reply = menuText;
          } else {
              reply = "Desculpe, não entendi. Tente 'ajuda' para ver o que posso fazer ou use os botões de sugestão.";
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
      // 🔀 Desvio Offline (Mock)
      if (USE_MOCK) {
        mockDatabase.set('ai_messages', []);
        setMessages([{ id: 'initial-menu', role: 'assistant', content: menuText, timestamp: new Date() }]);
        return;
      }

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

  return { messages, loading, sending, addMessage, sendMessage, clearHistory, suggestions };
}
