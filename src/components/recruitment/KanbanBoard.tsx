import { useState } from 'react';
import { Candidate } from '@/types/hr';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Star, Mail, Phone, ChevronRight, ChevronLeft } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface KanbanBoardProps {
  candidates: Candidate[];
  onMoveCandidate: (candidateId: string, newStatus: Candidate['status']) => void;
}

const columns: { id: Candidate['status']; title: string; color: string }[] = [
  { id: 'applied', title: 'Inscritos', color: 'bg-slate-100 dark:bg-slate-800' },
  { id: 'screening', title: 'Triagem', color: 'bg-blue-50 dark:bg-blue-900/20' },
  { id: 'interview', title: 'Entrevista', color: 'bg-amber-50 dark:bg-amber-900/20' },
  { id: 'approved', title: 'Aprovados', color: 'bg-emerald-50 dark:bg-emerald-900/20' },
  { id: 'rejected', title: 'Reprovados', color: 'bg-red-50 dark:bg-red-900/20' },
];

export function KanbanBoard({ candidates, onMoveCandidate }: KanbanBoardProps) {
  const getColumnCandidates = (status: Candidate['status']) => 
    candidates.filter(c => c.status === status);

  const getNextStatus = (current: Candidate['status']): Candidate['status'] | null => {
    const order: Candidate['status'][] = ['applied', 'screening', 'interview', 'approved'];
    const currentIndex = order.indexOf(current);
    return currentIndex < order.length - 1 ? order[currentIndex + 1] : null;
  };

  const getPrevStatus = (current: Candidate['status']): Candidate['status'] | null => {
    const order: Candidate['status'][] = ['applied', 'screening', 'interview', 'approved'];
    const currentIndex = order.indexOf(current);
    return currentIndex > 0 ? order[currentIndex - 1] : null;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {columns.map((column) => {
        const columnCandidates = getColumnCandidates(column.id);
        return (
          <div key={column.id} className={cn('rounded-xl p-4 min-h-[500px]', column.color)}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">{column.title}</h3>
              <Badge variant="secondary" className="rounded-full">
                {columnCandidates.length}
              </Badge>
            </div>
            
            <div className="space-y-3">
              {columnCandidates.map((candidate) => (
                <Card key={candidate.id} className="shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary/10 text-primary text-sm">
                            {candidate.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm text-foreground">{candidate.name}</p>
                          <p className="text-xs text-muted-foreground">{candidate.position}</p>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Mail className="mr-2 h-4 w-4" />
                            Enviar email
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Phone className="mr-2 h-4 w-4" />
                            Ligar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {candidate.rating && (
                      <div className="flex items-center gap-1 mb-3">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              'h-4 w-4',
                              i < candidate.rating! 
                                ? 'fill-amber-400 text-amber-400' 
                                : 'text-muted-foreground/30'
                            )}
                          />
                        ))}
                      </div>
                    )}

                    {candidate.notes && (
                      <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                        {candidate.notes}
                      </p>
                    )}

                    <div className="flex items-center justify-between gap-2">
                      {getPrevStatus(candidate.status) && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 text-xs"
                          onClick={() => onMoveCandidate(candidate.id, getPrevStatus(candidate.status)!)}
                        >
                          <ChevronLeft className="h-3 w-3 mr-1" />
                          Voltar
                        </Button>
                      )}
                      {getNextStatus(candidate.status) && (
                        <Button
                          size="sm"
                          className="flex-1 text-xs"
                          onClick={() => onMoveCandidate(candidate.id, getNextStatus(candidate.status)!)}
                        >
                          Avançar
                          <ChevronRight className="h-3 w-3 ml-1" />
                        </Button>
                      )}
                      {column.id !== 'rejected' && column.id !== 'approved' && (
                        <Button
                          variant="destructive"
                          size="sm"
                          className="text-xs"
                          onClick={() => onMoveCandidate(candidate.id, 'rejected')}
                        >
                          Reprovar
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
