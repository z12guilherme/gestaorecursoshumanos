import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useTimeOff } from "@/hooks/useTimeOff";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

export function TimeOffReport() {
  const { requests } = useTimeOff();

  const typeData = requests.reduce((acc: Record<string, number>, curr) => {
    const type = curr.type === 'vacation' ? 'Férias' : 
                 curr.type === 'sick_leave' ? 'Atestado' : 
                 curr.type === 'personal' ? 'Pessoal' : curr.type;
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  const chartData = Object.entries(typeData).map(([name, value]) => ({ name, value }));
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Tipos de Ausência</CardTitle>
          <CardDescription>Distribuição por motivo</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie 
                data={chartData} 
                dataKey="value" 
                nameKey="name" 
                cx="50%" 
                cy="50%" 
                innerRadius={60} 
                outerRadius={80} 
                paddingAngle={5}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
            <CardTitle>Solicitações Pendentes</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="text-4xl font-bold text-amber-500">
                {requests.filter(r => r.status === 'pending').length}
            </div>
            <p className="text-muted-foreground mt-2">Aguardando aprovação do gestor.</p>
        </CardContent>
      </Card>
    </div>
  );
}