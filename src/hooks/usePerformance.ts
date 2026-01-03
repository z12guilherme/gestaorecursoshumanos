import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface Goal {
  description: string;
  achieved: boolean;
  score: number;
}

export interface Competency {
  name: string;
  score: number;
}

export interface PerformanceReview {
  id: string;
  employee_id: string;
  reviewer_id: string;
  period: string;
  overall_score: number;
  goals: Goal[];
  competencies: Competency[];
  feedback: string;
  created_at: string;
  // Campos virtuais para facilitar a UI
  employee_name?: string;
  reviewer_name?: string;
}

export function usePerformance() {
  const [reviews, setReviews] = useState<PerformanceReview[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      // Busca as avaliações e faz o "join" para pegar os nomes dos colaboradores
      const { data, error } = await supabase
        .from('performance_reviews')
        .select(`
          *,
          employee:employees!employee_id(name),
          reviewer:employees!reviewer_id(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Formata os dados para facilitar o uso na tabela
      const formattedReviews = data.map((item: any) => ({
        ...item,
        employee_name: item.employee?.name || 'Desconhecido',
        reviewer_name: item.reviewer?.name || 'Desconhecido',
      }));

      setReviews(formattedReviews);
    } catch (error) {
      console.error('Erro ao buscar avaliações:', error);
    } finally {
      setLoading(false);
    }
  };

  const addReview = async (review: Omit<PerformanceReview, 'id' | 'created_at' | 'employee_name' | 'reviewer_name'>) => {
    try {
      const { data, error } = await supabase
        .from('performance_reviews')
        .insert([review])
        .select()
        .single();

      if (error) throw error;
      
      // Recarrega para pegar os nomes corretos via join
      await fetchReviews();
      return { data, error: null };
    } catch (error) {
      console.error('Erro ao criar avaliação:', error);
      return { data: null, error };
    }
  };

  const deleteReview = async (id: string) => {
    try {
      const { error } = await supabase
        .from('performance_reviews')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setReviews(prev => prev.filter(r => r.id !== id));
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  return { reviews, loading, addReview, deleteReview, refetch: fetchReviews };
}