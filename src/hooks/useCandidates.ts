import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Candidate } from '@/types/hr';
import { mockDatabase, USE_MOCK } from '@/lib/mockDatabase';

export function useCandidates() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCandidates = async () => {
    try {
      setLoading(true);

      // 🔀 Desvio Offline (Mock)
      if (USE_MOCK) {
        const data = mockDatabase.get('candidates');
        const mapped: Candidate[] = data.map((cand: any) => ({
          id: cand.id,
          name: cand.name,
          email: cand.email,
          phone: cand.phone || '',
          position: cand.position || cand.role_applied || '',
          status: cand.status,
          appliedAt: cand.applied_at,
          rating: cand.rating,
          notes: cand.notes,
        }));
        mapped.sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime());
        setCandidates(mapped);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('candidates')
        .select('*')
        .order('applied_at', { ascending: false });

      if (error) throw error;

      if (data) {
        const mappedCandidates: Candidate[] = data.map((cand) => ({
          id: cand.id,
          name: cand.name,
          email: cand.email,
          phone: cand.phone,
          position: cand.position,
          status: cand.status,
          appliedAt: cand.applied_at,
          rating: cand.rating,
          notes: cand.notes,
        }));
        setCandidates(mappedCandidates);
      }
    } catch (err: any) {
      console.error('Error fetching candidates:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  return { candidates, loading, error, refetch: fetchCandidates };
}