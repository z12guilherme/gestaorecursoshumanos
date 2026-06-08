import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { mockDatabase, USE_MOCK } from '@/lib/mockDatabase';

export interface TimeEntry {
  id: string;
  employee_id: string;
  timestamp: string;
  type: 'in' | 'out';
}

export function useTimeEntries() {
  const queryClient = useQueryClient();

  const { data: entries = [], isLoading: loading, refetch } = useQuery<TimeEntry[]>({
    queryKey: ['timeEntries'],
    queryFn: async () => {
      // 🔀 Desvio Offline (Mock)
      if (USE_MOCK) {
        const data = mockDatabase.get('time_entries');
        data.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        return data;
      }

      const { data, error } = await supabase
        .from('time_entries')
        .select('*')
        .order('timestamp', { ascending: false });

      if (error) throw error;
      return data || [];
    }
  });

  const addEntry = async (entry: Omit<TimeEntry, 'id'>) => {
    try {
      // 🔀 Desvio Offline (Mock)
      if (USE_MOCK) {
        const emp = mockDatabase.get('employees').find((e: any) => e.id === entry.employee_id);
        const newEntry = {
          ...entry,
          id: Date.now().toString(),
          employees: emp ? { name: emp.name, department: emp.department } : null,
        };
        mockDatabase.add('time_entries', newEntry);
        await queryClient.invalidateQueries({ queryKey: ['timeEntries'] });
        return { data: newEntry, error: null };
      }

      const { data, error } = await supabase
        .from('time_entries')
        .insert([entry])
        .select()
        .single();

      if (error) throw error;
      await queryClient.invalidateQueries({ queryKey: ['timeEntries'] });
      return { data, error: null };
    } catch (error) {
      console.error('Erro ao registrar ponto:', error);
      return { data: null, error };
    }
  };

  return { entries, loading, addEntry, refetch };
}