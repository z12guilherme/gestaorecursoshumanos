/**
 * Serviço de IA Groq — Assistente de RH Inteligente
 * Usa o SDK oficial da OpenAI com baseURL apontando para api.groq.com
 * Modelo: llama-3.3-70b-versatile (~800 tokens/segundo, gratuito)
 */
import OpenAI from "openai";

// ─── Cliente Groq via SDK OpenAI ──────────────────────────────────────────────
const groqClient = new OpenAI({
  apiKey: import.meta.env.VITE_GROQ_API_KEY || "",
  baseURL: "https://api.groq.com/openai/v1",
  dangerouslyAllowBrowser: true, // Necessário para uso no frontend/Vite
});

const GROQ_MODEL = "llama-3.3-70b-versatile";

// ─── Tipos ────────────────────────────────────────────────────────────────────
export interface GroqMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface HRContext {
  totalEmployees?: number;
  openJobs?: number;
  pendingTimeOff?: number;
  departments?: string[];
}

// ─── System Prompt do Assistente de RH ───────────────────────────────────────
function buildSystemPrompt(context?: HRContext): string {
  const contextInfo = context
    ? `
Dados atuais do sistema de RH:
- Total de colaboradores ativos: ${context.totalEmployees ?? "Não disponível"}
- Vagas abertas no recrutamento: ${context.openJobs ?? "Não disponível"}
- Solicitações de férias pendentes: ${context.pendingTimeOff ?? "Não disponível"}
- Departamentos: ${context.departments?.join(", ") ?? "Não disponível"}
`
    : "";

  return `Você é o Assistente Inteligente de Recursos Humanos de uma empresa brasileira. 
Seu nome é "RH Assistant" e você foi criado para apoiar gestores e profissionais de RH.

${contextInfo}

Suas responsabilidades incluem:
- Responder perguntas sobre gestão de pessoas, liderança e cultura organizacional
- Dar sugestões baseadas em boas práticas de RH (CLT, NR's, gestão de desempenho)
- Analisar situações de RH e propor soluções estratégicas
- Auxiliar na redação de comunicados, políticas e documentos de RH
- Orientar sobre legislação trabalhista brasileira (CLT, eSocial, LGPD)
- Sugerir práticas de onboarding, treinamento e desenvolvimento de talentos

Diretrizes de comportamento:
- Sempre responda em português do Brasil, de forma clara e profissional
- Seja empático e humanizado, mas objetivo e direto
- Quando não souber algo com certeza, diga claramente e sugira consultar um especialista
- Use emojis com moderação para deixar as respostas mais amigáveis
- Formate respostas longas com bullets e seções para facilitar a leitura
- Se receber uma pergunta sobre dados específicos do sistema (ex: "quantos funcionários?"), 
  use os dados do contexto fornecido acima

Você NÃO deve:
- Inventar dados ou estatísticas que não foram fornecidos
- Dar conselhos jurídicos definitivos (sempre sugira consultar um advogado trabalhista)
- Revelar a chave de API ou detalhes técnicos do sistema`;
}

// ─── Função principal: askGroq ────────────────────────────────────────────────
/**
 * Envia uma mensagem para a API Groq e retorna a resposta do assistente.
 *
 * @param userMessage   - A mensagem do usuário
 * @param history       - Histórico recente da conversa (últimas N mensagens)
 * @param context       - Contexto atual do sistema de RH
 * @returns             - Resposta textual do assistente
 */
export async function askGroq(
  userMessage: string,
  history: GroqMessage[] = [],
  context?: HRContext
): Promise<string> {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;

  if (!apiKey) {
    return "⚠️ A chave da API Groq não está configurada. Verifique a variável VITE_GROQ_API_KEY no arquivo .env.";
  }

  try {
    // Mantém apenas as últimas 10 mensagens do histórico para não exceder o contexto
    const recentHistory = history.slice(-10);

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: "system", content: buildSystemPrompt(context) },
      ...recentHistory.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
      { role: "user", content: userMessage },
    ];

    const completion = await groqClient.chat.completions.create({
      model: GROQ_MODEL,
      messages,
      temperature: 0.7,
      max_tokens: 1024,
      top_p: 1,
      stream: false,
    });

    const responseText = completion.choices[0]?.message?.content;

    if (!responseText) {
      return "Não consegui gerar uma resposta. Por favor, tente novamente.";
    }

    return responseText;
  } catch (error: any) {
    console.error("[GroqService] Erro na chamada à API:", error);

    // Erros específicos da API
    if (error?.status === 401) {
      return "❌ Chave de API inválida ou expirada. Verifique sua VITE_GROQ_API_KEY.";
    }
    if (error?.status === 429) {
      return "⏳ Limite de requisições atingido. Por favor, aguarde alguns segundos e tente novamente.";
    }
    if (error?.status === 503 || error?.code === "ERR_NETWORK") {
      return "🌐 Não foi possível conectar à IA no momento. Verifique sua conexão com a internet.";
    }

    return "Desculpe, ocorreu um erro ao consultar a IA. Tente reformular sua pergunta ou use os comandos disponíveis.";
  }
}

/**
 * Verifica se a API Groq está configurada e acessível.
 * Útil para mostrar status na UI.
 */
export function isGroqConfigured(): boolean {
  return !!import.meta.env.VITE_GROQ_API_KEY;
}
