import { describe, it, expect, vi, beforeEach } from 'vitest';
import { analyticsService } from './analyticsService';
import { supabase } from '@/lib/supabase';

// Mock do cliente Supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(),
    })),
  },
}));

describe('analyticsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve calcular métricas do dashboard corretamente', async () => {
    // Dados simulados com admission_date para não quebrar a lógica de tempo
    const mockEmployees = [
      { department: 'TI', base_salary: 5000, status: 'Ativo', overtime_amount: 100, admission_date: '2023-01-01' },
      { department: 'RH', base_salary: 4000, status: 'Ativo', overtime_amount: 0, admission_date: '2023-06-01' },
      { department: 'TI', base_salary: 0, status: 'Desligado', overtime_amount: 0, admission_date: '2023-01-01' },
    ];

    // Configura o mock para suportar o encadeamento .select().lte() que ocorre na busca por data
    const lteMock = vi.fn().mockResolvedValue({ data: mockEmployees, error: null });
    const selectMock = vi.fn().mockReturnValue({ lte: lteMock });
    (supabase.from as any).mockReturnValue({ select: selectMock });

    // Agora testamos o método que de fato possui a lógica dos departamentos:
    const result = await analyticsService.getMonthlyMetrics(new Date('2024-01-15'));

    // 1. Verifica Custo por Departamento (apenas ativos)
    expect(result.costByDept).toEqual([
      { name: 'TI', value: 5000 },
      { name: 'RH', value: 4000 },
    ]);

    // 2. Verifica Horas Extras (todos)
    const itOvertime = result.overtimeData.find(d => d.name === 'TI');
    expect(itOvertime?.valor).toBe(100);

    // 3. Verifica Métricas Gerais
    expect(result.metrics.totalCost).toBe(9000);
    expect(result.metrics.totalOvertime).toBe(100);
  });
});