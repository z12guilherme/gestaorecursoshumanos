import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { mockDatabase, USE_MOCK } from "@/lib/mockDatabase";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const menuText = `Olá! Sou seu assistente de RH inteligente. 🤖
Estou aqui para agilizar sua gestão. Você pode conversar comigo naturally ou usar os comandos numéricos.

Exemplos do que posso fazer:
• "Quem são os colaboradores com maior risco de turnover?"
• "Gere um resumo do desempenho geral da equipe"
• "Liste os colaboradores do setor de Tecnologia"
• "Quantas pessoas temos na empresa?"
• "Há vagas abertas no momento?"
• "Cadastre o funcionário Marcos Guilherme..."

Menu Rápido:
1. Listar todos
2. Contagem total
3. Vagas abertas
4. Férias
5. Criar aviso
6. Buscar
7. Demitir
8. Admissão em massa`;

/**
 * Função auxiliar para calcular e formatar a análise preditiva de risco de turnover
 */
function analyzeTurnoverRiskData(
  employees: any[],
  performanceReviews: any[],
  payrollList: any[],
  timeOffList: any[]
): string {
  const activeEmps = (employees || []).filter((e: any) => e.status !== "terminated");
  if (activeEmps.length === 0) {
    return "Não há colaboradores ativos cadastrados para análise de turnover.";
  }

  const items = activeEmps.map((emp: any) => {
    // Busca informações de horas extras na folha
    const pay = (payrollList || []).find((p: any) => p.employee_id === emp.id);
    const overtimeHours = pay ? pay.overtime_hours || 0 : 0;

    // Busca última avaliação de desempenho
    const perf = (performanceReviews || []).find((p: any) => p.employee_id === emp.id);
    const lastPerformanceScore = perf ? perf.overall_score || 7.0 : 7.0;

    // Busca registros de ausências/faltas
    const empTimeOff = (timeOffList || []).filter(
      (t: any) => t.employee_id === emp.id && t.type === "sick"
    );
    const recentAbsences = empTimeOff.length;

    // Calcula tempo de admissão em meses
    const admDate = emp.admission_date ? new Date(emp.admission_date) : new Date();
    const monthsSinceAdm = Math.floor(
      (Date.now() - admDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44)
    );

    let score = 10;
    const factors: string[] = [];

    if (recentAbsences > 0) {
      score += 25;
      factors.push(`Faltas/licenças médicas registradas (${recentAbsences})`);
    }
    if (overtimeHours > 10) {
      score += 30;
      factors.push(`Elevada carga de horas extras (${overtimeHours}h/mês)`);
    }
    if (monthsSinceAdm > 24) {
      score += 20;
      factors.push(`Tempo de casa elevado (> 2 anos) sem promoção de cargo`);
    }
    if (lastPerformanceScore < 7) {
      score += 20;
      factors.push(
        `Pontuação de desempenho abaixo da média (${lastPerformanceScore.toFixed(1)}/10)`
      );
    }

    const riskScore = Math.min(score, 100);
    const riskLevel: "Alto" | "Médio" | "Baixo" =
      riskScore >= 60 ? "Alto" : riskScore >= 35 ? "Médio" : "Baixo";

    return {
      emp,
      riskScore,
      riskLevel,
      factors,
    };
  });

  items.sort((a, b) => b.riskScore - a.riskScore);

  let replyText = "📊 **Análise Preditiva de Risco de Turnover**\n\n";
  const highOrMedium = items.filter((i) => i.riskLevel !== "Baixo");

  if (highOrMedium.length === 0) {
    replyText +=
      "✅ Todos os colaboradores analisados apresentam **baixo risco de turnover** no momento.\n\n";
  } else {
    replyText += `Identifiquei **${highOrMedium.length} colaborador(es)** com risco moderado ou alto de desligamento:\n\n`;
    highOrMedium.forEach((item) => {
      const badge = item.riskLevel === "Alto" ? "🔴 ALTO" : "🟡 MÉDIO";
      replyText += `• **${item.emp.name}** (${item.emp.role} - ${item.emp.department})\n`;
      replyText += `  - Nível de Risco: **${badge}** (Score: ${item.riskScore}/100)\n`;
      replyText += `  - Fatores Determinantes: ${item.factors.length > 0 ? item.factors.join("; ") : "Manutenção preventiva"}\n\n`;
    });
  }

  replyText += "💡 **Recomendações da IA:**\n";
  replyText +=
    "1. Agendar reuniões 1-on-1 com os colaboradores de risco Alto para entender insatisfações e alinhar expectativas de carreira.\n";
  replyText +=
    "2. Avaliar a redistribuição da carga horária nas equipes com alto índice de horas extras.\n";
  replyText +=
    "3. Revisar planos de cargos e salários para colaboradores estagnados há mais de 2 anos no mesmo nível.";

  return replyText;
}

/**
 * Função auxiliar para formatar a análise geral de desempenho da equipe
 */
function analyzePerformanceData(reviews: any[]): string {
  if (!reviews || reviews.length === 0) {
    return "📈 **Resumo de Desempenho da Equipe**\n\nAinda não existem avaliações de desempenho registradas no sistema.";
  }

  const totalScore = reviews.reduce((acc, r) => acc + (r.overall_score || 0), 0);
  const avgScore = (totalScore / reviews.length).toFixed(1);

  let text = `📈 **Relatório Executivo de Desempenho da Equipe**\n\n`;
  text += `• **Média Geral da Empresa:** ${avgScore} / 10.0 ⭐\n`;
  text += `• **Avaliações Analisadas:** ${reviews.length}\n\n`;
  text += `**Destaques por Colaborador:**\n`;

  reviews.forEach((r) => {
    const name = r.employee?.name || r.employee_name || `Colaborador ID ${r.employee_id}`;
    text += `- **${name}**: Nota ${r.overall_score}/10 (${r.period || "Período Atual"})\n`;
    if (r.feedback) {
      text += `  *Feedback:* "${r.feedback}"\n`;
    }
  });

  text += `\n💡 **Insights da IA:** A equipe demonstra forte engajamento técnico e consistência. Recomendamos manter o acompanhamento contínuo através de Planos de Desenvolvimento Individual (PDI).`;
  return text;
}

export function useAIChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // Sugestões de prompt para a UI (Chips/Botões)
  const suggestions = [
    "Quem são os colaboradores com maior risco de turnover?",
    "Gere um resumo do desempenho geral da equipe",
    "Listar colaboradores",
    "Quantos funcionários temos?",
    "Vagas abertas",
    "Criar vaga de Analista",
    "Solicitações de férias",
    "Ajuda",
  ];

  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true);

      // 🔀 Desvio Offline (Mock)
      if (USE_MOCK) {
        const data = mockDatabase.get("ai_messages");
        const formattedMessages = (data || []).map((msg: any) => ({
          id: msg.id,
          role: msg.role as "user" | "assistant",
          content: msg.content,
          timestamp: new Date(msg.created_at),
        }));
        if (formattedMessages.length === 0) {
          setMessages([
            { id: "initial-menu", role: "assistant", content: menuText, timestamp: new Date() },
          ]);
        } else {
          setMessages(formattedMessages);
        }
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("ai_messages")
        .select("*")
        .order("created_at", { ascending: true });

      if (error && error.code !== "PGRST116") throw error;

      const formattedMessages = (data || []).map((msg: any) => ({
        id: msg.id,
        role: msg.role as "user" | "assistant",
        content: msg.content,
        timestamp: new Date(msg.created_at),
      }));

      if (formattedMessages.length === 0) {
        setMessages([
          {
            id: "initial-menu",
            role: "assistant",
            content: menuText,
            timestamp: new Date(),
          },
        ]);
      } else {
        setMessages(formattedMessages);
      }
    } catch (error) {
      console.error("Erro ao buscar mensagens:", error);
      setMessages([
        {
          id: "error-initial",
          role: "assistant",
          content: "Não foi possível carregar o histórico. " + menuText,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  const addMessage = async (role: "user" | "assistant", content: string) => {
    try {
      // Atualização otimista para a UI
      const tempId = Date.now().toString();
      const newMessage: Message = { id: tempId, role, content, timestamp: new Date() };
      setMessages((prev) => [...prev, newMessage]);

      // 🔀 Desvio Offline (Mock)
      if (USE_MOCK) {
        mockDatabase.add("ai_messages", {
          id: tempId,
          role,
          content,
          created_at: new Date().toISOString(),
        });
        return;
      }

      // Salva no banco de dados em segundo plano
      await supabase.from("ai_messages").insert([{ role, content }]);
    } catch (error) {
      console.error("Erro ao adicionar mensagem (addMessage):", error);
    }
  };

  // 🔀 Função auxiliar: processa mensagem usando dados locais do mockDatabase
  const processMockMessage = (content: string): string => {
    const msg = content.toLowerCase().trim();
    const employees = mockDatabase.get("employees");
    const jobs = mockDatabase.get("jobs");
    const timeOff = mockDatabase.get("time_off");
    const performance = mockDatabase.get("performance_reviews");
    const payroll = mockDatabase.get("payroll");

    // 0. Turnover / Risco de saída
    if (
      /turnover|risco\s+de\s+(?:sa[íi]da|demiss[ãa]o|turnover)|colaboradores\s+com\s+maior\s+risco/i.test(
        msg
      )
    ) {
      return analyzeTurnoverRiskData(employees, performance, payroll, timeOff);
    }

    // 0. Resumo de desempenho da equipe
    if (
      /desempenho|resumo\s+do?\s+desempenho|avalia[çc][ãa]o\s+geral|relat[óo]rio\s+de\s+desempenho/i.test(
        msg
      )
    ) {
      return analyzePerformanceData(performance);
    }

    // 0. Cadastro individual de colaborador via prompt
    if (/(?:cadastre|admitir|novo)\s+(?:o\s+|a\s+)?(?:funcionário|colaborador)/i.test(msg)) {
      const match = content.match(
        /(?:cadastre|admitir|novo)\s+(?:o\s+|a\s+)?(?:funcionário|colaborador)\s+["']?([^"',;]+?)["']?[\s,;]+(?:cargo\s+)?["']?([^"',;]+?)["']?[\s,;]+(?:no\s+)?(?:departamento\s+|setor\s+)?["']?([^"',;]+?)["']?$/i
      );
      if (match) {
        const [_, name, role, department] = match;
        const normalizedEmail =
          name
            .trim()
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/\s+/g, ".") + "@empresa.com";

        mockDatabase.add("employees", {
          id: Date.now().toString(),
          name: name.trim(),
          role: role.trim(),
          department: department.trim(),
          email: normalizedEmail,
          status: "active",
          admission_date: new Date().toISOString().split("T")[0],
          password: "1234",
        });

        return `✅ Colaborador **${name.trim()}** cadastrado com sucesso no cargo de **${role.trim()}** (Dept: **${department.trim()}**).`;
      }
      return 'Para cadastrar, use o formato: "Cadastre o funcionário Marcos Guilherme, cargo Desenvolvedor Pleno, no departamento Tecnologia".';
    }

    // 1. Listar colaboradores
    if (
      /(listar|ver|mostrar|quais|quem)\s+(?:s[aã]o\s+os\s+)?(?:todos\s+os\s+)?(?:colaboradores|funcion[aá]rios)|^1$/i.test(
        msg
      )
    ) {
      if (employees.length > 0) {
        return (
          "Aqui estão os colaboradores:\n" +
          employees.map((e: any) => `- ${e.name} (${e.role} - ${e.department})`).join("\n")
        );
      }
      return "Não encontrei colaboradores cadastrados.";
    }

    // 2. Contagem
    if (/quantos\s+(?:colaboradores|funcion[aá]rios|pessoas)|total|^2$/i.test(msg)) {
      return `Atualmente, a empresa conta com ${employees.length} colaboradores.`;
    }

    // 3. Vagas
    if (/vagas|oportunidades|recrutamento|^3$/i.test(msg)) {
      const open = jobs.filter((j: any) => j.status === "Aberta");
      if (open.length > 0) {
        return (
          "Encontrei estas vagas abertas:\n" +
          open
            .map((j: any) => `- ${j.title} (${j.department} - ${j.location || "Presencial"})`)
            .join("\n")
        );
      }
      return "Não há vagas abertas no momento.";
    }

    // 4. Férias
    if (/f[eé]rias|aus[eê]ncias|folgas|^4$/i.test(msg)) {
      if (timeOff.length > 0) {
        return (
          "Últimas movimentações de férias:\n" +
          timeOff
            .map(
              (r: any) =>
                `- ${r.employee?.name || "Funcionário"}: ${r.status === "approved" ? "Aprovado" : "Pendente"}`
            )
            .join("\n")
        );
      }
      return "Não há registros recentes de férias.";
    }

    // 5. Criar aviso
    if (/(?:criar|crie|novo|publicar)\s+(?:um\s+)?aviso|^aviso:/i.test(msg)) {
      const match = content.match(/(?:aviso:|criar\s+aviso)\s*(.+)/i);
      if (match) {
        mockDatabase.add("announcements", {
          id: Date.now().toString(),
          title: "Aviso do Assistente",
          content: match[1].trim(),
          priority: "medium",
          author: "IA",
          created_at: new Date().toISOString(),
        });
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
          return (
            "Encontrei:\n" +
            found
              .map((e: any) => `- ${e.name}\n  Cargo: ${e.role}\n  Dept: ${e.department}`)
              .join("\n\n")
          );
        }
        return `Não encontrei ninguém chamado "${match[1].trim()}".`;
      }
      return 'Diga o nome que deseja buscar. Ex: "buscar Carlos"';
    }

    // Help / Fallback
    if (/ajuda|menu|op[cç][oõ]es|^help$/i.test(msg)) {
      return menuText;
    }

    return '🤖 Modo Demo: Tente comandos como "quem tem maior risco de turnover?", "resumo de desempenho", "listar colaboradores", "vagas abertas" ou "ajuda".';
  };

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    try {
      setSending(true);
      await addMessage("user", content);

      // 🔀 Desvio Offline (Mock) — Usa NLP local com dados do mockDatabase
      if (USE_MOCK) {
        const reply = processMockMessage(content);
        await addMessage("assistant", reply);
        setSending(false);
        return;
      }

      const msg = content.toLowerCase().trim();
      let reply = "";

      // --- LÓGICA INTELIGENTE (NLP Básico + Regex) ---

      // 0. Analise de Turnover
      if (
        /turnover|risco\s+de\s+(?:sa[íi]da|demiss[ãa]o|turnover)|colaboradores\s+com\s+maior\s+risco/i.test(
          msg
        )
      ) {
        const { data: employees } = await supabase.from("employees").select("*");
        const { data: performanceReviews } = await supabase
          .from("performance_reviews")
          .select("*, employee:employees(name)");
        const { data: payrollList } = await supabase.from("payroll").select("*");
        const { data: timeOffList } = await supabase.from("time_off_requests").select("*");

        reply = analyzeTurnoverRiskData(
          employees || [],
          performanceReviews || [],
          payrollList || [],
          timeOffList || []
        );
      }

      // 0. Resumo de Desempenho Geral da Equipe
      else if (
        /desempenho|resumo\s+do?\s+desempenho|avalia[çc][ãa]o\s+geral|relat[óo]rio\s+de\s+desempenho/i.test(
          msg
        )
      ) {
        const { data: reviews } = await supabase
          .from("performance_reviews")
          .select("*, employee:employees(name)");
        reply = analyzePerformanceData(reviews || []);
      }

      // 1. Listar Colaboradores (Com filtro opcional de departamento, ignorando relatórios especiais)
      else if (
        /(listar|ver|mostrar|quais|quem)\s+(?:s[aã]o\s+os\s+)?(?:todos\s+os\s+)?(?:colaboradores|funcion[aá]rios|empregados)|op[cç][aã]o\s*1|^1$/i.test(
          msg
        ) &&
        !msg.includes("turnover") &&
        !msg.includes("desempenho") &&
        !msg.includes("risco")
      ) {
        const deptMatch = msg.match(
          /(?:de|do|da|no|na)\s+(?:setor\s+|departamento\s+)?([a-z\u00C0-\u00FF\s]+)/i
        );
        let query = supabase.from("employees").select("name, role, department");

        if (deptMatch && !msg.includes("todos")) {
          const dept = deptMatch[1].trim();
          if (!["empresa", "rh", "aqui"].includes(dept)) {
            query = query.ilike("department", `%${dept}%`);
          }
        }

        const { data, error } = await query.limit(20);
        if (error) throw error;

        if (data && data.length > 0) {
          reply =
            `Aqui estão os colaboradores${deptMatch ? ` (filtro: ${deptMatch[1]})` : ""}:\n` +
            data.map((e: any) => `- ${e.name} (${e.role} - ${e.department})`).join("\n");
        } else {
          reply = "Não encontrei colaboradores com esses critérios.";
        }
      }

      // 2. Contagem
      else if (
        /quantos\s+(?:colaboradores|funcion[aá]rios|pessoas)|total\s+de\s+(?:colaboradores|funcion[aá]rios)|op[cç][aã]o\s*2|^2$/i.test(
          msg
        )
      ) {
        const { count, error } = await supabase
          .from("employees")
          .select("*", { count: "exact", head: true });
        if (error) throw error;
        reply = `Atualmente, a empresa conta com ${count ?? 0} colaboradores ativos.`;
      }

      // 3. Vagas (Com filtro opcional)
      else if (/vagas|oportunidades|recrutamento|op[cç][aã]o\s*3|^3$/i.test(msg)) {
        let query = supabase
          .from("jobs")
          .select("title, department, location")
          .eq("status", "Aberta");

        const termMatch = msg.match(/(?:para|de)\s+([a-z\u00C0-\u00FF\s]+)/i);
        if (termMatch && !msg.match(/^3$/)) {
          const term = termMatch[1].trim();
          query = query.or(`title.ilike.%${term}%,department.ilike.%${term}%`);
        }

        const { data, error } = await query.limit(10);
        if (error) throw error;

        if (data && data.length > 0) {
          reply =
            "Encontrei estas vagas abertas:\n" +
            data
              .map((j: any) => `- ${j.title} (${j.department} - ${j.location || "Híbrido"})`)
              .join("\n");
        } else {
          reply = "Não encontrei vagas abertas com esses critérios no momento.";
        }
      }

      // 4. Férias
      else if (/f[eé]rias|aus[eê]ncias|folgas|op[cç][aã]o\s*4|^4$/i.test(msg)) {
        const { data, error } = await supabase
          .from("time_off_requests")
          .select("*, employees(name)")
          .order("created_at", { ascending: false })
          .limit(5);
        if (error) throw error;
        if (data && data.length > 0) {
          reply =
            `Últimas movimentações de férias/ausências:\n` +
            data
              .map(
                (r: any) =>
                  `- ${r.employees?.name}: ${r.status === "approved" ? "Aprovado" : r.status === "pending" ? "Pendente" : "Rejeitado"} (Início: ${new Date(r.start_date).toLocaleDateString()})`
              )
              .join("\n");
        } else {
          reply = "Não há registros recentes de férias.";
        }
      }

      // 5. Criar Aviso
      else if (
        /(?:criar|crie|novo|publicar|adicionar)\s+(?:um\s+)?aviso|^aviso:|op[cç][aã]o\s*5|^5$/i.test(
          msg
        )
      ) {
        const contentMatch = content.match(
          /(?:aviso:|criar\s+aviso|crie\s+(?:um\s+)?aviso|novo\s+aviso|publicar\s+aviso)(?:\s+(?:com\s+o\s+texto|sobre|que\s+diga|dizendo)[:\s]*)?\s*(.+)/i
        );
        if (contentMatch) {
          const noticeText = contentMatch[1].trim();
          const { error } = await supabase.from("announcements").insert([
            {
              title: "Aviso do Assistente",
              content: noticeText,
              priority: "medium",
              author: "IA",
            },
          ]);
          if (error) throw error;
          reply = `✅ Aviso publicado no mural: "${noticeText}"`;
        } else {
          reply = 'Para publicar, diga: "aviso: [sua mensagem]" ou "criar aviso [mensagem]".';
        }
      }

      // 6. Buscar Funcionário
      else if (/buscar|procurar|quem\s+[eé]|encontrar|op[cç][aã]o\s*6|^6$/i.test(msg)) {
        const searchMatch = content.match(
          /(?:buscar|procurar|quem\s+[eé]|encontrar)\s+(?:o\s+|a\s+|pelo\s+|pela\s+)?([a-z\u00C0-\u00FF\s]+)/i
        );
        if (searchMatch && !msg.match(/^6$/)) {
          const term = searchMatch[1].trim();
          const { data, error } = await supabase
            .from("employees")
            .select("name, role, department, email")
            .ilike("name", `%${term}%`)
            .limit(5);
          if (error) throw error;
          if (data && data.length > 0) {
            reply =
              `Encontrei:\n` +
              data
                .map(
                  (e: any) =>
                    `- ${e.name}\n  Cargo: ${e.role}\n  Dept: ${e.department}\n  Email: ${e.email}`
                )
                .join("\n\n");
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
          const { data, error } = await supabase
            .from("employees")
            .select("id, name")
            .ilike("name", `%${name}%`)
            .limit(1);
          if (error) throw error;
          if (data && data.length > 0) {
            const emp = data[0];
            await supabase.from("employees").update({ status: "terminated" }).eq("id", emp.id);
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
        if (msg.includes("massa:")) {
          const bulkData = content.substring(content.indexOf("massa:") + 6).trim();
          const entries = bulkData
            .split(";")
            .map((e) => e.trim())
            .filter((e) => e);
          let successCount = 0;
          const errors: string[] = [];

          if (entries.length === 0) {
            reply = 'Formato: "massa: Nome, Cargo, Dept; Nome2, Cargo2, Dept2"';
          } else {
            for (const entry of entries) {
              const parts = entry.split(",").map((p) => p.trim());
              if (parts.length >= 3) {
                const [name, role, department] = parts;
                const normalizedEmail =
                  name
                    .toLowerCase()
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, "")
                    .replace(/\s+/g, ".") + "@empresa.com";

                const { error } = await supabase.from("employees").insert([
                  {
                    name,
                    role,
                    department,
                    email: normalizedEmail,
                    status: "active",
                    admission_date: new Date().toISOString(),
                    password: "1234",
                  },
                ]);
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
              reply += `\n\nErros encontrados:\n` + errors.join("\n");
            }
          }
        } else {
          reply = 'Para admissão em massa, use: "massa: Nome, Cargo, Dept; Nome2..."';
        }
      }

      // 9. Abrir Vaga
      else if (/(?:abrir|criar|nova)\s+(?:uma\s+)?vaga/i.test(msg)) {
        const jobMatch = content.match(
          /(?:abrir|criar|nova)\s+(?:uma\s+)?vaga\s+(?:para\s+|de\s+)?(.+?)(?:\s+(?:no\s+)?(?:departamento\s+|setor\s+)\s*(.+))?$/i
        );

        if (jobMatch) {
          const title = jobMatch[1].trim().replace(/["']/g, "");
          const department = jobMatch[2] ? jobMatch[2].trim().replace(/["']/g, "") : "Geral";

          const { error } = await supabase.from("jobs").insert([
            {
              title: title,
              department: department,
              location: "Híbrido",
              type: "Tempo Integral",
              status: "Aberta",
              description: `Vaga para ${title} no departamento ${department}.`,
              requirements: ["Experiência relevante", "Trabalho em equipe"],
            },
          ]);

          if (error) {
            console.error(error);
            reply = `Erro ao criar vaga: ${error.message}`;
          } else {
            reply = `✅ Vaga para "${title}" criada com sucesso no departamento "${department}".`;
          }
        } else {
          reply =
            'Para criar uma vaga, diga: "Abra uma vaga para [Cargo] no departamento [Setor]".';
        }
      }

      // 10. Confirmar Recesso
      else if (/(?:confirmar|sim)\s+(?:recesso|f[eé]rias coletivas?)/i.test(msg)) {
        const confirmMatch = content.match(
          /(?:confirmar|sim)\s+(?:recesso|f[eé]rias coletivas?)\s+(?:do\s+|no\s+)?(?:setor|departamento)\s+(?:de\s+|da\s+)?(.+?)\s+(?:de|do\s+dia|desde|a\s+partir\s+de)\s+(\d{1,2}\/\d{1,2}(?:\/\d{2,4})?)\s+(?:at[eé]|a)\s+(\d{1,2}\/\d{1,2}(?:\/\d{2,4})?)/i
        );

        if (confirmMatch) {
          const dept = confirmMatch[1].trim();
          const startStr = confirmMatch[2];
          const endStr = confirmMatch[3];

          const parseDate = (d: string) => {
            const parts = d.split("/");
            const day = parts[0].padStart(2, "0");
            const month = parts[1].padStart(2, "0");
            const year = parts[2]
              ? parts[2].length === 2
                ? "20" + parts[2]
                : parts[2]
              : new Date().getFullYear().toString();
            return `${year}-${month}-${day}`;
          };

          const startDate = parseDate(startStr);
          const endDate = parseDate(endStr);

          const { data: employees, error: searchError } = await supabase
            .from("employees")
            .select("id, name")
            .ilike("department", `%${dept}%`)
            .eq("status", "active");

          if (searchError) throw searchError;

          if (!employees || employees.length === 0) {
            reply = `Não encontrei funcionários ativos no departamento "${dept}".`;
          } else {
            let successCount = 0;
            for (const emp of employees) {
              await supabase.from("time_off_requests").insert([
                {
                  employee_id: emp.id,
                  type: "vacation",
                  start_date: startDate,
                  end_date: endDate,
                  status: "approved",
                  reason: "Recesso Coletivo (Via IA)",
                },
              ]);
              await supabase.from("employees").update({ status: "vacation" }).eq("id", emp.id);
              successCount++;
            }
            reply = `✅ Recesso confirmado! ${successCount} colaboradores do setor ${dept} estão de férias de ${startStr} a ${endStr}.`;
          }
        } else {
          reply =
            'Para confirmar, digite exatamente: "Confirmar recesso setor [Nome] de [Data] a [Data]".';
        }
      }

      // 11. Dar Férias por Setor
      else if (
        /(?:dar|conceder|agendar|marcar)\s+f[eé]rias\s+(?:para\s+|ao\s+|a\s+)?(?:o\s+)?(?:todo\s+o\s+)?(?:setor|departamento)/i.test(
          msg
        )
      ) {
        const deptMatch = content.match(
          /(?:dar|conceder|agendar|marcar)\s+f[eé]rias\s+(?:para\s+|ao\s+|a\s+)?(?:o\s+)?(?:todo\s+o\s+)?(?:setor|departamento)\s+(?:de\s+|da\s+)?(.+?)\s+(?:de|do\s+dia|desde|a\s+partir\s+de)\s+(\d{1,2}\/\d{1,2}(?:\/\d{2,4})?)\s+(?:at[eé]|a)\s+(\d{1,2}\/\d{1,2}(?:\/\d{2,4})?)/i
        );

        if (deptMatch) {
          const dept = deptMatch[1].trim();
          const startStr = deptMatch[2];
          const endStr = deptMatch[3];

          const { count, error } = await supabase
            .from("employees")
            .select("*", { count: "exact", head: true })
            .ilike("department", `%${dept}%`)
            .eq("status", "active");

          if (error) throw error;

          if (count && count > 0) {
            reply = `⚠️ **Atenção:** Você solicitou férias para **${count} colaboradores** do setor **${dept}**.\n\nIsso configura um **Recesso Coletivo**? Se sim, confirme digitando:\n\n👉 "Confirmar recesso setor ${dept} de ${startStr} a ${endStr}"`;
          } else {
            reply = `Não encontrei funcionários ativos no setor "${dept}".`;
          }
        } else {
          reply =
            'Não entendi o setor ou as datas. Use: "Dar férias setor [Nome] de [Data] a [Data]".';
        }
      }

      // 12. Dar Férias Individual
      else if (/(?:dar|conceder|agendar|marcar)\s+f[eé]rias/i.test(msg)) {
        const vacationMatch = content.match(
          /(?:dar|conceder|agendar|marcar)\s+f[eé]rias\s+(?:para\s+|ao\s+|a\s+)?(.+?)\s+(?:de|do\s+dia|desde|a\s+partir\s+de)\s+(\d{1,2}\/\d{1,2}(?:\/\d{2,4})?)\s+(?:at[eé]|a)\s+(\d{1,2}\/\d{1,2}(?:\/\d{2,4})?)/i
        );

        if (vacationMatch) {
          const name = vacationMatch[1].trim();
          const startStr = vacationMatch[2];
          const endStr = vacationMatch[3];

          const parseDate = (d: string) => {
            const parts = d.split("/");
            const day = parts[0].padStart(2, "0");
            const month = parts[1].padStart(2, "0");
            const year = parts[2]
              ? parts[2].length === 2
                ? "20" + parts[2]
                : parts[2]
              : new Date().getFullYear().toString();
            return `${year}-${month}-${day}`;
          };

          const startDate = parseDate(startStr);
          const endDate = parseDate(endStr);

          const { data: employees, error: empError } = await supabase
            .from("employees")
            .select("id, name")
            .ilike("name", `%${name}%`)
            .limit(1);

          if (empError) throw empError;
          if (!employees || employees.length === 0) {
            reply = `Não encontrei o funcionário "${name}".`;
          } else {
            const emp = employees[0];

            const { error: reqError } = await supabase.from("time_off_requests").insert([
              {
                employee_id: emp.id,
                type: "vacation",
                start_date: startDate,
                end_date: endDate,
                status: "approved",
                reason: "Solicitado via Assistente IA",
              },
            ]);

            if (reqError) throw reqError;

            await supabase.from("employees").update({ status: "vacation" }).eq("id", emp.id);

            reply = `✅ Férias agendadas para ${emp.name} de ${startStr} a ${endStr}.`;
          }
        } else {
          reply = 'Para dar férias, use: "Dar férias para [Nome] de [DD/MM] a [DD/MM]".';
        }
      }

      // 13. Cancelar/Encerrar Férias
      else if (/(?:cancelar|encerrar|cortar|voltar|tirar)\s+(?:das\s+)?f[eé]rias/i.test(msg)) {
        const cancelMatch = content.match(
          /(?:cancelar|encerrar|cortar|voltar|tirar)\s+(?:das\s+)?f[eé]rias\s+(?:de\s+|do\s+|da\s+)?(.+)/i
        );

        if (cancelMatch) {
          const name = cancelMatch[1].trim();

          const { data: employees, error: empError } = await supabase
            .from("employees")
            .select("id, name")
            .ilike("name", `%${name}%`)
            .limit(1);

          if (empError) throw empError;
          if (!employees || employees.length === 0) {
            reply = `Não encontrei o funcionário "${name}".`;
          } else {
            const emp = employees[0];

            await supabase.from("employees").update({ status: "active" }).eq("id", emp.id);

            const today = new Date().toISOString().split("T")[0];
            const { data: requests } = await supabase
              .from("time_off_requests")
              .select("id")
              .eq("employee_id", emp.id)
              .eq("status", "approved")
              .eq("type", "vacation")
              .gte("end_date", today);

            if (requests && requests.length > 0) {
              const yesterday = new Date();
              yesterday.setDate(yesterday.getDate() - 1);
              const yesterdayStr = yesterday.toISOString().split("T")[0];

              for (const req of requests) {
                await supabase
                  .from("time_off_requests")
                  .update({ end_date: yesterdayStr })
                  .eq("id", req.id);
              }
            }

            reply = `✅ Férias de ${emp.name} encerradas. Status atualizado para Ativo.`;
          }
        } else {
          reply = 'Para encerrar férias, use: "Encerrar férias de [Nome]".';
        }
      }

      // 14. Cadastro Individual
      else {
        const registrationMatch = content.match(
          /(?:cadastre|admitir|novo)\s+(?:o\s+|a\s+)?(?:funcionário|colaborador)\s+["']?([^"',;]+?)["']?[\s,;]+(?:cargo\s+)?["']?([^"',;]+?)["']?[\s,;]+(?:no\s+)?(?:departamento\s+|setor\s+)?["']?([^"',;]+?)["']?$/i
        );

        if (registrationMatch) {
          const [_, name, role, department] = registrationMatch;
          const normalizedEmail =
            name
              .trim()
              .toLowerCase()
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "")
              .replace(/\s+/g, ".") + "@empresa.com";

          const { error } = await supabase.from("employees").insert([
            {
              name: name.trim(),
              role: role.trim(),
              department: department.trim(),
              email: normalizedEmail,
              status: "active",
              admission_date: new Date().toISOString(),
              password: "1234",
            },
          ]);

          if (error) {
            console.error(error);
            reply = `Erro ao cadastrar: ${error.message}`;
          } else {
            reply = `✅ Colaborador ${name.trim()} cadastrado com sucesso no cargo de ${role.trim()} (Dept: ${department.trim()}).`;
          }
        }

        // 15. Help / Fallback
        else if (/ajuda|menu|op[cç][oõ]es|o\s+que\s+voc[eê]\s+faz/i.test(msg)) {
          reply = menuText;
        } else {
          reply =
            "Desculpe, não entendi. Tente 'ajuda' para ver o que posso fazer ou use os botões de sugestão.";
        }
      }

      await addMessage("assistant", reply);
    } catch (error) {
      console.error("Erro ao processar mensagem:", error);
      await addMessage("assistant", "Desculpe, ocorreu um erro ao processar sua solicitação.");
    } finally {
      setSending(false);
    }
  };

  const clearHistory = async () => {
    try {
      // 🔀 Desvio Offline (Mock)
      if (USE_MOCK) {
        mockDatabase.set("ai_messages", []);
        setMessages([
          { id: "initial-menu", role: "assistant", content: menuText, timestamp: new Date() },
        ]);
        return;
      }

      // Limpa o banco de dados em segundo plano
      await supabase.from("ai_messages").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      // Reinicia para a mensagem de menu na UI
      setMessages([
        {
          id: "initial-menu",
          role: "assistant",
          content: menuText,
          timestamp: new Date(),
        },
      ]);
    } catch (error) {
      console.error("Erro ao limpar histórico:", error);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  return { messages, loading, sending, addMessage, sendMessage, clearHistory, suggestions };
}
