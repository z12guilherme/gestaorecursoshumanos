import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { mockDatabase, USE_MOCK } from '@/lib/mockDatabase';
import { Database } from '@/types/supabase';

type DBPerformanceReview = Database['public']['Tables']['performance_reviews']['Row'];

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

      // 🔀 Desvio Offline (Mock)
      if (USE_MOCK) {
        let data = mockDatabase.get('performance_reviews');

        // Injetando os dados de exemplo para demonstração do scroll
        if (!data || data.length === 0) {
          data = [
            {
              id: '1',
              employee_id: '00000000-0000-0000-0000-000000000001',
              reviewer_id: 'rev-jm',
              period: '05/2026',
              overall_score: 4.5,
              goals: [],
              competencies: [
                { name: 'Comunicação', score: 4 },
                { name: 'Trabalho em Equipe', score: 5 },
                { name: 'Proatividade', score: 4 },
                { name: 'Liderança', score: 5 },
              ],
              feedback: "Flávia é uma colaboradora muito simpática e competente no que faz. Embora faça parte da minha equipe, é alguém que percebo possuir algumas limitações de recursos",
              created_at: '2026-05-01T10:00:00Z',
              employee: { name: 'FLAVIA GEANE GOMES DE LIMA' },
              reviewer: { name: 'JESSICA MARQUES DE ARAUJO BARBOSA' }
            },
            {
              id: '2',
              employee_id: 'emp-ja',
              reviewer_id: 'rev-la',
              period: '05/2026',
              overall_score: 2.0,
              goals: [],
              competencies: [
                { name: 'Comunicação', score: 5 },
                { name: 'Trabalho em Equipe', score: 1 },
                { name: 'Proatividade', score: 1 },
                { name: 'Liderança', score: 1 },
              ],
              feedback: "PRECISA TER MAIS ATENÇÃO AO SEUS SETORES DE TRABALHO, DEIXANDO A DESEJAR NO QUE FAZ, E ESQUECER MAIS O CELULAR EM SEU SETOR DE TRABALHO.",
              created_at: '2026-05-02T10:00:00Z',
              employee: { name: 'JOSINEIDE ALVES DA CRUZ' },
              reviewer: { name: 'LUCAS DE AMORIM BATISTA' }
            },
            {
              id: '3',
              employee_id: 'emp-mb',
              reviewer_id: 'rev-jm',
              period: '05/2026',
              overall_score: 5.0,
              goals: [],
              competencies: [{ name: 'Comunicação', score: 5 }, { name: 'Trabalho em Equipe', score: 5 }, { name: 'Proatividade', score: 5 }, { name: 'Liderança', score: 5 }],
              feedback: "Bethânia é uma colaboradora que entrou na equipe de forma tímida e insegura, embora já trouxesse consigo uma vasta bagagem de experiência profissional.",
              created_at: '2026-05-03T10:00:00Z',
              employee: { name: 'MARIA BETHANIA ALBUQUERQUE BORGES' },
              reviewer: { name: 'JESSICA MARQUES DE ARAUJO BARBOSA' }
            }
          ];
        }

        const formatted: PerformanceReview[] = data.map((item: any) => ({
          ...item,
          employee_name: item.employee?.name || 'Desconhecido',
          reviewer_name: item.reviewer?.name || 'Desconhecido',
        }));
        formatted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        setReviews(formatted);
        setLoading(false);
        return;
      }

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
      const formattedReviews: PerformanceReview[] = (data as any[]).map((item) => ({
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
      // 🔀 Desvio Offline (Mock)
      if (USE_MOCK) {
        const emps = mockDatabase.get('employees');
        const empName = emps.find((e: any) => e.id === review.employee_id)?.name || 'Desconhecido';
        const revName = emps.find((e: any) => e.id === review.reviewer_id)?.name || 'Desconhecido';
        const newReview = {
          ...review,
          id: Date.now().toString(),
          created_at: new Date().toISOString(),
          employee: { name: empName },
          reviewer: { name: revName },
        };
        mockDatabase.add('performance_reviews', newReview);
        await fetchReviews();
        return { data: newReview, error: null };
      }

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
      // 🔀 Desvio Offline (Mock)
      if (USE_MOCK) {
        mockDatabase.remove('performance_reviews', id);
        setReviews(prev => prev.filter(r => r.id !== id));
        return { error: null };
      }

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