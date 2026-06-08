import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { mockDatabase, USE_MOCK } from '@/lib/mockDatabase';

export interface Employee {
  id: string;
  name: string;
  email: string;
  role: string; // No banco chamamos de role (Cargo)
  department: string;
  status: string;
  admission_date: string; // No banco chamamos de admission_date
  password?: string; // Senha para o ponto eletrônico
  created_at?: string;
  // Campos adicionais de cadastro
  phone?: string;
  contract_type?: string;
  birth_date?: string;
  manager?: string;
  work_schedule?: string;
  unit?: string;
  // Campos financeiros (Folha de Pagamento)
  base_salary?: number;
  fixed_discounts?: number;
  has_insalubrity?: boolean;
  has_night_shift?: boolean;
  contracted_hours?: number;
}

export function useEmployees() {
  const queryClient = useQueryClient();

  const { data: employees = [], isLoading: loading, error: queryError, refetch } = useQuery<Employee[]>({
    queryKey: ['employees'],
    queryFn: async () => {
      // 🔀 Desvio Offline (Mock)
      if (USE_MOCK) {
        const data = mockDatabase.get('employees');
        data.sort((a: Employee, b: Employee) => a.name.localeCompare(b.name));
        return data;
      }

      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('name');

      if (error) throw error;
      return data || [];
    }
  });

  const error = queryError ? (queryError as any).message || String(queryError) : null;

  const fetchPublicEmployees = async () => {
    // Mantemos por retrocompatibilidade, mas agora podemos usar o cache ou uma query específica
    try {
      if (USE_MOCK) {
        const data = mockDatabase.get('employees').map((e: any) => ({
          id: e.id, name: e.name, department: e.department, role: e.role, status: e.status
        }));
        data.sort((a: Employee, b: Employee) => a.name.localeCompare(b.name));
        return data;
      }

      const { data, error } = await supabase
        .from('employees_public')
        .select('*')
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Erro ao buscar colaboradores públicos:', err);
      return [];
    }
  };

  const addEmployee = async (employee: Omit<Employee, 'id' | 'created_at'>) => {
    try {
      // 🔀 Desvio Offline (Mock)
      if (USE_MOCK) {
        const newEmp = { ...employee, id: Date.now().toString(), created_at: new Date().toISOString() };
        mockDatabase.add('employees', newEmp);
        await queryClient.invalidateQueries({ queryKey: ['employees'] });
        return { data: newEmp, error: null };
      }

      console.log('>>> MODO TEXTO PLANO ATIVO: Nenhuma Edge Function será chamada <<<');

      const { data, error } = await supabase
        .from('employees')
        .insert([employee])
        .select()
        .single();

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ['employees'] });
      return { data, error: null };
    } catch (err: any) {
      console.error('Erro ao adicionar colaborador:', err);
      return { data: null, error: err };
    }
  };

  const updateEmployee = async (id: string, updates: Partial<Employee>) => {
    try {
      // 🔀 Desvio Offline (Mock)
      if (USE_MOCK) {
        const updated = mockDatabase.update('employees', id, updates);
        await queryClient.invalidateQueries({ queryKey: ['employees'] });
        return { data: updated, error: null };
      }

      console.log('>>> ATUALIZANDO (MODO TEXTO PLANO) <<<');

      const { data, error } = await supabase
        .from('employees')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ['employees'] });
      return { data, error: null };
    } catch (err: any) {
      console.error('Erro ao atualizar colaborador:', err);
      return { data: null, error: err };
    }
  };

  const deleteEmployee = async (id: string) => {
    try {
      // 🔀 Desvio Offline (Mock)
      if (USE_MOCK) {
        mockDatabase.remove('employees', id);
        await queryClient.invalidateQueries({ queryKey: ['employees'] });
        return { error: null };
      }

      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ['employees'] });
      return { error: null };
    } catch (err: any) {
      console.error('Erro ao excluir colaborador:', err);
      return { error: err };
    }
  };

  // Função para validar login do funcionário no Ponto Eletrônico
  const validateEmployeeLogin = async (employeeId: string, passwordInput: string) => {
    try {
      // 🔀 Desvio Offline (Mock)
      if (USE_MOCK) {
        const emps = mockDatabase.get('employees');
        const found = emps.find((e: any) => e.id === employeeId && e.password === passwordInput);
        return !!found;
      }

      // Validação direta
      const { data, error } = await supabase
        .from('employees')
        .select('id')
        .eq('id', employeeId)
        .eq('password', passwordInput)
        .single();

      if (error || !data) return false;
      return true;
    } catch {
      return false;
    }
  };

  // Busca dados completos (incluindo sensíveis) apenas para edição
  const getEmployeeDetails = async (id: string) => {
    try {
      // 🔀 Desvio Offline (Mock)
      if (USE_MOCK) {
        const emps = mockDatabase.get('employees');
        const emp = emps.find((e: any) => e.id === id);
        return { data: emp || null, error: null };
      }

      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('id', id)
        .single();
      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err };
    }
  };

  return {
    employees,
    loading,
    error,
    refetch,
    fetchPublicEmployees,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    validateEmployeeLogin,
    getEmployeeDetails
  };
}