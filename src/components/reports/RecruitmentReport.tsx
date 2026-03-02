import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useRecruitment } from "@/hooks/useRecruitment";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

export function RecruitmentReport() {
  const { candidates, jobs } = useRecruitment();

  // Funil de Candidatos
  const funnelData = [
    { name: 'Inscritos', value: candidates.length, fill: '#3b82f6' },
    { name: 'Entrevista', value: candidates.filter(c => c.status === 'Interview' || c.status === 'Entrevista').length, fill: '#8b5cf6' },
    { name: 'Oferta', value: candidates.filter(c => c.status === 'Offer' || c.status === 'Oferta').length, fill: '#a855f7' },
    { name: 'Contratados', value: candidates.filter(c => c.status === 'Hired' || c.status === 'Contratado').length, fill: '#10b981' },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Funil de Recrutamento</CardTitle>
          <CardDescription>Conversão de candidatos por etapa</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={funnelData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={100} />
              <Tooltip cursor={{fill: 'transparent'}} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {funnelData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-2 gap-4 col-span-2">
        <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Vagas Abertas</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">{jobs.filter(j => j.status === 'Open' || j.status === 'Aberta').length}</div></CardContent>
        </Card>
        <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total de Candidatos</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">{candidates.length}</div></CardContent>
        </Card>
      </div>
    </div>
  );
}