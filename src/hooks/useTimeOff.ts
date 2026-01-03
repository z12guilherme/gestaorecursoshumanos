import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface TimeOffRequest {
  id: string;
  employee_id: string;
  type: string;
  start_date: string;
  end_date: string;
  status: 'pending' | 'approved' | 'rejected';
  reason: string;
  created_at: string;
  // Campos virtuais (joins)
  employee_name?: string;
  employee_department?: string;
}

export function useTimeOff() {
  const [requests, setRequests] = useState<TimeOffRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('time_off_requests')
        .select(`
          *,
          employee:employees!employee_id(name, department)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formatted = data.map((item: any) => ({
        ...item,
        employee_name: item.employee?.name || 'Desconhecido',
        employee_department: item.employee?.department || '-',
      }));

      setRequests(formatted);
    } catch (error) {
      console.error('Erro ao buscar solicitações:', error);
    } finally {
      setLoading(false);
    }
  };

  const addRequest = async (request: Omit<TimeOffRequest, 'id' | 'created_at' | 'employee_name' | 'employee_department' | 'status'>) => {
    try {
      const { data, error } = await supabase
        .from('time_off_requests')
        .insert([{ ...request, status: 'pending' }])
        .select()
        .single();

      if (error) throw error;
      await fetchRequests();
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const updateRequestStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('time_off_requests')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
      
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  return { requests, loading, addRequest, updateRequestStatus, refetch: fetchRequests };
}