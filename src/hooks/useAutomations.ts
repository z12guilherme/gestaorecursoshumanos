import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface AutomationScript {
  id: string;
  title: string;
  description?: string;
  code: string;
  language: string;
  instructions?: string;
  is_custom: boolean;
  created_at: string;
}

export function useAutomations() {
  const [scripts, setScripts] = useState<AutomationScript[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchScripts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('automation_scripts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setScripts(data || []);
    } catch (error) {
      console.error('Error fetching scripts:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveScript = async (script: Omit<AutomationScript, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('automation_scripts')
        .insert([script])
        .select()
        .single();

      if (error) throw error;
      setScripts(prev => [data, ...prev]);
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  useEffect(() => {
    fetchScripts();
  }, []);

  return { scripts, loading, saveScript, refetch: fetchScripts };
}