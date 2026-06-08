import { useQuery, useQueryClient } from '@tanstack/react-query';
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
  const queryClient = useQueryClient();

  const { data: jobs = [], isLoading: loadingJobs, error: errorJobs, refetch: refetchJobs } = useQuery<Job[]>({
    queryKey: ['jobs'],
    queryFn: async () => {
      if (USE_MOCK) {
        const mockJobs = mockDatabase.get('jobs');
        mockJobs.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        return mockJobs;
      }
      const { data, error } = await supabase.from('jobs').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  const { data: candidates = [], isLoading: loadingCandidates, error: errorCandidates, refetch: refetchCandidates } = useQuery<Candidate[]>({
    queryKey: ['candidates'],
    queryFn: async () => {
      if (USE_MOCK) {
        const mockCandidates = mockDatabase.get('candidates');
        mockCandidates.sort((a: any, b: any) => new Date(b.applied_at).getTime() - new Date(a.applied_at).getTime());
        return mockCandidates;
      }
      const { data, error } = await supabase.from('candidates').select('*').order('applied_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  const loading = loadingJobs || loadingCandidates;
  const errorObj = errorJobs || errorCandidates;
  const error = errorObj ? (errorObj as any).message || String(errorObj) : null;

  const refetch = async () => {
    await Promise.all([refetchJobs(), refetchCandidates()]);
  };

  // --- Funções de Vagas ---

  const addJob = async (job: Omit<Job, 'id' | 'created_at'>) => {
    try {
      if (USE_MOCK) {
        const newJob = { ...job, id: Date.now().toString(), created_at: new Date().toISOString() };
        mockDatabase.add('jobs', newJob);
        await queryClient.invalidateQueries({ queryKey: ['jobs'] });
        return { data: newJob, error: null };
      }

      const { data, error } = await supabase.from('jobs').insert([job]).select().single();
      if (error) throw error;
      await queryClient.invalidateQueries({ queryKey: ['jobs'] });
      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err };
    }
  };

  const updateJob = async (id: string, updates: Partial<Job>) => {
    try {
      if (USE_MOCK) {
        const updated = mockDatabase.update('jobs', id, updates);
        await queryClient.invalidateQueries({ queryKey: ['jobs'] });
        return { data: updated, error: null };
      }

      const { data, error } = await supabase.from('jobs').update(updates).eq('id', id).select().single();
      if (error) throw error;
      await queryClient.invalidateQueries({ queryKey: ['jobs'] });
      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err };
    }
  };

  const deleteJob = async (id: string) => {
    try {
      if (USE_MOCK) {
        mockDatabase.remove('jobs', id);
        await queryClient.invalidateQueries({ queryKey: ['jobs'] });
        return { error: null };
      }

      const { error } = await supabase.from('jobs').delete().eq('id', id);
      if (error) throw error;
      await queryClient.invalidateQueries({ queryKey: ['jobs'] });
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
        await queryClient.invalidateQueries({ queryKey: ['candidates'] });
        return { data: newCand, error: null };
      }

      const { data, error } = await supabase.from('candidates').insert([candidate]).select().single();
      if (error) throw error;
      await queryClient.invalidateQueries({ queryKey: ['candidates'] });
      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err };
    }
  };

  const updateCandidate = async (id: string, updates: Partial<Candidate>) => {
    try {
      if (USE_MOCK) {
        const updated = mockDatabase.update('candidates', id, updates);
        await queryClient.invalidateQueries({ queryKey: ['candidates'] });
        return { data: updated, error: null };
      }

      const { data, error } = await supabase.from('candidates').update(updates).eq('id', id).select().single();
      if (error) throw error;
      await queryClient.invalidateQueries({ queryKey: ['candidates'] });
      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err };
    }
  };

  const deleteCandidate = async (id: string) => {
    try {
      if (USE_MOCK) {
        mockDatabase.remove('candidates', id);
        await queryClient.invalidateQueries({ queryKey: ['candidates'] });
        return { error: null };
      }

      const { error } = await supabase.from('candidates').delete().eq('id', id);
      if (error) throw error;
      await queryClient.invalidateQueries({ queryKey: ['candidates'] });
      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  };

  return { jobs, candidates, loading, error, refetch, addJob, updateJob, deleteJob, addCandidate, updateCandidate, deleteCandidate };
}