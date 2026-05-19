import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const data = [
  { name: 'Administrativo', value: 10, color: 'hsl(var(--chart-1))' },
  { name: 'Central de Marcação', value: 15, color: 'hsl(var(--chart-2))' },
  { name: 'Coordenação', value: 10, color: 'hsl(var(--chart-3))' },
  { name: 'Enfermagem', value: 30, color: 'hsl(var(--chart-4))' },
  { name: 'Farmácia', value: 12, color: 'hsl(var(--chart-5))' },
  { name: 'Faturamento', value: 8, color: 'hsl(var(--primary))' },
  { name: 'Financeiro', value: 10, color: 'hsl(var(--chart-1))' },
  { name: 'Higienização', value: 15, color: 'hsl(var(--chart-2))' },
  { name: 'Laboratório', value: 12, color: 'hsl(var(--chart-3))' },
  { name: 'Lavanderia', value: 8, color: 'hsl(var(--chart-4))' },
  { name: 'Manutenção', value: 10, color: 'hsl(var(--chart-5))' },
  { name: 'Marketing', value: 5, color: 'hsl(var(--primary))' },
  { name: 'Nutrição', value: 10, color: 'hsl(var(--chart-1))' },
  { name: 'Radiologia', value: 14, color: 'hsl(var(--chart-2))' },
  { name: 'Recepção Ambulatorial', value: 12, color: 'hsl(var(--chart-3))' },
  { name: 'Recepção Urgência', value: 15, color: 'hsl(var(--chart-4))' },
  { name: 'Recursos Humanos / Departamento Pessoal', value: 8, color: 'hsl(var(--chart-5))' },
  { name: 'Remoção', value: 5, color: 'hsl(var(--primary))' },
  { name: 'TI', value: 12, color: 'hsl(var(--chart-1))' },
];

export function DepartmentChart() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Colaboradores por Departamento</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  color: 'hsl(var(--foreground))'
                }}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value) => <span className="text-sm text-foreground">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
