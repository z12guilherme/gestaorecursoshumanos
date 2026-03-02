import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { usePerformance } from "@/hooks/usePerformance";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from "recharts";

export function PerformanceReport() {
  const { reviews } = usePerformance();

  // Simulação de média de competências (já que o hook pode retornar dados complexos)
  const mockCompetencyData = [
    { subject: 'Técnica', A: 120, fullMark: 150 },
    { subject: 'Comunicação', A: 98, fullMark: 150 },
    { subject: 'Prazos', A: 86, fullMark: 150 },
    { subject: 'Trabalho em Equipe', A: 99, fullMark: 150 },
    { subject: 'Liderança', A: 85, fullMark: 150 },
    { subject: 'Proatividade', A: 65, fullMark: 150 },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Média de Competências (Geral)</CardTitle>
          <CardDescription>Pontuação média da empresa por competência</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={mockCompetencyData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" />
              <PolarRadiusAxis angle={30} domain={[0, 150]} />
              <Radar name="Empresa" dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
            <CardTitle>Resumo de Avaliações</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="space-y-4">
                <div className="flex justify-between items-center border-b pb-2">
                    <span>Total de Avaliações</span>
                    <span className="font-bold">{reviews.length}</span>
                </div>
                <div className="flex justify-between items-center border-b pb-2">
                    <span>Média Geral</span>
                    <span className="font-bold text-emerald-600">4.2/5.0</span>
                </div>
                <div className="flex justify-between items-center border-b pb-2">
                    <span>Ciclo Atual</span>
                    <span className="font-bold">2024.1</span>
                </div>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}