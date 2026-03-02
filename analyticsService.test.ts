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
    // Dados simulados
    const mockEmployees = [
      { department: 'TI', salary: 5000, status: 'Ativo', overtime_amount: 100 },
      { department: 'RH', salary: 4000, status: 'Ativo', overtime_amount: 0 },
      { department: 'TI', salary: 0, status: 'Desligado', overtime_amount: 0 },
    ];

    // Configura o mock para retornar os dados simulados
    const selectMock = vi.fn().mockResolvedValue({ data: mockEmployees, error: null });
    (supabase.from as any).mockReturnValue({ select: selectMock });

    const result = await analyticsService.getDashboardMetrics();

    // 1. Verifica Turnover: 1 desligado / 3 total = 33.33%
    expect(result.turnoverRate).toBeCloseTo(33.33);

    // 2. Verifica Custo por Departamento (apenas ativos)
    expect(result.costByDept).toEqual([
      { name: 'TI', value: 5000 },
      { name: 'RH', value: 4000 },
    ]);

    // 3. Verifica Horas Extras (todos)
    const itOvertime = result.overtimeData.find(d => d.name === 'TI');
    expect(itOvertime?.valor).toBe(100);
  });
});