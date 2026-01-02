import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, MapPin, Calendar, Briefcase, Users, Edit, Trash2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface JobPostingCardProps {
  job: any;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function JobPostingCard({ job, onSelect, onEdit, onDelete }: JobPostingCardProps) {
  const statusConfig: { [key: string]: { label: string; className: string } } = {
    open: { label: 'Aberta', className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
    closed: { label: 'Fechada', className: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
  };

  return (
    <Card className="flex flex-col hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle 
              className="text-lg hover:text-primary cursor-pointer" 
              onClick={onSelect}
              title="Clique para ver os candidatos desta vaga"
            >
              {job.title}
            </CardTitle>
            <CardDescription>{job.department}</CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="mr-2 h-4 w-4" />
                <span>Editar</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Excluir</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="flex-grow space-y-3">
        <div className="flex items-center text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
          <span>{job.location}</span>
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <Briefcase className="h-4 w-4 mr-2 flex-shrink-0" />
          <span>{job.type}</span>
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <Users className="h-4 w-4 mr-2 flex-shrink-0" />
          <span>{job.applicants} candidatos</span>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center text-xs text-muted-foreground pt-4">
        {job.status && statusConfig[job.status] && (
            <Badge variant="outline" className={statusConfig[job.status].className}>
                {statusConfig[job.status].label}
            </Badge>
        )}
        {job.postedAt && (
            <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{format(parseISO(job.postedAt), "dd 'de' MMM", { locale: ptBR })}</span>
            </div>
        )}
      </CardFooter>
    </Card>
  );
}