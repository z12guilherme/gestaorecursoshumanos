import { useCallback, useEffect, useState } from "react";
import { auditService, AuditLog } from "@/services/auditService";
import { archiveService } from "@/services/archiveService";
import { supabase } from "@/lib/supabase";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ShieldAlert, ChevronLeft, ChevronRight, Archive, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type AuditValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | Record<string, unknown>
  | unknown[];

export default function AuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [userMap, setUserMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [archiving, setArchiving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchUsers = useCallback(async () => {
    try {
      const { data } = await supabase.from("profiles").select("id, full_name");
      if (data) {
        const map: Record<string, string> = {};
        data.forEach((u) => {
          map[u.id] = u.full_name;
        });
        setUserMap(map);
      }
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
    }
  }, []);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await auditService.getLogs();
      setLogs(data);
    } catch (error) {
      console.error("Erro ao buscar logs:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
    fetchUsers();
  }, [fetchLogs, fetchUsers]);

  const handleArchiveLogs = async () => {
    if (
      !window.confirm(
        "Deseja realmente arquivar e excluir os logs com mais de 6 meses? Um arquivo CSV será baixado com o backup."
      )
    )
      return;

    setArchiving(true);
    try {
      const oldLogs = await archiveService.archiveAndDeleteColdData("audit_logs", 6);

      if (oldLogs.length > 0) {
        archiveService.downloadAsCSV(oldLogs, "backup_audit_logs");
        alert(`${oldLogs.length} logs antigos foram arquivados e removidos do banco de dados.`);
        fetchLogs();
      } else {
        alert("Nenhum log antigo foi encontrado para arquivamento.");
      }
    } catch (error) {
      console.error("Falha ao arquivar:", error);
      alert("Falha ao arquivar logs antigos.");
    } finally {
      setArchiving(false);
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case "INSERT":
        return "bg-green-500 hover:bg-green-600";
      case "UPDATE":
        return "bg-blue-500 hover:bg-blue-600";
      case "DELETE":
        return "bg-red-500 hover:bg-red-600";
      default:
        return "bg-gray-500";
    }
  };

  const formatAuditValue = (value: AuditValue) => {
    if (value === null) return "null";
    if (value === undefined) return "—";
    if (typeof value === "string") return value || "—";
    if (typeof value === "number" || typeof value === "boolean") return String(value);
    return JSON.stringify(value, null, 2);
  };

  const tryParseJson = (value: unknown) => {
    if (typeof value !== "string") return value;
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  };

  const formatPrettyJson = (value: unknown) => {
    const parsed = tryParseJson(value);
    if (parsed === null || parsed === undefined) return "Nenhum dado detalhado disponível.";
    if (typeof parsed === "string") return parsed;
    return JSON.stringify(parsed, null, 2);
  };

  const getChangedFields = (
    oldData: Record<string, AuditValue> | null,
    newData: Record<string, AuditValue> | null
  ) => {
    const before = oldData ?? {};
    const after = newData ?? {};
    const keys = new Set([...Object.keys(before), ...Object.keys(after)]);

    return Array.from(keys)
      .filter((key) => JSON.stringify(before[key]) !== JSON.stringify(after[key]))
      .sort((a, b) => a.localeCompare(b, "pt-BR"));
  };

  const renderAuditDetails = (log: AuditLog) => {
    const oldData = log.old_data as Record<string, AuditValue> | null;
    const newData = log.new_data as Record<string, AuditValue> | null;
    const changedFields = getChangedFields(oldData, newData);
    const hasStructuredDiff = changedFields.length > 0;

    return (
      <div className="mt-2 rounded-xl border bg-muted/60 p-3 font-mono text-xs shadow-sm">
        <ScrollArea className="max-h-[420px] w-full pr-4">
          <div className="space-y-4">
            <div className="rounded-xl border bg-background/90 p-4 shadow-sm">
              <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                Resumo do registro
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-lg bg-muted/40 p-3">
                  <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Ação
                  </div>
                  <div className="mt-1 font-semibold">{log.action}</div>
                </div>
                <div className="rounded-lg bg-muted/40 p-3">
                  <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Tabela
                  </div>
                  <div className="mt-1 font-semibold">{log.table_name}</div>
                </div>
                <div className="md:col-span-2 rounded-lg bg-muted/40 p-3">
                  <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Registro
                  </div>
                  <div className="mt-1 break-all font-mono text-[11px]">{log.record_id}</div>
                </div>
              </div>
            </div>

            {hasStructuredDiff && (
              <div className="space-y-4">
                <div className="rounded-xl border bg-background/90 p-4">
                  <span className="mb-3 block font-bold text-primary">Campos alterados</span>
                  <div className="space-y-3">
                    {changedFields.map((field) => {
                      const before = oldData?.[field];
                      const after = newData?.[field];
                      const isAdded = before === undefined && after !== undefined;
                      const isRemoved = before !== undefined && after === undefined;

                      return (
                        <div key={field} className="rounded-lg border bg-muted/40 p-3">
                          <div className="mb-2 flex items-center justify-between gap-2">
                            <span className="font-semibold text-foreground">{field}</span>
                            <Badge
                              variant="outline"
                              className="text-[10px] uppercase tracking-wide"
                            >
                              {isAdded ? "adicionado" : isRemoved ? "removido" : "alterado"}
                            </Badge>
                          </div>
                          <div className="grid gap-2 md:grid-cols-2">
                            <div className="rounded-md bg-red-50 p-2 text-red-900 dark:bg-red-950/40 dark:text-red-200">
                              <div className="mb-1 text-[10px] font-bold uppercase tracking-wide opacity-80">
                                Antes
                              </div>
                              <pre className="whitespace-pre-wrap break-words font-mono text-[11px] leading-relaxed">
                                {formatAuditValue(before)}
                              </pre>
                            </div>
                            <div className="rounded-md bg-emerald-50 p-2 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
                              <div className="mb-1 text-[10px] font-bold uppercase tracking-wide opacity-80">
                                Depois
                              </div>
                              <pre className="whitespace-pre-wrap break-words font-mono text-[11px] leading-relaxed">
                                {formatAuditValue(after)}
                              </pre>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            <div className="grid gap-4">
              {log.old_data !== null && log.old_data !== undefined && (
                <div className="rounded-xl border bg-background/90 p-4">
                  <span className="mb-2 block font-bold text-red-500">ANTES - JSON completo:</span>
                  <ScrollArea className="max-h-[240px] rounded-md border bg-muted/30">
                    <pre className="whitespace-pre-wrap break-words p-3 text-[11px] leading-relaxed">
                      {formatPrettyJson(log.old_data)}
                    </pre>
                  </ScrollArea>
                </div>
              )}
              {log.new_data !== null && log.new_data !== undefined && (
                <div className="rounded-xl border bg-background/90 p-4">
                  <span className="mb-2 block font-bold text-green-500">
                    DEPOIS - JSON completo:
                  </span>
                  <ScrollArea className="max-h-[240px] rounded-md border bg-muted/30">
                    <pre className="whitespace-pre-wrap break-words p-3 text-[11px] leading-relaxed">
                      {formatPrettyJson(log.new_data)}
                    </pre>
                  </ScrollArea>
                </div>
              )}
              {log.old_data === null &&
                log.old_data === undefined &&
                log.new_data === null &&
                log.new_data === undefined && <span>Nenhum dado detalhado disponível.</span>}
            </div>
          </div>
        </ScrollArea>
      </div>
    );
  };

  const totalPages = Math.ceil(logs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentLogs = logs.slice(startIndex, startIndex + itemsPerPage);

  if (loading) return <div className="p-8 text-center">Carregando auditoria...</div>;

  return (
    <div className="space-y-6 p-6 animate-in fade-in duration-500">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">Logs de Auditoria</h1>
        </div>
        <Button
          variant="outline"
          onClick={handleArchiveLogs}
          disabled={archiving}
          className="gap-2"
        >
          {archiving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Archive className="h-4 w-4" />
          )}
          {archiving ? "Arquivando..." : "Arquivar Logs Antigos"}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Alterações do Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Ação</TableHead>
                  <TableHead>Tabela</TableHead>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Detalhes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="whitespace-nowrap font-medium">
                      {format(new Date(log.changed_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                    </TableCell>
                    <TableCell>
                      <Badge className={getActionColor(log.action)}>{log.action}</Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{log.table_name}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {log.changed_by ? userMap[log.changed_by] || log.changed_by : "Sistema"}
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            Ver Dados
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl">
                          <DialogHeader>
                            <DialogTitle>Detalhes da Auditoria</DialogTitle>
                            <DialogDescription>
                              Visualização completa dos dados antes e depois da alteração.
                            </DialogDescription>
                          </DialogHeader>
                          {renderAuditDetails(log)}
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
                {logs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                      Nenhum registro de auditoria encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>

          {logs.length > 0 && (
            <div className="flex items-center justify-end space-x-2 py-4">
              <div className="mr-4 text-sm text-muted-foreground">
                Página {currentPage} de {totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
