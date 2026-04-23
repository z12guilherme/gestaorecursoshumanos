import { describe, it, expect, vi, beforeEach } from "vitest";
import { analyticsService } from "./analyticsService";
import { supabase } from "@/lib/supabase";

// Criação de um objeto "chainable" para mockar a API do Supabase
let mockQueryResult: any = { data: [], error: null };

const mockChain = {
  select: vi.fn().mockReturnThis(),
  lte: vi.fn().mockReturnThis(),
  then: vi.fn((resolve) => resolve(mockQueryResult)),
};

vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: vi.fn(() => mockChain),
  },
}));

describe("analyticsService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockQueryResult = { data: [], error: null };
  });

  describe("getMonthlyMetrics (Precisão de Turnover e Headcount)", () => {
    it("deve calcular o Turnover e Headcount exatamente usando termination_date", async () => {
      // Congelamos a data da análise para Maio de 2024
      const mockDate = new Date("2024-05-15T12:00:00Z");

      mockQueryResult = {
        data: [
          // 1. Ativo puro: Sem data de demissão
          { department: "TI", base_salary: 5000, status: "active", admission_date: "2023-01-01", termination_date: null },

          // 2. Ativo no momento analisado: Demitido apenas NO FUTURO (Junho de 2024)
          { department: "TI", base_salary: 5000, status: "terminated", admission_date: "2023-01-01", termination_date: "2024-06-10" },

          // 3. Desligado NESTE exato mês analisado (Maio de 2024) -> Conta para o Turnover!
          { department: "RH", base_salary: 4000, status: "terminated", admission_date: "2023-01-01", termination_date: "2024-05-20" },

          // 4. Desligado no PASSADO (Abril de 2024) -> Fora da análise de ativos de Maio
          { department: "Vendas", base_salary: 3000, status: "terminated", admission_date: "2023-01-01", termination_date: "2024-04-20" }
        ],
        error: null
      };

      const result = await analyticsService.getMonthlyMetrics(mockDate);

      // O Headcount deve ser 3 (Os 2 de TI e o de RH, pois iniciaram o mês de Maio ativos)
      expect(result.metrics.headcount).toBe(3);

      // Turnover: 1 demissão (RH em Maio) / 3 Headcount = 33.333...%
      expect(result.metrics.turnoverRate).toBeCloseTo(33.33, 1);

      // Custos totais dos 3 ativos: 5000 + 5000 + 4000 = 14000
      expect(result.metrics.totalCost).toBe(14000);
    });

    it("deve usar o fallback de segurança (olhando para o status) se termination_date for nulo para dados legados", async () => {
      const mockDate = new Date("2024-05-15T12:00:00Z");

      mockQueryResult = {
        data: [
          { department: "TI", base_salary: 5000, status: "Ativo", admission_date: "2023-01-01", termination_date: null },
          { department: "TI", base_salary: 5000, status: "Férias", admission_date: "2023-01-01", termination_date: null },
          { department: "RH", base_salary: 4000, status: "Desligado", admission_date: "2023-01-01", termination_date: null }
        ],
        error: null
      };

      const result = await analyticsService.getMonthlyMetrics(mockDate);

      // Para dados velhos, só quem tem status 'Ativo', 'Férias' ou 'Afastado' entra
      expect(result.metrics.headcount).toBe(2);
      // Turnover sem data exata assume 0 para não quebrar gráficos passados com aproximações falsas
      expect(result.metrics.turnoverRate).toBe(0);
    });
  });
});