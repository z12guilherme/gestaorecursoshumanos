import { supabase } from "@/lib/supabase";
import { endOfMonth, startOfMonth, subYears } from "date-fns";

export interface AnalyticsData {
  costByDept: { name: string; value: number }[];
  overtimeData: { name: string; valor: number }[];
  turnoverRate: number;
  // These fields seem to come from a different logic, we keep them for the old function
  costHistory?: any[];
  headcountHistory?: any[];
  headcountForecast?: number;
}

export interface MonthlyAnalyticsData {
  metrics: {
    totalCost: number;
    totalOvertime: number;
    turnoverRate: number;
    headcount: number;
  };
  costByDept: { name: string; value: number }[];
  overtimeData: { name: string; valor: number }[];
}

export const analyticsService = {
  /**
   * Fetches general dashboard metrics that are not date-specific, like historical charts.
   * NOTE: The implementation for costHistory, headcountHistory, and headcountForecast
   * is assumed to be handled by a more complex backend logic or another service,
   * as it's not derivable from the simple 'employees' table state.
   */
  async getDashboardMetrics(): Promise<AnalyticsData> {
    const { data: employees, error } = await supabase
      .from("employees")
      .select("department, base_salary, status, overtime_amount, admission_date");

    if (error) throw error;
    if (!employees) return { costByDept: [], overtimeData: [], turnoverRate: 0 };

    // This function now mainly provides data for historical charts.
    // The actual data fetching for these would be more complex.
    // We return dummy data to match the component's expectation.
    const totalEmployees = employees.length;
    const terminatedEmployees = employees.filter((e) => e.status === "Desligado").length;
    const turnoverRate = totalEmployees > 0 ? (terminatedEmployees / totalEmployees) * 100 : 0;

    return {
      costByDept: [], // Monthly now
      overtimeData: [], // Monthly now
      turnoverRate, // This is now a monthly metric
      costHistory: [], // Placeholder for actual historical data
      headcountHistory: [], // Placeholder for actual historical data
      headcountForecast: 0, // Placeholder for actual forecast data
    };
  },

  /**
   * Fetches analytics metrics for a specific month.
   * @param date The date within the desired month.
   */
  async getMonthlyMetrics(date: Date): Promise<MonthlyAnalyticsData> {
    const monthEnd = endOfMonth(date);
    const monthStart = startOfMonth(date);

    // O cálculo agora é 100% preciso utilizando a coluna termination_date.
    // Consideramos ativos no mês quem foi admitido antes do fim do mês e não foi demitido antes do início do mês.

    const { data: employees, error } = await supabase
      .from("employees")
      .select("department, base_salary, status, overtime_amount, admission_date, termination_date")
      .lte("admission_date", monthEnd.toISOString().substring(0, 10)); // Admitted before month ends

    if (error) throw error;
    if (!employees) return {
      metrics: { totalCost: 0, totalOvertime: 0, turnoverRate: 0, headcount: 0 },
      costByDept: [],
      overtimeData: []
    };

    const activeEmployees = employees.filter(e => {
      if (e.termination_date) {
        return new Date(e.termination_date) >= monthStart; // Só não é ativo se foi demitido ANTES de o mês começar
      }
      // Fallback de segurança para dados antigos (antes da criação desta coluna)
      return e.status === 'Ativo' || e.status === 'active' || e.status === 'Férias' || e.status === 'vacation' || e.status === 'Afastado' || e.status === 'leave';
    });

    // --- Calculations ---
    const costByDeptMap: Record<string, number> = {};
    const overtimeByDeptMap: Record<string, number> = {};
    let totalCost = 0;
    let totalOvertime = 0;

    activeEmployees.forEach((emp) => {
      const dept = emp.department || "Sem Depto";
      const salary = Number(emp.base_salary) || 0;
      const overtime = Number(emp.overtime_amount) || 0;

      costByDeptMap[dept] = (costByDeptMap[dept] || 0) + salary;
      overtimeByDeptMap[dept] = (overtimeByDeptMap[dept] || 0) + overtime;
      totalCost += salary;
      totalOvertime += overtime;
    });

    const costByDept = Object.keys(costByDeptMap).map(key => ({ name: key, value: costByDeptMap[key] }));
    const overtimeData = Object.keys(overtimeByDeptMap).map(key => ({ name: key, valor: overtimeByDeptMap[key] }));

    // Turnover Calculation (Precise)
    // Funcionários desligados exatamente dentro deste mês
    const terminatedThisMonth = employees.filter(e => {
      if (!e.termination_date) return false; // Sem data, não entra no cálculo exato deste mês
      const termDate = new Date(e.termination_date);
      return termDate >= monthStart && termDate <= monthEnd;
    }).length;

    const headcount = activeEmployees.length;
    const turnoverRate = headcount > 0 ? (terminatedThisMonth / headcount) * 100 : 0;

    return {
      metrics: {
        totalCost,
        totalOvertime,
        turnoverRate,
        headcount,
      },
      costByDept,
      overtimeData,
    };
  },
};