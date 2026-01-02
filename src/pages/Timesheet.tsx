import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { LogIn, LogOut, Info } from 'lucide-react';
import { useEmployees } from '@/hooks/useEmployees';
import { useTimeEntries } from '@/hooks/useTimeEntries';

export default function TimesheetPage() {
  const { employees, loading: loadingEmployees } = useEmployees();
  const { entries: clockEvents, loading: loadingEntries } = useTimeEntries();
  
  const loading = loadingEmployees || loadingEntries;

  // Combine events with employee data
  const records = clockEvents
    .map(event => {
      const employee = employees.find(e => e.id === event.employee_id);
      return {
        ...event,
        employeeName: employee?.name || 'Desconhecido',
        employeeAvatar: employee?.avatar,
      };
    })
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <AppLayout title="Controle de Ponto" subtitle="Relatório de entradas e saídas dos colaboradores">
      <div className="space-y-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100">Como funciona o registro?</h4>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
              O controle de ponto é realizado pelos colaboradores através do terminal público (rota <Link to="/time-off" target="_blank" className="font-bold underline hover:text-blue-900 dark:hover:text-blue-100">/time-off</Link>). 
              Para registrar entrada ou saída, o colaborador deve selecionar seu perfil e digitar sua senha pessoal (PIN).
            </p>
          </div>
        </div>

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
                {loading ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-8">Carregando registros...</TableCell></TableRow>
                ) : records.length > 0 ? (
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
      </div>
    </AppLayout>
  );
}