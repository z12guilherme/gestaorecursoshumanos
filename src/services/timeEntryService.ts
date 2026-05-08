import { supabase } from "@/lib/supabase";
import { mockDatabase, USE_MOCK } from "@/lib/mockDatabase";

export interface TimeEntry {
  id: string;
  timestamp: string;
  type: 'in' | 'out' | 'lunch_start' | 'lunch_end';
  employee_id?: string;
  latitude?: number;
  longitude?: number;
  notes?: string;
  employees?: { name: string; department?: string } | null;
}

const getMockData = (): TimeEntry[] => {
  return mockDatabase.get('time_entries');
};

export const timeEntryService = {
  /**
   * Busca registros de ponto com paginação para a listagem (Alta performance).
   * Agora suporta um intervalo de datas (startDate até endDate).
   */
  async getEntries(page: number = 1, pageSize: number = 50, startDate: string, endDate?: string, employeeId?: string | null) {
    if (USE_MOCK) {
      let data = getMockData();
      const finalDate = endDate || startDate;
      data = data.filter(d => d.timestamp >= `${startDate}T00:00:00.000Z` && d.timestamp <= `${finalDate}T23:59:59.999Z`);
      if (employeeId) data = data.filter(d => d.employee_id === employeeId);
      data.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      const from = (page - 1) * pageSize;
      return { data: data.slice(from, from + pageSize), count: data.length };
    }

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const finalDate = endDate || startDate;
    let query = supabase
      .from('time_entries')
      .select('id, timestamp, type, employee_id, latitude, longitude, notes, employees(name, department)', { count: 'exact' })
      .gte('timestamp', `${startDate}T00:00:00.000Z`)
      .lte('timestamp', `${finalDate}T23:59:59.999Z`)
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
    if (USE_MOCK) {
      return getMockData().filter(d => d.timestamp.startsWith(date));
    }

    const { data, error } = await supabase
      .from('time_entries')
      .select('id, timestamp, type, employee_id, employees(name, department)') // Apenas o essencial, sem joins pesados ou GPS
      .gte('timestamp', `${date}T00:00:00.000Z`)
      .lte('timestamp', `${date}T23:59:59.999Z`);

    if (error) throw error;
    return data as TimeEntry[];
  },

  /**
   * Busca registros de um período completo (Útil para o Heatmap Semanal).
   */
  async getPeriodEntries(startDate: string, endDate: string) {
    if (USE_MOCK) {
      return getMockData().filter(d => d.timestamp >= `${startDate}T00:00:00.000Z` && d.timestamp <= `${endDate}T23:59:59.999Z`);
    }

    const { data, error } = await supabase
      .from('time_entries')
      .select('id, timestamp, type, employee_id, employees(name, department)')
      .gte('timestamp', `${startDate}T00:00:00.000Z`)
      .lte('timestamp', `${endDate}T23:59:59.999Z`);

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
  },

  /**
   * Agrupa os registros de ponto pelo departamento do funcionário.
   */
  groupEntriesByDepartment(entries: TimeEntry[]): Record<string, TimeEntry[]> {
    return entries.reduce((acc, entry) => {
      const dept = entry.employees?.department || 'Sem Departamento';
      if (!acc[dept]) {
        acc[dept] = [];
      }
      acc[dept].push(entry);
      return acc;
    }, {} as Record<string, TimeEntry[]>);
  },

  /**
   * Analisa as entradas de um dia ou período e identifica divergências.
   * Útil para o Painel de Exceções do Gestor.
   */
  findAnomalies(entries: TimeEntry[]): { employeeId: string; name: string; department: string; issue: string; date: string }[] {
    // Agrupa por Funcionário E por Dia (ex: "ID_2026-05-08")
    const grouped = entries.reduce((acc, entry) => {
      const dateObj = new Date(entry.timestamp);
      const dateKey = `${entry.employee_id}_${dateObj.toISOString().split('T')[0]}`;

      if (!acc[dateKey]) {
        acc[dateKey] = { employeeId: entry.employee_id || '', name: entry.employees?.name || 'Desconhecido', department: entry.employees?.department || 'Sem Departamento', entries: [], date: dateObj.toLocaleDateString() };
      }
      acc[dateKey].entries.push(entry);
      return acc;
    }, {} as Record<string, { employeeId: string, name: string, department: string, entries: TimeEntry[], date: string }>);

    const anomalies = [];
    for (const data of Object.values(grouped)) {
      // Regra de negócio simples: Número ímpar de batidas no dia indica que uma entrada ou saída foi esquecida
      if (data.entries.length % 2 !== 0) {
        anomalies.push({ employeeId: data.employeeId, name: data.name, department: data.department, date: data.date, issue: 'Batida incompleta (número ímpar de registros)' });
      }
    }
    return anomalies;
  }
};
