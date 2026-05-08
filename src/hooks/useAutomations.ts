import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { mockDatabase, USE_MOCK } from '@/lib/mockDatabase';

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

      // 🔀 Desvio Offline (Mock)
      if (USE_MOCK) {
        const data = mockDatabase.get('automation_scripts');
        data.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        setScripts(data);
        setLoading(false);
        return;
      }

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
      // 🔀 Desvio Offline (Mock)
      if (USE_MOCK) {
        const newScript = { ...script, id: Date.now().toString(), created_at: new Date().toISOString() };
        mockDatabase.add('automation_scripts', newScript);
        setScripts(prev => [newScript as AutomationScript, ...prev]);
        return { data: newScript, error: null };
      }

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