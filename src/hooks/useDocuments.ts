import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { mockDatabase, USE_MOCK } from '@/lib/mockDatabase';

export interface EmployeeDocument {
  id: string;
  employee_id: string;
  name: string;
  url: string;
  created_at: string;
}

export function useDocuments(employeeId?: string) {
  const [documents, setDocuments] = useState<EmployeeDocument[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchDocuments = async () => {
    if (!employeeId) return;
    try {
      setLoading(true);

      // 🔀 Desvio Offline (Mock)
      if (USE_MOCK) {
        const allDocs = mockDatabase.get('documents');
        const filtered = allDocs
          .filter((d: any) => d.employee_id === employeeId)
          .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        setDocuments(filtered);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('employee_documents')
        .select('*')
        .eq('employee_id', employeeId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const uploadDocument = async (file: File, name: string) => {
    if (!employeeId) return { error: 'No employee ID' };

    // 🔀 Desvio Offline (Mock)
    if (USE_MOCK) {
      const newDoc = {
        id: Date.now().toString(),
        employee_id: employeeId,
        name,
        url: '#mock-upload',
        created_at: new Date().toISOString(),
      };
      mockDatabase.add('documents', newDoc);
      setDocuments(prev => [newDoc, ...prev]);
      return { data: newDoc };
    }
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${employeeId}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(fileName);

      const { data, error: dbError } = await supabase
        .from('employee_documents')
        .insert([{ employee_id: employeeId, name, url: publicUrl }])
        .select()
        .single();

      if (dbError) throw dbError;
      
      setDocuments(prev => [data, ...prev]);
      return { data };
    } catch (error) {
      return { error };
    }
  };

  const deleteDocument = async (id: string) => {
    // 🔀 Desvio Offline (Mock)
    if (USE_MOCK) {
      mockDatabase.remove('documents', id);
      setDocuments(prev => prev.filter(d => d.id !== id));
      return { error: null };
    }

    const { error } = await supabase.from('employee_documents').delete().eq('id', id);
    if (!error) {
      setDocuments(prev => prev.filter(d => d.id !== id));
    }
    return { error };
  };

  useEffect(() => {
    fetchDocuments();
  }, [employeeId]);

  return { documents, loading, uploadDocument, deleteDocument };
}