import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, LineChart, Line, ComposedChart, Area } from "recharts";
import { Users, DollarSign, Clock, TrendingUp } from "lucide-react";
import { analyticsService } from "@/services/analyticsService";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"];

export function DashboardAnalytics() {
  const [costByDept, setCostByDept] = useState<any[]>([]);
  const [overtimeData, setOvertimeData] = useState<any[]>([]);
  const [turnoverRate, setTurnoverRate] = useState(0);
  const [costHistory, setCostHistory] = useState<any[]>([]);
  const [headcountHistory, setHeadcountHistory] = useState<any[]>([]);
  const [forecast, setForecast] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const data = await analyticsService.getDashboardMetrics();
      
      setCostByDept(data.costByDept);
      setOvertimeData(data.overtimeData);
      setTurnoverRate(data.turnoverRate);
      setCostHistory(data.costHistory);
      setHeadcountHistory(data.headcountHistory);
      setForecast(data.headcountForecast);
      
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
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Previsão Headcount (Próx. Mês)</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{forecast}</div>
                    <p className="text-xs text-muted-foreground">Baseado na média recente</p>
                </CardContent>
            </Card>
        </div>
      </Card>

      {/* Gráfico de Pizza - Custos */}
      <Card className="col-span-4 lg:col-span-3">
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

      {/* Gráfico de Linha - Evolução */}
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Evolução do Custo de Folha (6 Meses)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={costHistory}>
                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `R$${value/1000}k`} />
                <Tooltip formatter={(value) => `R$ ${Number(value).toLocaleString('pt-BR')}`} />
                <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Gráfico Composto - Crescimento */}
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Crescimento de Colaboradores (Admissões vs Total)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={headcountHistory}>
                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis yAxisId="left" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis yAxisId="right" orientation="right" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip />
                <Legend />
                <Bar yAxisId="right" dataKey="admissions" name="Novas Admissões" fill="#3b82f6" barSize={20} radius={[4, 4, 0, 0]} />
                <Line yAxisId="left" type="monotone" dataKey="total" name="Total Ativos" stroke="#10b981" strokeWidth={2} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Gráfico de Barras - Horas Extras */}
      <Card className="col-span-3 lg:col-span-7">
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