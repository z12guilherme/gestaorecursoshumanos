import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

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
}

export function useEmployees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
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

  const addEmployee = async (employee: Omit<Employee, 'id' | 'created_at'>) => {
    try {
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

  useEffect(() => {
    fetchEmployees();
  }, []);

  return {
    employees,
    loading,
    error,
    refetch: fetchEmployees,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    validateEmployeeLogin
  };
}