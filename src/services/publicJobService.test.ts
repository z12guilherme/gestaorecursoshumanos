import { describe, it, expect, vi, beforeEach } from "vitest";
import { supabase } from "@/lib/supabase";
import { publicJobService } from "./publicJobService";

// Mock do Supabase
vi.mock("@/lib/supabase", () => ({
    supabase: {
        from: vi.fn(() => ({
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            order: vi.fn().mockReturnThis(),
            single: vi.fn(),
        })),
    },
}));

describe("publicJobService", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("deve buscar apenas vagas com status 'Aberta'", async () => {
        const mockJobs = [
            { id: "1", title: "Dev Front-end", status: "Aberta" },
            { id: "2", title: "Dev Back-end", status: "Aberta" },
        ];

        const fromMock = supabase.from as vi.Mock;
        const selectMock = fromMock().select as vi.Mock;
        selectMock.mockResolvedValue({ data: mockJobs, error: null });

        const result = await publicJobService.getOpenJobs();

        expect(result.length).toBe(2);
        expect(fromMock).toHaveBeenCalledWith("jobs");
        // Verifica se o filtro `eq('status', 'Aberta')` foi chamado
        const eqMock = fromMock().eq as vi.Mock;
        expect(eqMock).toHaveBeenCalledWith("status", "Aberta");
    });
});