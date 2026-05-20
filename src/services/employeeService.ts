import { supabase } from '@/lib/supabase';
import { Employee } from '@/types';

/**
 * Service responsável pela lógica de negócio de colaboradores.
 * Isola as chamadas do Supabase para facilitar testes unitários.
 */
export const employeeService = {
    async getAllActive() {
        // RN: Utilizamos a View 'employees_public' conforme correção do Pentest
        // para garantir que dados sensíveis (salário/PIN) não vazem para o front.
        const { data, error } = await supabase
            .from('employees_public')
            .select('*')
            .eq('status', 'Ativo')
            .order('full_name');

        if (error) throw error;
        return data as Employee[];
    },

    async terminateEmployee(id: string, terminationDate: Date, reason: string) {
        if (!id || !reason) {
            throw new Error("ID e motivo do desligamento são obrigatórios.");
        }

        // RN: Registro de desligamento conforme Roadmap Fase 2
        const { error } = await supabase
            .from('employees')
            .update({
                status: 'Desligado',
                termination_date: terminationDate.toISOString(),
                termination_reason: reason
            })
            .eq('id', id);

        if (error) throw error;

        // Aqui poderia disparar um Audit Log manual ou via Trigger no DB
    }
};