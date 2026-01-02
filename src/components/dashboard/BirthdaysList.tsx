import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Cake } from 'lucide-react';

const birthdays = [
  { id: 1, name: 'Carlos Santos', date: '10 Jan', department: 'Tecnologia' },
  { id: 2, name: 'Ana Lima', date: '15 Jan', department: 'Marketing' },
  { id: 3, name: 'Roberto Silva', date: '18 Jan', department: 'Financeiro' },
  { id: 4, name: 'Fernanda Costa', date: '22 Jan', department: 'RH' },
  { id: 5, name: 'Lucas Oliveira', date: '28 Jan', department: 'Comercial' },
];

export function BirthdaysList() {
  return (
    <Card className="h-full">
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base font-semibold">Aniversariantes do Mês</CardTitle>
        <Cake className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent className="space-y-3">
        {birthdays.map((person) => (
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
            <span className="text-sm font-medium text-primary">{person.date}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
