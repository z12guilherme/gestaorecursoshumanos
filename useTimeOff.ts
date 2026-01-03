import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { TimeOffRequest } from '@/types/hr';

export function useTimeOff() {
  const [requests, setRequests] = useState<TimeOffRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('time_off_requests')
        .select('*')
        .order('start_date', { ascending: false });

      if (error) throw error;

      if (data) {
        const mappedRequests: TimeOffRequest[] = data.map((req) => ({
          id: req.id,
          employeeId: req.employee_id,
          employeeName: req.employee_name,
          type: req.type,
          startDate: req.start_date,
          endDate: req.end_date,
          status: req.status,
          reason: req.reason,
        }));
        setRequests(mappedRequests);
      }
    } catch (err: any) {
      console.error('Error fetching time off requests:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  return { requests, loading, error, refetch: fetchRequests };
}