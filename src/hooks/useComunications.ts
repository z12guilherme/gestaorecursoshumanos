import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { mockDatabase, USE_MOCK } from '@/lib/mockDatabase';

export interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: 'low' | 'medium' | 'high';
  author: string;
  created_at: string;
}

export function useCommunication() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);

      // 🔀 Desvio Offline (Mock)
      if (USE_MOCK) {
        const data = mockDatabase.get('announcements');
        data.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        setAnnouncements(data);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAnnouncements(data || []);
    } catch (error) {
      console.error('Erro ao buscar avisos:', error);
    } finally {
      setLoading(false);
    }
  };

  const addAnnouncement = async (announcement: Omit<Announcement, 'id' | 'created_at'>) => {
    try {
      // 🔀 Desvio Offline (Mock)
      if (USE_MOCK) {
        const newAnn = { ...announcement, id: Date.now().toString(), created_at: new Date().toISOString() };
        mockDatabase.add('announcements', newAnn);
        setAnnouncements(prev => [newAnn as Announcement, ...prev]);
        return { data: newAnn, error: null };
      }

      const { data, error } = await supabase
        .from('announcements')
        .insert([announcement])
        .select()
        .single();

      if (error) throw error;
      setAnnouncements(prev => [data, ...prev]);
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  return { announcements, loading, addAnnouncement, refetch: fetchAnnouncements };
}
