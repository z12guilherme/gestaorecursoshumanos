import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface TimeEntry {
  id: string;
  employee_id: string;
  timestamp: string;
  type: 'in' | 'out';
}

export function useTimeEntries() {
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('time_entries')
        .select('*')
        .order('timestamp', { ascending: false });

      if (error) throw error;
      setEntries(data || []);
    } catch (error) {
      console.error('Erro ao buscar registros de ponto:', error);
    } finally {
      setLoading(false);
    }
  };

  const addEntry = async (entry: Omit<TimeEntry, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('time_entries')
        .insert([entry])
        .select()
        .single();

      if (error) throw error;
      setEntries(prev => [data, ...prev]);
      return { data, error: null };
    } catch (error) {
      console.error('Erro ao registrar ponto:', error);
      return { data: null, error };
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  return { entries, loading, addEntry, refetch: fetchEntries };
}