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
      .select("department, salary, status, overtime_amount, admission_date");

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

    // To get historical state, we need to query based on admission and termination dates.
    // Since we don't have termination_date, we make an approximation:
    // - Active employees are those with status 'Ativo' admitted before the end of the month.
    // - Terminated employees for turnover calculation are those with status 'Desligado'
    //   who were admitted in the last year, to simulate a rolling turnover.
    // A proper implementation would require a `termination_date` column or use of an audit log.

    const { data: employees, error } = await supabase
      .from("employees")
      .select("department, salary, status, overtime_amount, admission_date")
      .lte("admission_date", monthEnd.toISOString().substring(0, 10)); // Admitted before month ends

    if (error) throw error;
    if (!employees) return { 
      metrics: { totalCost: 0, totalOvertime: 0, turnoverRate: 0, headcount: 0 },
      costByDept: [], 
      overtimeData: [] 
    };

    // For a given month, we consider employees who were 'Ativo' at any point during it.
    // Without termination dates, we can only reliably calculate for the *current* month from the 'Ativo' status.
    // For past months, this logic is an approximation. We assume 'Ativo' means they were active.
    const activeEmployees = employees.filter(e => e.status === 'Ativo');

    // --- Calculations ---
    const costByDeptMap: Record<string, number> = {};
    const overtimeByDeptMap: Record<string, number> = {};
    let totalCost = 0;
    let totalOvertime = 0;

    activeEmployees.forEach((emp) => {
      const dept = emp.department || "Sem Depto";
      const salary = Number(emp.salary) || 0;
      const overtime = Number(emp.overtime_amount) || 0;

      costByDeptMap[dept] = (costByDeptMap[dept] || 0) + salary;
      overtimeByDeptMap[dept] = (overtimeByDeptMap[dept] || 0) + overtime;
      totalCost += salary;
      totalOvertime += overtime;
    });

    const costByDept = Object.keys(costByDeptMap).map(key => ({ name: key, value: costByDeptMap[key] }));
    const overtimeData = Object.keys(overtimeByDeptMap).map(key => ({ name: key, valor: overtimeByDeptMap[key] }));

    // Turnover Calculation (Approximation)
    // Employees terminated within the month. We can't know this for sure.
    // Let's calculate a rolling 12-month turnover rate up to the given date for simplicity.
    const oneYearBefore = subYears(date, 1);
    const recentHires = employees.filter(e => new Date(e.admission_date) >= oneYearBefore);
    const recentTerminations = recentHires.filter(e => e.status === 'Desligado').length;
    const avgHeadcount = (employees.length + recentHires.length) / 2; // very rough avg
    const turnoverRate = avgHeadcount > 0 ? (recentTerminations / avgHeadcount) * 100 : 0;

    return {
      metrics: {
        totalCost,
        totalOvertime,
        turnoverRate,
        headcount: activeEmployees.length,
      },
      costByDept,
      overtimeData,
    };
  },
};