import { supabase } from "@/lib/supabase";
import { mockDatabase, USE_MOCK } from "@/lib/mockDatabase";

export interface UpdateRequest {
    id: string;
    employee_id: string;
    requested_changes: Record<string, any>;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
    employees?: { name: string; department: string; avatar_url: string };
}

export const employeeUpdateService = {
    /**
     * O funcionário submete as mudanças. Elas ficam "pending" (pendentes).
     */
    async submitRequest(employeeId: string, changes: Record<string, any>) {
        if (USE_MOCK) {
            const emp = mockDatabase.get('employees').find((e: any) => e.id === employeeId);
            const newReq = { id: Date.now().toString(), employee_id: employeeId, requested_changes: changes, status: 'pending' as const, created_at: new Date().toISOString(), employees: { name: emp?.name || '', department: emp?.department || '', avatar_url: '' } };
            mockDatabase.add('update_requests', newReq);
            return;
        }

        const { error } = await supabase
            .from('employee_update_requests')
            .insert([{ employee_id: employeeId, requested_changes: changes, status: 'pending' }]);

        if (error) throw error;
    },

    /**
     * O RH busca todas as solicitações que ainda precisam ser revisadas.
     */
    async getPendingRequests() {
        if (USE_MOCK) {
            return mockDatabase.get('update_requests').filter((r: any) => r.status === 'pending');
        }

        const { data, error } = await supabase
            .from('employee_update_requests')
            .select('id, employee_id, requested_changes, status, created_at, employees(name, department, avatar_url)')
            .eq('status', 'pending')
            .order('created_at', { ascending: true });

        if (error) throw error;
        return data as UpdateRequest[];
    },

    /**
     * O RH aprova. O sistema atualiza o funcionário e fecha o ticket na mesma transação lógica.
     */
    async approveRequest(requestId: string, employeeId: string, changes: Record<string, any>) {
        if (USE_MOCK) {
            mockDatabase.update('employees', employeeId, changes);
            mockDatabase.update('update_requests', requestId, { status: 'approved' });
            return;
        }

        const { error: updateError } = await supabase.from('employees').update(changes).eq('id', employeeId);
        if (updateError) throw updateError;

        const { error: reqError } = await supabase.from('employee_update_requests').update({ status: 'approved' }).eq('id', requestId);
        if (reqError) throw reqError;
    },

    async rejectRequest(requestId: string) {
        if (USE_MOCK) {
            mockDatabase.update('update_requests', requestId, { status: 'rejected' });
            return;
        }

        const { error } = await supabase.from('employee_update_requests').update({ status: 'rejected' }).eq('id', requestId);
        if (error) throw error;
    }
};