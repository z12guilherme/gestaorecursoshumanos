import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { auditService } from "./auditService";
import { supabase } from "@/lib/supabase";

// Criação de um objeto "chainable" para mockar a API PostgREST do Supabase
let mockQueryResult: any = { data: [], count: 0, error: null };

const mockChain = {
    select: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    lt: vi.fn().mockReturnThis(),
    then: vi.fn((resolve) => resolve(mockQueryResult)),
};

// Substitui as chamadas reais de banco de dados pelos mocks
vi.mock("@/lib/supabase", () => ({
    supabase: {
        from: vi.fn(() => mockChain),
    },
}));

describe("auditService", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockQueryResult = { data: [{ id: "log-1", action: "INSERT" }], count: 1, error: null };
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    describe("getLogs (Paginação e Filtros para escalabilidade)", () => {
        it("deve aplicar corretamente os limites de paginação (evita memory leaks)", async () => {
            const page = 3;
            const pageSize = 50;

            await auditService.getLogs(page, pageSize);

            // Na página 3 (tamanho 50), o range deve ser de 100 até 149
            expect(supabase.from).toHaveBeenCalledWith("audit_logs");
            expect(mockChain.select).toHaveBeenCalledWith("*", { count: "exact" });
            expect(mockChain.range).toHaveBeenCalledWith(100, 149);
        });

        it("deve anexar os filtros de data adequadamente no formato ISO", async () => {
            const startDate = "2024-02-01";
            const endDate = "2024-02-15";

            await auditService.getLogs(1, 50, startDate, endDate);

            expect(mockChain.gte).toHaveBeenCalledWith("changed_at", "2024-02-01T00:00:00.000Z");
            expect(mockChain.lte).toHaveBeenCalledWith("changed_at", "2024-02-15T23:59:59.999Z");
        });
    });

    describe("deleteOldLogs (Retenção de Dados / Storage Cleanup)", () => {
        it("deve subtrair com precisão a quantidade de dias para deletar", async () => {
            // Congela o relógio do sistema para uma data fixa a fim de testar a matemática
            const mockCurrentDate = new Date("2024-03-20T12:00:00Z");
            vi.useFakeTimers();
            vi.setSystemTime(mockCurrentDate);

            const daysToRetain = 15;
            await auditService.deleteOldLogs(daysToRetain);

            // 15 dias antes de 20 de Março deve ser exatamente 05 de Março
            const expectedThreshold = new Date("2024-03-05T12:00:00.000Z").toISOString();

            expect(supabase.from).toHaveBeenCalledWith("audit_logs");
            expect(mockChain.delete).toHaveBeenCalled();

            // Valida que estamos deletando estritamente os logs < data limite
            expect(mockChain.lt).toHaveBeenCalledWith("changed_at", expectedThreshold);
        });
    });
});