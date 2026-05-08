import { useState, useEffect } from 'react';
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
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEmployees = async () => {
    try {
      setLoading(true);

      // 🔀 Desvio Offline (Mock)
      if (USE_MOCK) {
        const data = mockDatabase.get('employees');
        data.sort((a: Employee, b: Employee) => a.name.localeCompare(b.name));
        setEmployees(data);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('name');

      if (error) throw error;

      setEmployees(data || []);
    } catch (err: any) {
      console.error('Erro ao buscar colaboradores:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchPublicEmployees = async () => {
    try {
      setLoading(true);

      // 🔀 Desvio Offline (Mock)
      if (USE_MOCK) {
        const data = mockDatabase.get('employees').map((e: any) => ({
          id: e.id, name: e.name, department: e.department, role: e.role, status: e.status
        }));
        data.sort((a: Employee, b: Employee) => a.name.localeCompare(b.name));
        setEmployees(data);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('employees_public')
        .select('*')
        .order('name');

      if (error) throw error;

      setEmployees(data || []);
    } catch (err: any) {
      console.error('Erro ao buscar colaboradores (público):', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addEmployee = async (employee: Omit<Employee, 'id' | 'created_at'>) => {
    try {
      // 🔀 Desvio Offline (Mock)
      if (USE_MOCK) {
        const newEmp = { ...employee, id: Date.now().toString(), created_at: new Date().toISOString() };
        mockDatabase.add('employees', newEmp);
        setEmployees((prev) => [...prev, newEmp as Employee]);
        return { data: newEmp, error: null };
      }

      // LOG DE DEBUG: Confirmando que estamos na versão SEM Edge Function
      console.log('>>> MODO TEXTO PLANO ATIVO: Nenhuma Edge Function será chamada <<<');

      const { data, error } = await supabase
        .from('employees')
        .insert([employee])
        .select()
        .single();

      if (error) throw error;

      setEmployees((prev) => [...prev, data]);
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
        if (updated) setEmployees((prev) => prev.map((emp) => (emp.id === id ? updated : emp)));
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

      setEmployees((prev) => prev.map((emp) => (emp.id === id ? data : emp)));
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
        setEmployees((prev) => prev.filter((emp) => emp.id !== id));
        return { error: null };
      }

      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setEmployees((prev) => prev.filter((emp) => emp.id !== id));
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

  useEffect(() => {
    fetchEmployees();
  }, []);

  return {
    employees,
    loading,
    error,
    refetch: fetchEmployees,
    fetchPublicEmployees,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    validateEmployeeLogin,
    getEmployeeDetails
  };
}