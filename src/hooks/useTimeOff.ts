import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { mockDatabase, USE_MOCK } from '@/lib/mockDatabase';

export interface TimeOffRequest {
  id: string;
  employee_id: string;
  type: string;
  start_date: string;
  end_date: string;
  status: 'pending' | 'approved' | 'rejected';
  reason: string;
  created_at: string;
  attachment_url?: string | null;
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

      // 🔀 Desvio Offline (Mock)
      if (USE_MOCK) {
        const data = mockDatabase.get('time_off');
        const formatted = data.map((item: any) => ({
          ...item,
          employee_name: item.employee?.name || 'Desconhecido',
          employee_department: item.employee?.department || '-',
        }));
        formatted.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        setRequests(formatted);
        setLoading(false);
        return;
      }

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
      // 🔀 Desvio Offline (Mock)
      if (USE_MOCK) {
        const emp = mockDatabase.get('employees').find((e: any) => e.id === request.employee_id);
        const newReq = {
          ...request,
          id: Date.now().toString(),
          status: 'pending' as const,
          created_at: new Date().toISOString(),
          employee: { name: emp?.name || 'Desconhecido', department: emp?.department || '-' },
        };
        mockDatabase.add('time_off', newReq);
        await fetchRequests();
        return { data: newReq, error: null };
      }

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
      // 🔀 Desvio Offline (Mock)
      if (USE_MOCK) {
        mockDatabase.update('time_off', id, { status });
        setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
        return { error: null };
      }

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
