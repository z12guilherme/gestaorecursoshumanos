import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { message } = await req.json();

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const msg = message.toLowerCase();
    let reply = "Desculpe, não entendi. Tente comandos como: 'buscar funcionário [nome]', 'ver férias' ou 'criar aviso'.";

    // --- Lógica Baseada em Regras (Pure JS) ---

    // 1. Buscar Funcionários
    if (msg.includes('funcionário') || msg.includes('quem é') || msg.includes('buscar')) {
      // Tenta extrair o nome após palavras chave
      const nameMatch = msg.match(/(?:funcionário|quem é|buscar)\s+(?:o\s+|a\s+)?([a-z\u00C0-\u00FF\s]+)/i);
      const searchTerm = nameMatch ? nameMatch[1].trim() : null;

      let query = supabaseClient.from('employees').select('name, role, department, email, status');
      
      if (searchTerm && searchTerm.length > 2) {
        query = query.ilike('name', `%${searchTerm}%`);
      }
      
      const { data, error } = await query.limit(5);
      
      if (error) {
        reply = `Erro ao buscar: ${error.message}`;
      } else if (data && data.length > 0) {
        reply = `Encontrei os seguintes funcionários:\n` + 
                data.map((e: any) => `- ${e.name} (${e.role} - ${e.department})`).join('\n');
      } else {
        reply = "Não encontrei nenhum funcionário com esse nome.";
      }
    }
    
    // 2. Consultar Férias
    else if (msg.includes('férias') || msg.includes('folga')) {
      const { data, error } = await supabaseClient
        .from('time_off_requests')
        .select('*, employees(name)')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
        reply = `Erro ao buscar férias: ${error.message}`;
      } else if (data && data.length > 0) {
        reply = `Últimas solicitações:\n` + 
                data.map((r: any) => `- ${r.employees?.name}: ${r.status} (${r.start_date})`).join('\n');
      } else {
        reply = "Nenhuma solicitação de férias recente encontrada.";
      }
    }

    // 3. Criar Aviso
    else if (msg.includes('aviso') || msg.includes('comunicado')) {
      // Usa o próprio texto da mensagem como conteúdo do aviso
      const { error } = await supabaseClient.from('announcements').insert([{
        title: 'Novo Aviso (via Chat)',
        content: message,
        priority: 'medium',
        author: 'Assistente Virtual'
      }]);

      if (error) reply = `Erro ao criar aviso: ${error.message}`;
      else reply = "Aviso criado e publicado no mural com sucesso!";
    }
    
    // 4. Saudação
    else if (msg.includes('oi') || msg.includes('olá')) {
      reply = "Olá! Sou seu assistente de RH. Posso buscar funcionários, ver férias ou criar avisos.";
    }

    return new Response(JSON.stringify({ reply }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});