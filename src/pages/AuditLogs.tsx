import { useCallback, useEffect, useState } from "react";
import { auditService, AuditLog } from "@/services/auditService";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ShieldAlert, Trash2, ChevronLeft, ChevronRight, Search, Copy, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { AppLayout } from "@/components/layout/AppLayout";
import { useEmployees } from "@/hooks/useEmployees";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

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
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 50;

  const today = format(new Date(), "yyyy-MM-dd");
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isCleanupDialogOpen, setIsCleanupDialogOpen] = useState(false);
  const [cleanupDate, setCleanupDate] = useState(today);

  const { employees } = useEmployees();
  const { session } = useAuth();
  const { toast } = useToast();

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const { data, count } = await auditService.getLogs(page, pageSize, startDate, endDate);
      setLogs(data);
      setTotalCount(count);
    } catch (error) {
      console.error("Erro ao buscar logs:", error);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, startDate, endDate]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast({ title: "Copiado", description: "Dados copiados para a área de transferência." });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleFilter = () => {
    if (page !== 1) {
      setPage(1);
    } else {
      // Se já estiver na página 1, o useEffect não disparará, então chamamos manualmente
      fetchLogs();
    }
  };

  const handleCleanupByDate = async () => {
    try {
      await auditService.deleteLogsBeforeDate(cleanupDate);
      toast({
        title: "Limpeza concluída",
        description: `Logs até ${format(new Date(cleanupDate), "dd/MM/yyyy")} foram removidos.`,
      });
      setIsCleanupDialogOpen(false);
      if (page === 1) fetchLogs();
      else setPage(1);
    } catch (error) {
      console.error(error);
      toast({
        title: "Erro",
        description: "Falha ao limpar logs antigos.",
        variant: "destructive",
      });
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
      <div className="mt-2 relative rounded-xl border bg-muted/60 p-3 font-mono text-xs max-w-[680px] shadow-sm">
        <Button
          size="icon"
          variant="ghost"
          className="absolute right-2 top-2 h-6 w-6"
          onClick={() =>
            copyToClipboard(
              JSON.stringify({ antes: log.old_data, depois: log.new_data }, null, 2),
              log.id
            )
          }
        >
          {copiedId === log.id ? (
            <Check className="h-3 w-3 text-green-500" />
          ) : (
            <Copy className="h-3 w-3" />
          )}
        </Button>

        <ScrollArea className="max-h-[320px] w-full pr-4">
          <div className="space-y-4">
            <div className="rounded-lg border bg-background/80 p-3">
              <div className="mb-2 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                Resumo do registro
              </div>
              <div className="grid gap-2 md:grid-cols-2">
                <div>
                  <span className="text-muted-foreground">Ação:</span> {log.action}
                </div>
                <div>
                  <span className="text-muted-foreground">Tabela:</span> {log.table_name}
                </div>
                <div className="md:col-span-2">
                  <span className="text-muted-foreground">Registro:</span> {log.record_id}
                </div>
              </div>
            </div>

            {hasStructuredDiff && (
              <div className="space-y-4">
                <div className="rounded-lg border bg-background/80 p-3">
                  <span className="font-bold text-primary block mb-2 underline">
                    Campos alterados
                  </span>
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
              {log.old_data && (
                <div className="rounded-lg border bg-background/80 p-3">
                  <span className="font-bold text-red-500 block mb-2 underline">
                    ANTES - JSON completo:
                  </span>
                  <pre className="whitespace-pre-wrap break-words">
                    {JSON.stringify(log.old_data, null, 2)}
                  </pre>
                </div>
              )}
              {log.new_data && (
                <div className="rounded-lg border bg-background/80 p-3">
                  <span className="font-bold text-green-500 block mb-2 underline">
                    DEPOIS - JSON completo:
                  </span>
                  <pre className="whitespace-pre-wrap break-words">
                    {JSON.stringify(log.new_data, null, 2)}
                  </pre>
                </div>
              )}
              {!log.old_data && !log.new_data && <span>Nenhum dado detalhado disponível.</span>}
            </div>
          </div>
        </ScrollArea>
      </div>
    );
  };

  const getUserLabel = (userId: string) => {
    if (!userId) return "Sistema";

    // Verifica se é o usuário atual logado
    if (session?.user?.id === userId) {
      return `${session.user.email} (Você)`;
    }

    const employee = employees.find((e) => e.id === userId);
    return employee?.name || employee?.email || userId;
  };

  if (loading) {
    return (
      <AppLayout title="Auditoria">
        <div className="flex h-[50vh] items-center justify-center">
          <div className="text-center text-muted-foreground">Carregando auditoria...</div>
        </div>
      </AppLayout>
    );
  }

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <AppLayout title="Auditoria" subtitle="Histórico de alterações do sistema">
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight">Logs de Auditoria</h1>
          </div>
          <Button
            variant="destructive"
            onClick={() => setIsCleanupDialogOpen(true)}
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Limpar Logs Antigos
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filtrar Histórico</CardTitle>
            <CardDescription>
              Busque alterações por período e navegue entre os resultados.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-end gap-4 mb-6">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Data Inicial</label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Data Final</label>
                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
              <Button onClick={handleFilter} className="gap-2">
                <Search className="h-4 w-4" />
                Buscar
              </Button>
            </div>

            <ScrollArea className="h-[500px] rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>Ação</TableHead>
                    <TableHead>Tabela</TableHead>
                    <TableHead>Usuário (ID)</TableHead>
                    <TableHead>Detalhes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="whitespace-nowrap font-medium">
                        {format(new Date(log.changed_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                      </TableCell>
                      <TableCell>
                        <Badge className={getActionColor(log.action)}>{log.action}</Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{log.table_name}</TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {getUserLabel(log.changed_by)}
                      </TableCell>
                      <TableCell>
                        <details className="cursor-pointer text-sm text-muted-foreground group">
                          <summary className="hover:text-primary transition-colors">
                            Ver Dados
                          </summary>
                          {renderAuditDetails(log)}
                        </details>
                      </TableCell>
                    </TableRow>
                  ))}
                  {logs.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                        Nenhum registro de auditoria encontrado.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </ScrollArea>

            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Mostrando {logs.length} de {totalCount} registros
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium">
                  Página {page} de {totalPages || 1}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages || totalPages === 0}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isCleanupDialogOpen} onOpenChange={setIsCleanupDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Limpeza de Auditoria</DialogTitle>
            <DialogDescription>
              Selecione uma data limite. Todos os registros de auditoria <b>anteriores ou iguais</b>{" "}
              a esta data serão permanentemente excluídos do banco de dados. Esta ação não pode ser
              desfeita.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <label className="text-sm font-medium mb-2 block">Data Limite de Exclusão</label>
            <Input
              type="date"
              value={cleanupDate}
              onChange={(e) => setCleanupDate(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCleanupDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleCleanupByDate}>
              Confirmar Exclusão
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
