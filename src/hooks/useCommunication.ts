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
      console.error('Error fetching announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  const addAnnouncement = async (announcement: Omit<Announcement, 'id' | 'created_at'>) => {
    // 🔀 Desvio Offline (Mock)
    if (USE_MOCK) {
      const newAnn = { ...announcement, id: Date.now().toString(), created_at: new Date().toISOString() };
      mockDatabase.add('announcements', newAnn);
      setAnnouncements(prev => [newAnn as Announcement, ...prev]);
      return { data: newAnn };
    }

    const { data, error } = await supabase
      .from('announcements')
      .insert([announcement])
      .select()
      .single();
    
    if (error) return { error };
    setAnnouncements(prev => [data, ...prev]);
    return { data };
  };

  const updateAnnouncement = async (id: string, updates: Partial<Announcement>) => {
    // 🔀 Desvio Offline (Mock)
    if (USE_MOCK) {
      const updated = mockDatabase.update('announcements', id, updates);
      if (updated) setAnnouncements(prev => prev.map(a => a.id === id ? updated : a));
      return { data: updated };
    }

    const { data, error } = await supabase
      .from('announcements')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) return { error };
    setAnnouncements(prev => prev.map(a => a.id === id ? data : a));
    return { data };
  };

  const deleteAnnouncement = async (id: string) => {
    // 🔀 Desvio Offline (Mock)
    if (USE_MOCK) {
      mockDatabase.remove('announcements', id);
      setAnnouncements(prev => prev.filter(a => a.id !== id));
      return { error: null };
    }

    const { error } = await supabase
      .from('announcements')
      .delete()
      .eq('id', id);

    if (error) return { error };
    setAnnouncements(prev => prev.filter(a => a.id !== id));
    return { error: null };
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  return {
    announcements,
    loading,
    addAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    refetch: fetchAnnouncements
  };
}