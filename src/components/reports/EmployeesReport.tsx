import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useEmployees } from "@/hooks/useEmployees";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

export function EmployeesReport() {
  const { employees } = useEmployees();

  // 1. Distribuição por Departamento
  const deptData = employees.reduce((acc: Record<string, number>, curr) => {
    const dept = curr.department || 'Sem Depto';
    acc[dept] = (acc[dept] || 0) + 1;
    return acc;
  }, {});

  const pieData = Object.entries(deptData).map(([name, value]) => ({ name, value }));
  
  // 2. Status dos Colaboradores
  const statusData = employees.reduce((acc: Record<string, number>, curr) => {
    let status = curr.status || 'Indefinido';

    // Traduz status para português se estiver em inglês
    if (status === 'active') status = 'Ativo';
    if (status === 'terminated') status = 'Desligado';
    if (status === 'vacation') status = 'Férias';
    if (status === 'leave') status = 'Afastado';

    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  const barData = Object.entries(statusData).map(([name, value]) => ({ name, value }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Colaboradores por Departamento</CardTitle>
          <CardDescription>Distribuição da força de trabalho</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie 
                data={pieData} 
                dataKey="value" 
                nameKey="name" 
                cx="50%" 
                cy="50%" 
                outerRadius={80} 
                label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {pieData.map((entry, index) => (
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
          <CardTitle>Status dos Contratos</CardTitle>
          <CardDescription>Ativos vs Desligados vs Férias</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" name="Qtd" fill="#8884d8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}