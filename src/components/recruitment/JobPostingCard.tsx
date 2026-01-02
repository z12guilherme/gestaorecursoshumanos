import { JobPosting } from '@/types/hr';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Users, Calendar, MoreHorizontal, Eye, Edit, Pause, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface JobPostingCardProps {
  job: JobPosting;
  onSelect: () => void;
}

const statusConfig = {
  open: { label: 'Aberta', className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  closed: { label: 'Fechada', className: 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400' },
  paused: { label: 'Pausada', className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
};

const typeConfig = {
  'full-time': 'Integral',
  'part-time': 'Meio período',
  'contract': 'Contrato',
  'intern': 'Estágio',
};

export function JobPostingCard({ job, onSelect }: JobPostingCardProps) {
  const status = statusConfig[job.status];

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer group" onClick={onSelect}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
              {job.title}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{job.department}</p>
          </div>
          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <Badge className={status.className}>{status.label}</Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Eye className="mr-2 h-4 w-4" />
                  Ver detalhes
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Pause className="mr-2 h-4 w-4" />
                  Pausar vaga
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            {job.location}
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            {job.applicants} candidatos
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {format(parseISO(job.createdAt), "dd 'de' MMM", { locale: ptBR })}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">{typeConfig[job.type]}</Badge>
          {job.requirements.slice(0, 3).map((req) => (
            <Badge key={req} variant="outline" className="text-xs">
              {req}
            </Badge>
          ))}
          {job.requirements.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{job.requirements.length - 3}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
