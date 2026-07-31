import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MoreHorizontal,
  MapPin,
  Calendar,
  Briefcase,
  Users,
  Edit,
  Trash2,
  ExternalLink,
  Copy,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

interface JobPostingCardProps {
  job: any;
  candidateCount?: number;
  onSelect?: () => void;
  onEdit: (job: any) => void;
  onDelete: (id: string) => void;
}

export function JobPostingCard({
  job,
  candidateCount,
  onSelect,
  onEdit,
  onDelete,
}: JobPostingCardProps) {
  const { toast } = useToast();
  const status = job.status === "open" || job.status === "Aberta" ? "open" : "closed";

  const handleCopyLink = () => {
    const publicUrl = `${window.location.origin}/vagas/${job.id}`;
    navigator.clipboard.writeText(publicUrl);
    toast({
      title: "Link da vaga copiado!",
      description: "Compartilhe com os candidatos ou publique nas redes.",
    });
  };

  return (
    <Card className="rounded-2xl border bg-card shadow-sm hover:shadow-md hover:border-primary/40 transition-all flex flex-col justify-between">
      <CardHeader className="p-5 pb-3">
        <div className="flex justify-between items-start gap-2">
          <div>
            <CardTitle
              className="text-base font-bold hover:text-primary cursor-pointer transition-colors"
              onClick={onSelect}
            >
              {job.title}
            </CardTitle>
            <CardDescription className="text-xs font-medium text-muted-foreground mt-0.5">
              {job.department}
            </CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="text-xs">
              <DropdownMenuItem onClick={handleCopyLink}>
                <Copy className="mr-2 h-3.5 w-3.5" />
                <span>Copiar Link Público</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => window.open(`/vagas/${job.id}`, "_blank")}>
                <ExternalLink className="mr-2 h-3.5 w-3.5" />
                <span>Ver Página da Vaga</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(job)}>
                <Edit className="mr-2 h-3.5 w-3.5" />
                <span>Editar Vaga</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(job.id)}
                className="text-rose-600 focus:text-rose-600"
              >
                <Trash2 className="mr-2 h-3.5 w-3.5" />
                <span>Excluir</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="p-5 pt-0 space-y-2.5">
        <div className="flex items-center text-xs text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 mr-2 text-primary shrink-0" />
          <span>{job.location || "Belo Jardim - PE"}</span>
        </div>
        <div className="flex items-center text-xs text-muted-foreground">
          <Briefcase className="h-3.5 w-3.5 mr-2 text-primary shrink-0" />
          <span>{job.type || "Integral"}</span>
        </div>
        <div className="flex items-center text-xs font-semibold text-foreground">
          <Users className="h-3.5 w-3.5 mr-2 text-blue-500 shrink-0" />
          <span>{candidateCount ?? job.applicants ?? 0} candidatos inscritos</span>
        </div>
      </CardContent>

      <CardFooter className="p-5 pt-3 border-t flex justify-between items-center text-xs text-muted-foreground bg-muted/10 rounded-b-2xl">
        <Badge
          variant="secondary"
          className={
            status === "open"
              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-semibold"
              : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
          }
        >
          {status === "open" ? "Vaga Aberta" : "Fechada"}
        </Badge>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopyLink}
          className="h-7 text-[11px] gap-1 text-primary"
        >
          <Copy className="h-3 w-3" /> Copiar Link
        </Button>
      </CardFooter>
    </Card>
  );
}
