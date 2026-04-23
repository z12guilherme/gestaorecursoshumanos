import { supabase } from "@/lib/supabase";

export interface TimeEntry {
  id: string;
  timestamp: string;
  type: 'in' | 'out' | 'lunch_start' | 'lunch_end';
  employee_id?: string;
  latitude?: number;
  longitude?: number;
  notes?: string;
  employees?: { name: string } | null;
}

export const timeEntryService = {
  /**
   * Busca registros de ponto com paginação para a listagem (Alta performance).
   */
  async getEntries(page: number = 1, pageSize: number = 50, date: string, employeeId?: string | null) {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from('time_entries')
      .select('id, timestamp, type, employee_id, latitude, longitude, notes, employees(name)', { count: 'exact' })
      .gte('timestamp', `${date}T00:00:00.000Z`)
      .lte('timestamp', `${date}T23:59:59.999Z`)
      .order('timestamp', { ascending: false })
      .range(from, to);

    if (employeeId) {
      query = query.eq('employee_id', employeeId);
    }

    const { data, error, count } = await query;
    if (error) throw error;

    return {
      data: data as TimeEntry[],
      count: count || 0
    };
  },

  /**
   * Busca uma versão leve dos registros do dia apenas para calcular totais e presenças.
   */
  async getDailyEntriesForSummary(date: string) {
    const { data, error } = await supabase
      .from('time_entries')
      .select('id, timestamp, type, employee_id') // Apenas o essencial, sem joins pesados ou GPS
      .gte('timestamp', `${date}T00:00:00.000Z`)
      .lte('timestamp', `${date}T23:59:59.999Z`);

    if (error) throw error;
    return data as TimeEntry[];
  },

  /**
   * Calcula o total de horas trabalhadas no dia com base nas entradas.
   * Considera pares: (Entrada -> Saída) ou (Entrada -> Almoço) + (Volta Almoço -> Saída)
   */
  calculateDailyHours(entries: TimeEntry[]): string {
    const sorted = [...entries].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    let totalMs = 0;
    let lastInTime: number | null = null;

    sorted.forEach(entry => {
      const time = new Date(entry.timestamp).getTime();
      if (entry.type === 'in' || entry.type === 'lunch_end') {
        if (lastInTime === null) lastInTime = time;
      } else if (entry.type === 'out' || entry.type === 'lunch_start') {
        if (lastInTime !== null) {
          totalMs += time - lastInTime;
          lastInTime = null;
        }
      }
    });

    const totalMinutes = Math.floor(totalMs / 60000);
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;

    if (h === 0 && m === 0) return '-';
    return `${h}h ${m}m`;
  },

  /**
   * Determina o status atual do funcionário com base no último registro.
   */
  getLastStatus(entries: TimeEntry[]): 'working' | 'lunch' | 'finished' | 'not_started' {
    if (!entries || entries.length === 0) return 'not_started';

    const sorted = [...entries].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    const lastEntry = sorted[sorted.length - 1];

    switch (lastEntry.type) {
      case 'in':
      case 'lunch_end':
        return 'working';
      case 'lunch_start':
        return 'lunch';
      case 'out':
        return 'finished';
      default:
        return 'not_started';
    }
  }
};
