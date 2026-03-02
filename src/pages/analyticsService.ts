import { supabase } from "@/lib/supabase";

export interface AnalyticsData {
  costByDept: { name: string; value: number }[];
  overtimeData: { name: string; valor: number }[];
  turnoverRate: number;
}

export const analyticsService = {
  async getDashboardMetrics(): Promise<AnalyticsData> {
    const { data: employees, error } = await supabase
      .from("employees")
      .select("department, salary, status, overtime_amount, admission_date");

    if (error) throw error;
    if (!employees) return { costByDept: [], overtimeData: [], turnoverRate: 0 };

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

    return { costByDept, overtimeData, turnoverRate };
  },
};