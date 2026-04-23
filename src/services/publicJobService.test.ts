import { describe, it, expect, vi, beforeEach } from "vitest";
import { supabase } from "@/lib/supabase";
import { publicJobService } from "./publicJobService";

// Criação de um objeto "chainable" para mockar a API
let mockQueryResult: any = { data: [], error: null };

const mockChain = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    single: vi.fn().mockReturnThis(),
    then: vi.fn((resolve) => resolve(mockQueryResult)),
};

// Mock do Supabase
vi.mock("@/lib/supabase", () => ({
    supabase: {
        from: vi.fn(() => mockChain),
    },
}));

describe("publicJobService", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockQueryResult = { data: [], error: null };
    });

    it("deve buscar apenas vagas com status 'Aberta'", async () => {
        const mockJobs = [
            { id: "1", title: "Dev Front-end", status: "Aberta" },
            { id: "2", title: "Dev Back-end", status: "Aberta" },
        ];

        mockQueryResult = { data: mockJobs, error: null };

        const result = await publicJobService.getOpenJobs();

        expect(result.length).toBe(2);
        expect(supabase.from).toHaveBeenCalledWith("jobs");
        // Verifica se o filtro `eq('status', 'Aberta')` foi chamado
        expect(mockChain.eq).toHaveBeenCalledWith("status", "Aberta");
    });
});