import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { JobPosting } from '@/types/hr';

export function useJobPostings() {
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJobPostings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('job_postings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        const mappedPostings: JobPosting[] = data.map((job) => ({
          id: job.id,
          title: job.title,
          department: job.department,
          location: job.location,
          type: job.type,
          status: job.status,
          description: job.description,
          requirements: job.requirements,
          createdAt: job.created_at,
          applicants: job.applicants_count || 0,
        }));
        setJobPostings(mappedPostings);
      }
    } catch (err: any) {
      console.error('Error fetching job postings:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobPostings();
  }, []);

  return { jobPostings, loading, error, refetch: fetchJobPostings };
}