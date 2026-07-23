import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { mockDatabase } from "@/lib/mockDatabase";

// Força USE_MOCK como true nos testes para testar a inteligência offline com mockDatabase
vi.mock("@/lib/mockDatabase", async () => {
  const actual = await vi.importActual<any>("@/lib/mockDatabase");
  return {
    ...actual,
    USE_MOCK: true,
  };
});

vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({ data: [], error: null }),
      insert: vi.fn().mockResolvedValue({ data: [], error: null }),
      delete: vi.fn().mockReturnThis(),
      neq: vi.fn().mockResolvedValue({ data: [], error: null }),
      eq: vi.fn().mockReturnThis(),
      ilike: vi.fn().mockReturnThis(),
      or: vi.fn().mockReturnThis(),
    })),
  },
}));

import { useAIChat } from "./useAIChat";

describe("useAIChat Hook (Processamento de Mensagens com IA)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    mockDatabase.init();
  });

  it("deve responder corretamente com Análise de Turnover ao perguntar sobre colaboradores em risco", async () => {
    const { result } = renderHook(() => useAIChat());

    await act(async () => {
      await result.current.sendMessage("Quem são os colaboradores com maior risco de turnover?");
    });

    const messages = result.current.messages;
    const lastMessage = messages[messages.length - 1];

    expect(lastMessage.role).toBe("assistant");
    expect(lastMessage.content).toContain("Análise Preditiva de Risco de Turnover");
    expect(lastMessage.content).toContain("Recomendações da IA");
  });

  it("deve responder com o Relatório Executivo de Desempenho ao perguntar sobre desempenho da equipe", async () => {
    const { result } = renderHook(() => useAIChat());

    await act(async () => {
      await result.current.sendMessage("Gere um resumo do desempenho geral da equipe");
    });

    const messages = result.current.messages;
    const lastMessage = messages[messages.length - 1];

    expect(lastMessage.role).toBe("assistant");
    expect(lastMessage.content).toContain("Relatório Executivo de Desempenho da Equipe");
    expect(lastMessage.content).toContain("Média Geral da Empresa");
  });

  it("deve listar vagas abertas corretamente", async () => {
    const { result } = renderHook(() => useAIChat());

    await act(async () => {
      await result.current.sendMessage("Quais as vagas abertas no momento?");
    });

    const messages = result.current.messages;
    const lastMessage = messages[messages.length - 1];

    expect(lastMessage.role).toBe("assistant");
    expect(lastMessage.content).toContain("vagas abertas");
    expect(lastMessage.content).toContain("Desenvolvedor Front-end");
  });

  it("deve cadastrar novo funcionário ao receber o comando de cadastro sintático", async () => {
    const { result } = renderHook(() => useAIChat());

    await act(async () => {
      await result.current.sendMessage(
        'Cadastre o funcionário "Marcos Guilherme", cargo "Desenvolvedor Pleno", no departamento "Tecnologia"'
      );
    });

    const messages = result.current.messages;
    const lastMessage = messages[messages.length - 1];

    expect(lastMessage.role).toBe("assistant");
    expect(lastMessage.content).toContain("Marcos Guilherme");
    expect(lastMessage.content).toContain("Desenvolvedor Pleno");
    expect(lastMessage.content).toContain("Tecnologia");

    // Verifica se foi adicionado ao mockDatabase
    const employees = mockDatabase.get("employees");
    const registered = employees.find((e: any) => e.name === "Marcos Guilherme");
    expect(registered).toBeDefined();
    expect(registered.role).toBe("Desenvolvedor Pleno");
  });
});
