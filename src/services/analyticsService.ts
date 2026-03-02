import { supabase } from "@/lib/supabase";

export interface AnalyticsData {
  costByDept: { name: string; value: number }[];
  overtimeData: { name: string; valor: number }[];
  turnoverRate: number;
  costHistory: { name: string; value: number }[];
  headcountHistory: { name: string; admissions: number; total: number }[];
  headcountForecast: number;
}

export const analyticsService = {
  async getDashboardMetrics(): Promise<AnalyticsData> {
    const { data: employees, error } = await supabase
      .from("employees")
      .select("department, salary, status, overtime_amount, admission_date");

    if (error) throw error;
    if (!employees) return { costByDept: [], overtimeData: [], turnoverRate: 0, costHistory: [], headcountHistory: [], headcountForecast: 0 };

    // 1. Custo de Folha por Departamento
    const deptMap: Record<string, number> = {};
    employees.forEach((emp) => {
      if (emp.status === "Ativo") {
        const dept = emp.department || "Sem Depto";
        const salary = Number(emp.salary) || 0;
        deptMap[dept] = (deptMap[dept] || 0) + salary;
      }
    });

    const costByDept = Object.keys(deptMap).map((key) => ({
      name: key,
      value: deptMap[key],
    }));

    // 2. Horas Extras
    const overtimeMap: Record<string, number> = {};
    employees.forEach((emp) => {
      const dept = emp.department || "Geral";
      const overtime = Number(emp.overtime_amount) || 0;
      overtimeMap[dept] = (overtimeMap[dept] || 0) + overtime;
    });

    const overtimeData = Object.keys(overtimeMap).map((key) => ({
      name: key,
      valor: overtimeMap[key],
    }));

    // 3. KPI Turnover
    const totalEmployees = employees.length;
    const terminatedEmployees = employees.filter((e) => e.status === "Desligado").length;
    const turnoverRate = totalEmployees > 0 ? (terminatedEmployees / totalEmployees) * 100 : 0;

    // 4. Evolução do Custo (Últimos 6 meses - Simulado baseada na admissão)
    const costHistory = [];
    const headcountHistory = [];
    const today = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthName = d.toLocaleString('pt-BR', { month: 'short' }).toUpperCase();
      
      // Soma salários de quem foi admitido antes do fim deste mês
      const totalSalary = employees.reduce((acc, emp) => {
        const admDate = new Date(emp.admission_date);
        // Se foi admitido antes ou durante este mês, conta no custo
        if (admDate <= new Date(today.getFullYear(), today.getMonth() - i + 1, 0)) {
             return acc + (Number(emp.salary) || 0);
        }
        return acc;
      }, 0);
      
      costHistory.push({ name: monthName, value: totalSalary });

      // 5. Histórico de Headcount e Admissões
      const monthStart = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthEnd = new Date(today.getFullYear(), today.getMonth() - i + 1, 0);

      const activeInMonth = employees.filter(e => {
        const admDate = new Date(e.admission_date);
        return admDate <= monthEnd && (e.status === 'Ativo' || e.status === 'active');
      }).length;

      const admissionsInMonth = employees.filter(e => {
        const admDate = new Date(e.admission_date);
        return admDate >= monthStart && admDate <= monthEnd;
      }).length;

      headcountHistory.push({ name: monthName, admissions: admissionsInMonth, total: activeInMonth });
    }

    // 6. Previsão Simples (Média de crescimento dos últimos 3 meses adicionada ao total atual)
    const recentGrowth = headcountHistory.slice(-3).reduce((acc, curr) => acc + curr.admissions, 0) / 3;
    const headcountForecast = Math.round(headcountHistory[headcountHistory.length - 1].total + recentGrowth);

    return { costByDept, overtimeData, turnoverRate, costHistory, headcountHistory, headcountForecast };
  },
};