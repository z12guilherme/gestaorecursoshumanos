import { describe, it, expect, vi, beforeEach } from "vitest";
import { employeeUpdateService } from "./employeeUpdateService";
import { supabase } from "@/lib/supabase";

let mockQueryResult: any = { data: [], error: null };

const mockChain = {
    insert: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    then: vi.fn((resolve) => resolve(mockQueryResult)),
};

vi.mock("@/lib/supabase", () => ({
    supabase: {
        from: vi.fn(() => mockChain),
    },
}));

describe("employeeUpdateService", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockQueryResult = { data: [], error: null };
    });

    it("deve submeter uma solicitação de atualização como pendente", async () => {
        await employeeUpdateService.submitRequest("emp-1", { phone: "1199999999" });

        expect(supabase.from).toHaveBeenCalledWith("employee_update_requests");
        expect(mockChain.insert).toHaveBeenCalledWith([{
            employee_id: "emp-1",
            requested_changes: { phone: "1199999999" },
            status: "pending"
        }]);
    });

    it("deve buscar apenas as solicitações pendentes para o RH", async () => {
        mockQueryResult = { data: [{ id: "req-1", status: "pending" }], error: null };
        const result = await employeeUpdateService.getPendingRequests();

        expect(mockChain.select).toHaveBeenCalled();
        expect(mockChain.eq).toHaveBeenCalledWith("status", "pending");
        expect(result.length).toBe(1);
    });

    it("deve aprovar uma solicitação (atualiza o cadastro e fecha o ticket)", async () => {
        await employeeUpdateService.approveRequest("req-1", "emp-1", { phone: "1199999999" });
        expect(supabase.from).toHaveBeenCalledWith("employees");
        expect(supabase.from).toHaveBeenCalledWith("employee_update_requests");
    });

    it("deve rejeitar uma solicitação", async () => {
        await employeeUpdateService.rejectRequest("req-1");
        expect(supabase.from).toHaveBeenCalledWith("employee_update_requests");
        expect(mockChain.update).toHaveBeenCalledWith({ status: "rejected" });
        expect(mockChain.eq).toHaveBeenCalledWith("id", "req-1");
    });
});