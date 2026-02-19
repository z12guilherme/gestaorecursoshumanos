import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Users, DollarSign, Clock } from "lucide-react";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"];

export function DashboardAnalytics() {
  const [costByDept, setCostByDept] = useState<any[]>([]);
  const [overtimeData, setOvertimeData] = useState<any[]>([]);
  const [turnoverRate, setTurnoverRate] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const { data: employees, error } = await supabase
        .from("employees")
        .select("department, salary, status, overtime_amount, admission_date");

      if (error) throw error;
      if (!employees) return;

      // 1. Custo de Folha por Departamento (Pizza)
      const deptMap: Record<string, number> = {};
      employees.forEach((emp) => {
        if (emp.status === "Ativo") {
          const dept = emp.department || "Sem Depto";
          const salary = Number(emp.salary) || 0;
          deptMap[dept] = (deptMap[dept] || 0) + salary;
        }
      });

      const pieData = Object.keys(deptMap).map((key) => ({
        name: key,
        value: deptMap[key],
      }));
      setCostByDept(pieData);

      // 2. Horas Extras (Barra) - Agrupado por Departamento (Simulação de "Por Mês" com dados atuais)
      // Nota: Para histórico mensal real, seria necessário consultar a tabela time_entries ou histórico de folha.
      // Aqui usamos o snapshot atual de overtime_amount.
      const overtimeMap: Record<string, number> = {};
      employees.forEach((emp) => {
        const dept = emp.department || "Geral";
        const overtime = Number(emp.overtime_amount) || 0;
        overtimeMap[dept] = (overtimeMap[dept] || 0) + overtime;
      });

      const barData = Object.keys(overtimeMap).map((key) => ({
        name: key,
        valor: overtimeMap[key],
      }));
      setOvertimeData(barData);

      // 3. KPI Turnover (Rotatividade)
      // Fórmula Simplificada: (Demitidos / Total Geral) * 100
      const totalEmployees = employees.length;
      const terminatedEmployees = employees.filter(e => e.status === "Desligado").length;
      const rate = totalEmployees > 0 ? (terminatedEmployees / totalEmployees) * 100 : 0;
      setTurnoverRate(rate);

    } catch (err) {
      console.error("Erro ao carregar analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-4">Carregando indicadores...</div>;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-4">
      
      {/* KPI Card */}
      <Card className="col-span-2 lg:col-span-7">
        <div className="grid gap-4 md:grid-cols-3">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Taxa de Turnover</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{turnoverRate.toFixed(1)}%</div>
                    <p className="text-xs text-muted-foreground">
                        Baseado no histórico total
                    </p>
                </CardContent>
            </Card>
            {/* Outros KPIs podem ser adicionados aqui */}
        </div>
      </Card>

      {/* Gráfico de Pizza - Custos */}
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Custo de Folha por Departamento</CardTitle>
        </CardHeader>
        <CardContent className="pl-2">
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={costByDept}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {costByDept.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `R$ ${Number(value).toLocaleString('pt-BR')}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Gráfico de Barras - Horas Extras */}
      <Card className="col-span-3">
        <CardHeader>
          <CardTitle>Custo de Horas Extras (Atual)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={overtimeData}>
                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `R$${value}`}
                />
                <Tooltip formatter={(value) => `R$ ${Number(value).toLocaleString('pt-BR')}`} cursor={{fill: 'transparent'}} />
                <Bar dataKey="valor" fill="#adfa1d" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}