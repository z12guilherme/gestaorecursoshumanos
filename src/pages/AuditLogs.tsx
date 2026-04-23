import { useEffect, useState } from "react";
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
import { ShieldAlert, Trash2, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { AppLayout } from "@/components/layout/AppLayout";
import { useEmployees } from "@/hooks/useEmployees";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export default function AuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 50;

  const today = format(new Date(), "yyyy-MM-dd");
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [isCleanupDialogOpen, setIsCleanupDialogOpen] = useState(false);
  const [cleanupDate, setCleanupDate] = useState(today);

  const { employees } = useEmployees();
  const { session } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchLogs();
  }, [page]);

  const fetchLogs = async () => {
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
  };

  const handleFilter = () => {
    if (page === 1) fetchLogs();
    else setPage(1); // Mudar a página de volta para 1 reflete automaticamente no useEffect
  };

  const handleCleanupByDate = async () => {
    try {
      await auditService.deleteLogsBeforeDate(cleanupDate);
      toast({ title: "Limpeza concluída", description: `Logs até ${format(new Date(cleanupDate), 'dd/MM/yyyy')} foram removidos.` });
      setIsCleanupDialogOpen(false);
      if (page === 1) fetchLogs();
      else setPage(1);
    } catch (error) {
      console.error(error);
      toast({ title: "Erro", description: "Falha ao limpar logs antigos.", variant: "destructive" });
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case "INSERT": return "bg-green-500 hover:bg-green-600";
      case "UPDATE": return "bg-blue-500 hover:bg-blue-600";
      case "DELETE": return "bg-red-500 hover:bg-red-600";
      default: return "bg-gray-500";
    }
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
          <Button variant="destructive" onClick={() => setIsCleanupDialogOpen(true)} className="gap-2">
            <Trash2 className="h-4 w-4" />
            Limpar Logs Antigos
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filtrar Histórico</CardTitle>
            <CardDescription>Busque alterações por período e navegue entre os resultados.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-end gap-4 mb-6">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Data Inicial</label>
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
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
                          <summary className="hover:text-primary transition-colors">Ver Dados</summary>
                          <div className="mt-2 rounded bg-muted p-2 font-mono text-xs overflow-x-auto max-w-[400px]">
                            {log.old_data && (
                              <div className="mb-2">
                                <span className="font-bold text-red-500 block mb-1">Antes:</span>
                                <pre>{JSON.stringify(log.old_data, null, 2)}</pre>
                              </div>
                            )}
                            {log.new_data && (
                              <div>
                                <span className="font-bold text-green-500 block mb-1">Depois:</span>
                                <pre>{JSON.stringify(log.new_data, null, 2)}</pre>
                              </div>
                            )}
                          </div>
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
                <span className="text-sm font-medium">Página {page} de {totalPages || 1}</span>
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
              Selecione uma data limite. Todos os registros de auditoria <b>anteriores ou iguais</b> a esta data serão permanentemente excluídos do banco de dados. Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <label className="text-sm font-medium mb-2 block">Data Limite de Exclusão</label>
            <Input type="date" value={cleanupDate} onChange={(e) => setCleanupDate(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCleanupDialogOpen(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleCleanupByDate}>Confirmar Exclusão</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}