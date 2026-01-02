import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { month: 'Jan', contratados: 4, desligados: 2 },
  { month: 'Fev', contratados: 6, desligados: 1 },
  { month: 'Mar', contratados: 3, desligados: 3 },
  { month: 'Abr', contratados: 8, desligados: 2 },
  { month: 'Mai', contratados: 5, desligados: 4 },
  { month: 'Jun', contratados: 7, desligados: 1 },
  { month: 'Jul', contratados: 4, desligados: 2 },
  { month: 'Ago', contratados: 9, desligados: 3 },
  { month: 'Set', contratados: 6, desligados: 2 },
  { month: 'Out', contratados: 5, desligados: 1 },
  { month: 'Nov', contratados: 7, desligados: 2 },
  { month: 'Dez', contratados: 4, desligados: 1 },
];

export function HiringTrendChart() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Contratações vs Desligamentos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorContratados" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorDesligados" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="month" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  color: 'hsl(var(--foreground))'
                }}
              />
              <Area
                type="monotone"
                dataKey="contratados"
                stroke="hsl(var(--chart-1))"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorContratados)"
                name="Contratados"
              />
              <Area
                type="monotone"
                dataKey="desligados"
                stroke="hsl(var(--destructive))"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorDesligados)"
                name="Desligados"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
