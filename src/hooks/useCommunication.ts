import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

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