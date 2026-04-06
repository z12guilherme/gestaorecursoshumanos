import { useEffect, useState } from "react";
import { subMonths } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, LineChart, Line, ComposedChart, Area } from "recharts";
import { Users, TrendingUp, TrendingDown, ArrowRight, Bell, Send } from "lucide-react";
import { analyticsService } from "@/services/analyticsService";
import { MonthFilter } from "@/components/dashboard/MonthFilter";
import { calculateGrowth, formatCurrency, formatPercent } from "@/lib/analytics-utils";
import { Button } from "@/components/ui/button";
import { subscribeToPushNotifications } from "@/lib/push-notifications";
import { supabase } from "@/lib/supabase";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"];

interface MonthlyMetrics {
  totalCost: number;
  totalOvertime: number;
  turnoverRate: number;
  headcount: number;
}

export function DashboardAnalytics() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const [currentMetrics, setCurrentMetrics] = useState<MonthlyMetrics | null>(null);
  const [previousMetrics, setPreviousMetrics] = useState<MonthlyMetrics | null>(null);

  const [costByDept, setCostByDept] = useState<any[]>([]);
  const [overtimeData, setOvertimeData] = useState<any[]>([]);
  const [costHistory, setCostHistory] = useState<any[]>([]);
  const [headcountHistory, setHeadcountHistory] = useState<any[]>([]);
  const [forecast, setForecast] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics(currentDate);
  }, [currentDate]);

  const fetchAnalytics = async (date: Date) => {
    try {
      setLoading(true);
      const previousMonth = subMonths(date, 1);
      
      // Fetch data for both months
      const [currentData, previousData, historicalData] = await Promise.all([
        analyticsService.getMonthlyMetrics(date),
        analyticsService.getMonthlyMetrics(previousMonth),
        analyticsService.getDashboardMetrics(), // Assuming this gets general/historical data
      ]);
      
      setCurrentMetrics(currentData.metrics);
      setPreviousMetrics(previousData.metrics);
      setCostByDept(currentData.costByDept);
      setOvertimeData(currentData.overtimeData);

      // Keep historical data as is for now
      const data = historicalData;
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
  
  const totalCostGrowth = currentMetrics && previousMetrics ? calculateGrowth(currentMetrics.totalCost, previousMetrics.totalCost) : 0;
  const turnoverGrowth = currentMetrics && previousMetrics ? currentMetrics.turnoverRate - previousMetrics.turnoverRate : 0;

  const handleSubscribe = async () => {
    await subscribeToPushNotifications();
    alert("Permissão solicitada! Se aceita, você foi inscrito.");
  };

  const handleSendTest = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return alert("Usuário não logado");

    const { error } = await supabase.functions.invoke('send-notification', {
      body: {
        user_ids: [user.id],
        payload: {
          title: "Teste RH - Rede DMI 🚀",
          body: `Notificação enviada às ${new Date().toLocaleTimeString()}`
        }
      }
    });

    if (error) alert("Erro ao enviar: " + error.message);
    else alert("Notificação enviada! Verifique seu dispositivo.");
  };

  return (
    <div className="space-y-4 mt-4">
      <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold tracking-tight">Dashboard de Análise</h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={handleSubscribe} title="Ativar Notificações"><Bell className="h-4 w-4" /></Button>
            <Button variant="outline" size="icon" onClick={handleSendTest} title="Enviar Teste"><Send className="h-4 w-4" /></Button>
            <MonthFilter date={currentDate} setDate={setCurrentDate} />
          </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Custo Total da Folha</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(currentMetrics?.totalCost ?? 0)}</div>
                    <p className="text-xs text-muted-foreground flex items-center">
                      {totalCostGrowth >= 0 ? (
                        <TrendingUp className="h-4 w-4 mr-1 text-emerald-500" />
                      ) : (
                        <TrendingDown className="h-4 w-4 mr-1 text-red-500" />
                      )}
                      <span className={totalCostGrowth >= 0 ? 'text-emerald-500' : 'text-red-500'}>{formatPercent(totalCostGrowth)}</span>
                      &nbsp;vs. mês anterior
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Headcount Ativo</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{currentMetrics?.headcount ?? 0}</div>
                    <p className="text-xs text-muted-foreground">
                        {previousMetrics?.headcount ?? 0} no mês anterior
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Taxa de Turnover (Mensal)</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{(currentMetrics?.turnoverRate ?? 0).toFixed(1)}%</div>
                    <p className="text-xs text-muted-foreground flex items-center">
                      {turnoverGrowth > 0.09 ? ( <TrendingUp className="h-4 w-4 mr-1 text-red-500" /> ) : 
                       turnoverGrowth < -0.09 ? ( <TrendingDown className="h-4 w-4 mr-1 text-emerald-500" /> ) : 
                       ( <ArrowRight className="h-4 w-4 mr-1 text-muted-foreground" />)
                      }
                      {turnoverGrowth.toFixed(1)} p.p. vs. mês anterior
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Previsão Headcount</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{forecast}</div>
                    <p className="text-xs text-muted-foreground">Estimativa para o próximo mês</p>
                </CardContent>
            </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
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
      <Card className="col-span-4 lg:col-span-7">
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
    </div>
  );
}