import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Employee } from '@/types/hr';
import { employees as mockEmployees } from '@/data/mockData';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { LogIn, LogOut } from 'lucide-react';

interface ClockEvent {
  id: string;
  employeeId: string;
  timestamp: string;
  type: 'in' | 'out';
}

export default function TimesheetPage() {
  const [employees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem('hr_employees');
    return saved ? JSON.parse(saved) : mockEmployees;
  });

  const [clockEvents, setClockEvents] = useState<ClockEvent[]>(() => {
    const saved = localStorage.getItem('hr_clock_events');
    return saved ? JSON.parse(saved) : [];
  });

  // Combine events with employee data
  const records = clockEvents
    .map(event => {
      const employee = employees.find(e => e.id === event.employeeId);
      return {
        ...event,
        employeeName: employee?.name || 'Desconhecido',
        employeeAvatar: employee?.avatar,
      };
    })
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <AppLayout title="Controle de Ponto" subtitle="Relatório de entradas e saídas dos colaboradores">
      <Card>
        <CardHeader>
          <CardTitle>Registros de Ponto</CardTitle>
          <CardDescription>Lista atualizada de todos os registros de ponto.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Colaborador</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Horário</TableHead>
                <TableHead>Tipo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.length > 0 ? (
                records.map(record => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">{record.employeeName}</TableCell>
                    <TableCell>
                      {format(parseISO(record.timestamp), 'dd/MM/yyyy', { locale: ptBR })}
                    </TableCell>
                    <TableCell>
                      {format(parseISO(record.timestamp), 'HH:mm:ss', { locale: ptBR })}
                    </TableCell>
                    <TableCell>
                      <Badge variant={record.type === 'in' ? 'success' : 'destructive'}>
                        {record.type === 'in' ? <LogIn className="mr-1 h-4 w-4" /> : <LogOut className="mr-1 h-4 w-4" />}
                        {record.type === 'in' ? 'Entrada' : 'Saída'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                    Nenhum registro de ponto encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AppLayout>
  );
}