import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { UserPlus, Calendar, Award, FileText, Clock } from 'lucide-react';

const activities = [
  {
    id: 1,
    type: 'hire',
    message: 'Camila Souza foi contratada como Designer',
    time: 'Há 2 horas',
    icon: UserPlus,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
  },
  {
    id: 2,
    type: 'vacation',
    message: 'Maria Oliveira solicitou férias',
    time: 'Há 4 horas',
    icon: Calendar,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
  },
  {
    id: 3,
    type: 'review',
    message: 'Avaliação de Carlos Santos concluída',
    time: 'Há 6 horas',
    icon: Award,
    color: 'text-amber-600',
    bgColor: 'bg-amber-100 dark:bg-amber-900/30',
  },
  {
    id: 4,
    type: 'document',
    message: 'Novo contrato anexado para Pedro Costa',
    time: 'Há 8 horas',
    icon: FileText,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30',
  },
  {
    id: 5,
    type: 'attendance',
    message: 'Alerta: 3 colaboradores com banco de horas negativo',
    time: 'Há 1 dia',
    icon: Clock,
    color: 'text-red-600',
    bgColor: 'bg-red-100 dark:bg-red-900/30',
  },
];

export function RecentActivity() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Atividades Recentes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start gap-3">
            <div className={`flex h-9 w-9 items-center justify-center rounded-full ${activity.bgColor}`}>
              <activity.icon className={`h-4 w-4 ${activity.color}`} />
            </div>
            <div className="flex-1 space-y-1">
              <p className="text-sm text-foreground leading-relaxed">{activity.message}</p>
              <p className="text-xs text-muted-foreground">{activity.time}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
