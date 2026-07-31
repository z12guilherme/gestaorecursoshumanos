import { useState } from "react";
import { Candidate } from "@/types/hr";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Star,
  Mail,
  Phone,
  ChevronRight,
  ChevronLeft,
  FileText,
  Trash2,
  Inbox,
  Filter,
  Calendar,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Sparkles,
  UserCheck,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface KanbanBoardProps {
  candidates: (Candidate & { resume_url?: string })[];
  onMoveCandidate: (candidateId: string, newStatus: Candidate["status"]) => void;
  onDeleteCandidate: (candidateId: string) => void;
  onWhatsAppContact?: (candidate: Candidate) => void;
}

const columns: {
  id: Candidate["status"];
  title: string;
  icon: any;
  headerBg: string;
  borderAccent: string;
  badgeBg: string;
}[] = [
  {
    id: "applied",
    title: "Inscritos",
    icon: Inbox,
    headerBg: "bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800",
    borderAccent: "border-t-slate-400 dark:border-t-slate-500",
    badgeBg: "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  },
  {
    id: "screening",
    title: "Triagem",
    icon: Filter,
    headerBg: "bg-blue-50/70 dark:bg-blue-950/40 border-blue-200/80 dark:border-blue-900/50",
    borderAccent: "border-t-blue-500",
    badgeBg: "bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300",
  },
  {
    id: "interview",
    title: "Entrevista",
    icon: Calendar,
    headerBg: "bg-amber-50/70 dark:bg-amber-950/40 border-amber-200/80 dark:border-amber-900/50",
    borderAccent: "border-t-amber-500",
    badgeBg: "bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300",
  },
  {
    id: "approved",
    title: "Aprovados",
    icon: CheckCircle2,
    headerBg:
      "bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-200/80 dark:border-emerald-900/50",
    borderAccent: "border-t-emerald-500",
    badgeBg: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300",
  },
  {
    id: "rejected",
    title: "Reprovados",
    icon: XCircle,
    headerBg: "bg-rose-50/70 dark:bg-rose-950/40 border-rose-200/80 dark:border-rose-900/50",
    borderAccent: "border-t-rose-400",
    badgeBg: "bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300",
  },
];

export function KanbanBoard({
  candidates,
  onMoveCandidate,
  onDeleteCandidate,
  onWhatsAppContact,
}: KanbanBoardProps) {
  const getColumnCandidates = (status: Candidate["status"]) =>
    candidates.filter((c) => {
      if (status === "applied") return c.status === "applied" || c.status === "Inscrito";
      return c.status === status;
    });

  const getNextStatus = (current: Candidate["status"]): Candidate["status"] | null => {
    const order: Candidate["status"][] = ["applied", "screening", "interview", "approved"];
    const currentIndex = order.indexOf(current);
    return currentIndex >= 0 && currentIndex < order.length - 1 ? order[currentIndex + 1] : null;
  };

  const getPrevStatus = (current: Candidate["status"]): Candidate["status"] | null => {
    const order: Candidate["status"][] = ["applied", "screening", "interview", "approved"];
    const currentIndex = order.indexOf(current);
    return currentIndex > 0 ? order[currentIndex - 1] : null;
  };

  return (
    <div className="overflow-x-auto pb-4 scrollbar-thin">
      <div className="flex gap-4 min-w-[1300px] md:min-w-0 md:grid md:grid-cols-5">
        {columns.map((column) => {
          const columnCandidates = getColumnCandidates(column.id);
          const Icon = column.icon;

          return (
            <div
              key={column.id}
              className={cn(
                "flex flex-col rounded-2xl border bg-muted/10 p-3 min-h-[560px] transition-all border-t-4",
                column.borderAccent,
                column.headerBg
              )}
            >
              {/* Header da Coluna */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-border/50">
                <div className="flex items-center gap-2 font-bold text-sm text-foreground">
                  <Icon className="h-4 w-4 text-primary shrink-0" />
                  <span>{column.title}</span>
                </div>
                <Badge
                  variant="secondary"
                  className={cn("font-bold text-xs px-2.5 py-0.5 rounded-full", column.badgeBg)}
                >
                  {columnCandidates.length}
                </Badge>
              </div>

              {/* Lista de Cards */}
              <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                {columnCandidates.length === 0 ? (
                  <div className="h-32 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center p-3 text-muted-foreground/60 text-xs">
                    <Icon className="h-6 w-6 mb-1 opacity-40" />
                    <span>Nenhum candidato</span>
                  </div>
                ) : (
                  columnCandidates.map((candidate) => (
                    <Card
                      key={candidate.id}
                      className="group relative rounded-xl border bg-card shadow-sm hover:shadow-md hover:border-primary/40 transition-all duration-200"
                    >
                      <CardContent className="p-4 space-y-3">
                        {/* Top Info */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 border-2 border-background shadow-xs">
                              <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/5 text-primary font-bold text-xs">
                                {candidate.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .slice(0, 2)
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors line-clamp-1">
                                {candidate.name || "Candidato"}
                              </p>
                              <p className="text-xs text-muted-foreground line-clamp-1">
                                {candidate.position}
                              </p>
                            </div>
                          </div>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-muted-foreground hover:text-foreground"
                              >
                                <Star className="h-3.5 w-3.5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="text-xs">
                              {onWhatsAppContact && (
                                <DropdownMenuItem onClick={() => onWhatsAppContact(candidate)}>
                                  <MessageSquare className="mr-2 h-3.5 w-3.5 text-emerald-500" />
                                  Notificar WhatsApp
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                onClick={() => onDeleteCandidate(candidate.id)}
                                className="text-rose-600"
                              >
                                <Trash2 className="mr-2 h-3.5 w-3.5" />
                                Excluir Candidato
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        {/* Rating */}
                        {candidate.rating && (
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={cn(
                                  "h-3.5 w-3.5",
                                  i < candidate.rating!
                                    ? "fill-amber-400 text-amber-400"
                                    : "text-muted-foreground/20"
                                )}
                              />
                            ))}
                          </div>
                        )}

                        {/* Contato & Notas */}
                        {candidate.phone && (
                          <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/40">
                            <span className="font-mono">{candidate.phone}</span>
                            {onWhatsAppContact && (
                              <button
                                onClick={() => onWhatsAppContact(candidate)}
                                className="inline-flex items-center gap-1 text-emerald-600 font-semibold hover:underline"
                              >
                                <MessageSquare className="h-3 w-3" /> WhatsApp
                              </button>
                            )}
                          </div>
                        )}

                        {/* Currículo Button */}
                        {candidate.resume_url && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full text-xs gap-1.5 h-8 font-medium rounded-lg border-muted hover:bg-muted/50"
                            onClick={() => window.open(candidate.resume_url, "_blank")}
                          >
                            <FileText className="h-3.5 w-3.5 text-primary" />
                            Ver Currículo PDF
                          </Button>
                        )}

                        {/* Botões de Ação de Etapa */}
                        <div className="flex items-center gap-1.5 pt-1">
                          {getPrevStatus(candidate.status) && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 text-[11px] h-7 px-2 font-medium"
                              onClick={() =>
                                onMoveCandidate(candidate.id, getPrevStatus(candidate.status)!)
                              }
                            >
                              <ChevronLeft className="h-3 w-3 mr-0.5" />
                              Voltar
                            </Button>
                          )}
                          {getNextStatus(candidate.status) && (
                            <Button
                              size="sm"
                              className="flex-1 text-[11px] h-7 px-2 font-semibold bg-primary hover:bg-primary/90"
                              onClick={() =>
                                onMoveCandidate(candidate.id, getNextStatus(candidate.status)!)
                              }
                            >
                              Avançar
                              <ChevronRight className="h-3 w-3 ml-0.5" />
                            </Button>
                          )}
                          {column.id !== "rejected" && column.id !== "approved" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-[11px] h-7 px-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                              onClick={() => onMoveCandidate(candidate.id, "rejected")}
                            >
                              Reprovar
                            </Button>
                          )}
                          {column.id === "rejected" && (
                            <Button
                              variant="destructive"
                              size="sm"
                              className="w-full text-[11px] h-7 font-medium"
                              onClick={() => onDeleteCandidate(candidate.id)}
                            >
                              <Trash2 className="h-3 w-3 mr-1" />
                              Remover
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
