import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Cake } from 'lucide-react';
import { format, parseISO, getMonth, getDate } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Employee {
  id: string;
  name: string;
  department: string;
  birth_date?: string;
  avatar_url?: string;
}

interface BirthdaysListProps {
  employees: Employee[];
}

export function BirthdaysList({ employees = [] }: BirthdaysListProps) {
  const currentMonth = new Date().getMonth();

  const birthdays = employees
    .filter(e => e.birth_date && getMonth(parseISO(e.birth_date)) === currentMonth)
    .sort((a, b) => getDate(parseISO(a.birth_date!)) - getDate(parseISO(b.birth_date!)));

  return (
    <Card className="h-full">
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base font-semibold">Aniversariantes do Mês</CardTitle>
        <Cake className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent className="space-y-3">
        {birthdays.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">Nenhum aniversariante este mês.</p>
        ) : (
          birthdays.map((person) => (
          <div key={person.id} className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-primary/10 text-primary text-sm">
                {person.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{person.name}</p>
              <p className="text-xs text-muted-foreground">{person.department}</p>
            </div>
            <span className="text-sm font-medium text-primary">{person.birth_date && format(parseISO(person.birth_date), 'dd MMM', { locale: ptBR })}</span>
          </div>
        )))}
      </CardContent>
    </Card>
  );
}
