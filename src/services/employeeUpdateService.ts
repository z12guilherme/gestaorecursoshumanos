import { supabase } from "@/lib/supabase";

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
        const { error } = await supabase
            .from('employee_update_requests')
            .insert([{ employee_id: employeeId, requested_changes: changes, status: 'pending' }]);

        if (error) throw error;
    },

    /**
     * O RH busca todas as solicitações que ainda precisam ser revisadas.
     */
    async getPendingRequests() {
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
        const { error: updateError } = await supabase.from('employees').update(changes).eq('id', employeeId);
        if (updateError) throw updateError;

        const { error: reqError } = await supabase.from('employee_update_requests').update({ status: 'approved' }).eq('id', requestId);
        if (reqError) throw reqError;
    },

    async rejectRequest(requestId: string) {
        const { error } = await supabase.from('employee_update_requests').update({ status: 'rejected' }).eq('id', requestId);
        if (error) throw error;
    }
};