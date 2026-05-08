import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { mockDatabase, USE_MOCK } from '@/lib/mockDatabase';

export interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  status: string;
  description: string;
  requirements: string[];
  created_at: string;
}

export interface Candidate {
  id: string;
  job_id: string | null;
  name: string;
  email: string;
  phone: string;
  position: string;
  status: string;
  rating: number;
  resume_url?: string;
  notes: string;
  applied_at: string;
}

export function useRecruitment() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);

      // 🔀 Desvio Offline (Mock)
      if (USE_MOCK) {
        const mockJobs = mockDatabase.get('jobs');
        const mockCandidates = mockDatabase.get('candidates');
        mockJobs.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        mockCandidates.sort((a: any, b: any) => new Date(b.applied_at).getTime() - new Date(a.applied_at).getTime());
        setJobs(mockJobs);
        setCandidates(mockCandidates);
        setLoading(false);
        return;
      }
      
      // Busca vagas e candidatos em paralelo
      const [jobsResponse, candidatesResponse] = await Promise.all([
        supabase.from('jobs').select('*').order('created_at', { ascending: false }),
        supabase.from('candidates').select('*').order('applied_at', { ascending: false })
      ]);

      if (jobsResponse.error) throw jobsResponse.error;
      if (candidatesResponse.error) throw candidatesResponse.error;

      setJobs(jobsResponse.data || []);
      setCandidates(candidatesResponse.data || []);
    } catch (err: any) {
      console.error('Erro ao buscar dados de recrutamento:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- Funções de Vagas ---

  const addJob = async (job: Omit<Job, 'id' | 'created_at'>) => {
    try {
      if (USE_MOCK) {
        const newJob = { ...job, id: Date.now().toString(), created_at: new Date().toISOString() };
        mockDatabase.add('jobs', newJob);
        setJobs(prev => [newJob as Job, ...prev]);
        return { data: newJob, error: null };
      }

      const { data, error } = await supabase.from('jobs').insert([job]).select().single();
      if (error) throw error;
      setJobs(prev => [data, ...prev]);
      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err };
    }
  };

  const updateJob = async (id: string, updates: Partial<Job>) => {
    try {
      if (USE_MOCK) {
        const updated = mockDatabase.update('jobs', id, updates);
        if (updated) setJobs(prev => prev.map(j => j.id === id ? updated : j));
        return { data: updated, error: null };
      }

      const { data, error } = await supabase.from('jobs').update(updates).eq('id', id).select().single();
      if (error) throw error;
      setJobs(prev => prev.map(j => j.id === id ? data : j));
      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err };
    }
  };

  const deleteJob = async (id: string) => {
    try {
      if (USE_MOCK) {
        mockDatabase.remove('jobs', id);
        setJobs(prev => prev.filter(j => j.id !== id));
        return { error: null };
      }

      const { error } = await supabase.from('jobs').delete().eq('id', id);
      if (error) throw error;
      setJobs(prev => prev.filter(j => j.id !== id));
      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  };

  // --- Funções de Candidatos ---

  const addCandidate = async (candidate: Omit<Candidate, 'id' | 'applied_at'>) => {
    try {
      if (USE_MOCK) {
        const newCand = { ...candidate, id: Date.now().toString(), applied_at: new Date().toISOString() };
        mockDatabase.add('candidates', newCand);
        setCandidates(prev => [newCand as Candidate, ...prev]);
        return { data: newCand, error: null };
      }

      const { data, error } = await supabase.from('candidates').insert([candidate]).select().single();
      if (error) throw error;
      setCandidates(prev => [data, ...prev]);
      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err };
    }
  };

  const updateCandidate = async (id: string, updates: Partial<Candidate>) => {
    try {
      if (USE_MOCK) {
        const updated = mockDatabase.update('candidates', id, updates);
        if (updated) setCandidates(prev => prev.map(c => c.id === id ? updated : c));
        return { data: updated, error: null };
      }

      const { data, error } = await supabase.from('candidates').update(updates).eq('id', id).select().single();
      if (error) throw error;
      setCandidates(prev => prev.map(c => c.id === id ? data : c));
      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err };
    }
  };

  const deleteCandidate = async (id: string) => {
    try {
      if (USE_MOCK) {
        mockDatabase.remove('candidates', id);
        setCandidates(prev => prev.filter(c => c.id !== id));
        return { error: null };
      }

      const { error } = await supabase.from('candidates').delete().eq('id', id);
      if (error) throw error;
      setCandidates(prev => prev.filter(c => c.id !== id));
      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { jobs, candidates, loading, error, refetch: fetchData, addJob, updateJob, deleteJob, addCandidate, updateCandidate, deleteCandidate };
}