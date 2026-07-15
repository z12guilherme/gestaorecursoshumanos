import { useCallback, useEffect, useMemo, useState } from "react";
import { auditService, AuditLog, AuditLogStats } from "@/services/auditService";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ShieldAlert,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Search,
  Copy,
  Check,
  Plus,
  RefreshCw,
  Filter,
  Activity,
  Database,
  User,
  Clock,
  ArrowUpDown,
  AlertTriangle,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AppLayout } from "@/components/layout/AppLayout";
import { useEmployees } from "@/hooks/useEmployees";
import { useToast } from "@/hooks/use-toast";

type AuditValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | Record<string, unknown>
  | unknown[];

// ─── Utility helpers ──────────────────────────────────────────────────────────

const ACTION_CONFIG = {
  INSERT: {
    label: "Inserção",
    icon: Plus,
    color: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30 dark:text-emerald-400",
    dotColor: "bg-emerald-500",
    statColor: "from-emerald-500/20 to-emerald-500/5 border-emerald-500/20",
    statText: "text-emerald-600 dark:text-emerald-400",
  },
  UPDATE: {
    label: "Atualização",
    icon: ArrowUpDown,
    color: "bg-blue-500/15 text-blue-700 border-blue-500/30 dark:text-blue-400",
    dotColor: "bg-blue-500",
    statColor: "from-blue-500/20 to-blue-500/5 border-blue-500/20",
    statText: "text-blue-600 dark:text-blue-400",
  },
  DELETE: {
    label: "Exclusão",
    icon: Trash2,
    color: "bg-rose-500/15 text-rose-700 border-rose-500/30 dark:text-rose-400",
    dotColor: "bg-rose-500",
    statColor: "from-rose-500/20 to-rose-500/5 border-rose-500/20",
    statText: "text-rose-600 dark:text-rose-400",
  },
} as const;

// ─── Sub-components ───────────────────────────────────────────────────────────

function UserAvatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const hue = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;

  return (
    <div
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white shadow-sm"
      style={{ background: `hsl(${hue}, 55%, 48%)` }}
      title={name}
    >
      {initials}
    </div>
  );
}

function ActionBadge({ action }: { action: string }) {
  const config = ACTION_CONFIG[action as keyof typeof ACTION_CONFIG];
  if (!config) return <Badge variant="outline">{action}</Badge>;
  const Icon = config.icon;
  return (
    <Badge
      variant="outline"
      className={`gap-1.5 border font-semibold text-xs px-2 py-0.5 ${config.color}`}
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}

function StatCard({
  label,
  value,
  action,
  loading,
}: {
  label: string;
  value: number;
  action: keyof typeof ACTION_CONFIG;
  loading: boolean;
}) {
  const config = ACTION_CONFIG[action];
  const Icon = config.icon;
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br ${config.statColor} p-4 transition-all duration-200 hover:shadow-md`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          {loading ? (
            <Skeleton className="mt-2 h-8 w-16" />
          ) : (
            <p className={`mt-1 text-3xl font-bold tabular-nums ${config.statText}`}>{value}</p>
          )}
        </div>
        <div className={`rounded-xl ${config.dotColor} bg-opacity-20 p-2`}>
          <Icon className={`h-5 w-5 ${config.statText}`} />
        </div>
      </div>
    </div>
  );
}

function SkeletonRow() {
  return (
    <tr className="border-b">
      <td className="px-4 py-3">
        <Skeleton className="h-4 w-28" />
      </td>
      <td className="px-4 py-3">
        <Skeleton className="h-6 w-24 rounded-full" />
      </td>
      <td className="px-4 py-3">
        <Skeleton className="h-4 w-20" />
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-7 w-7 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>
      </td>
      <td className="px-4 py-3">
        <Skeleton className="h-8 w-20 rounded-lg" />
      </td>
    </tr>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function AuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [stats, setStats] = useState<AuditLogStats>({
    inserts: 0,
    updates: 0,
    deletes: 0,
    total: 0,
  });
  const [availableTables, setAvailableTables] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 50;

  const today = format(new Date(), "yyyy-MM-dd");
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [tableFilter, setTableFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [isCleanupDialogOpen, setIsCleanupDialogOpen] = useState(false);
  const [cleanupDate, setCleanupDate] = useState(today);

  const { employees } = useEmployees();
  const { toast } = useToast();

  // Map userId → name for fast lookup
  const userNameMap = useMemo(() => {
    const map = new Map<string, string>();
    employees.forEach((e) => {
      if (e.id) map.set(e.id, e.name);
    });
    return map;
  }, [employees]);

  const resolveUserName = useCallback(
    (id: string | null | undefined): string => {
      if (!id) return "Sistema";
      const name = userNameMap.get(id);
      if (name) return name;
      // Fallback: show truncated ID
      return id.length > 12 ? `${id.slice(0, 8)}…` : id;
    },
    [userNameMap]
  );

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const { data, count } = await auditService.getLogs(
        page,
        pageSize,
        startDate,
        endDate,
        actionFilter !== "all" ? actionFilter : undefined,
        tableFilter !== "all" ? tableFilter : undefined
      );
      setLogs(data);
      setTotalCount(count);
    } catch (error) {
      console.error("Erro ao buscar logs:", error);
      toast({ title: "Erro", description: "Falha ao carregar logs.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, startDate, endDate, actionFilter, tableFilter, toast]);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const result = await auditService.getLogStats(startDate, endDate);
      setStats(result);
    } catch {
      // silent
    } finally {
      setStatsLoading(false);
    }
  }, [startDate, endDate]);

  const fetchTables = useCallback(async () => {
    try {
      const tables = await auditService.getDistinctTables();
      setAvailableTables(tables);
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchTables();
  }, [fetchTables]);

  const handleFilter = () => {
    if (page !== 1) setPage(1);
    else {
      fetchLogs();
      fetchStats();
    }
  };

  const clearFilters = () => {
    setActionFilter("all");
    setTableFilter("all");
    setSearchQuery("");
    setStartDate(today);
    setEndDate(today);
    setPage(1);
  };

  const handleCleanupByDate = async () => {
    try {
      await auditService.deleteLogsBeforeDate(cleanupDate);
      toast({
        title: "Limpeza concluída",
        description: `Logs até ${format(new Date(cleanupDate + "T12:00:00"), "dd/MM/yyyy")} foram removidos.`,
      });
      setIsCleanupDialogOpen(false);
      fetchLogs();
      fetchStats();
    } catch {
      toast({
        title: "Erro",
        description: "Falha ao limpar logs antigos.",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast({ title: "Copiado!", description: "Dados copiados para a área de transferência." });
    setTimeout(() => setCopiedId(null), 2000);
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
    if (parsed === null || parsed === undefined) return "Nenhum dado disponível.";
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

  // Client-side search filter (on top of server filters)
  const filteredLogs = useMemo(() => {
    if (!searchQuery.trim()) return logs;
    const q = searchQuery.toLowerCase();
    return logs.filter(
      (l) =>
        l.table_name.toLowerCase().includes(q) ||
        l.action.toLowerCase().includes(q) ||
        resolveUserName(l.changed_by).toLowerCase().includes(q) ||
        (l.record_id && l.record_id.toLowerCase().includes(q))
    );
  }, [logs, searchQuery, resolveUserName]);

  const totalPages = Math.ceil(totalCount / pageSize);
  const hasActiveFilters =
    actionFilter !== "all" || tableFilter !== "all" || searchQuery.trim() !== "";

  // ── Audit detail dialog content ──
  const renderAuditDetails = (log: AuditLog) => {
    const oldData = log.old_data as Record<string, AuditValue> | null;
    const newData = log.new_data as Record<string, AuditValue> | null;
    const changedFields = getChangedFields(oldData, newData);
    const hasStructuredDiff = changedFields.length > 0;
    const userName = resolveUserName(log.changed_by);

    return (
      <div className="space-y-4">
        {/* Meta info */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Ação", value: <ActionBadge action={log.action} /> },
            {
              label: "Tabela",
              value: (
                <code className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">
                  {log.table_name}
                </code>
              ),
            },
            { label: "Usuário", value: <span className="text-sm font-medium">{userName}</span> },
            {
              label: "Data/Hora",
              value: (
                <span className="text-xs text-muted-foreground">
                  {format(new Date(log.changed_at), "dd/MM/yyyy 'às' HH:mm:ss", { locale: ptBR })}
                </span>
              ),
            },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-xl border bg-muted/30 p-3 space-y-1">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {label}
              </p>
              <div>{value}</div>
            </div>
          ))}
        </div>

        {/* Record ID */}
        <div className="rounded-xl border bg-muted/30 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
            ID do Registro
          </p>
          <code className="text-xs font-mono break-all">{log.record_id}</code>
        </div>

        <ScrollArea className="max-h-[400px] rounded-xl border bg-muted/10 p-1">
          <div className="space-y-3 p-2">
            {/* Structured diff */}
            {hasStructuredDiff && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 px-1">
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Campos Alterados ({changedFields.length})
                  </span>
                  <div className="h-px flex-1 bg-border" />
                </div>
                {changedFields.map((field) => {
                  const before = oldData?.[field];
                  const after = newData?.[field];
                  const isAdded = before === undefined && after !== undefined;
                  const isRemoved = before !== undefined && after === undefined;

                  return (
                    <div key={field} className="rounded-xl border bg-background p-3 shadow-sm">
                      <div className="mb-2 flex items-center gap-2">
                        <span className="font-semibold text-sm">{field}</span>
                        <Badge
                          variant="outline"
                          className={`text-[10px] uppercase tracking-wide ${
                            isAdded
                              ? "border-emerald-500/30 text-emerald-600"
                              : isRemoved
                                ? "border-rose-500/30 text-rose-600"
                                : "border-blue-500/30 text-blue-600"
                          }`}
                        >
                          {isAdded ? "adicionado" : isRemoved ? "removido" : "alterado"}
                        </Badge>
                      </div>
                      <div className="grid gap-2 sm:grid-cols-2">
                        <div className="rounded-lg bg-rose-50 p-2 dark:bg-rose-950/40">
                          <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-rose-500 opacity-80">
                            Antes
                          </p>
                          <pre className="whitespace-pre-wrap break-words font-mono text-[11px] leading-relaxed text-rose-900 dark:text-rose-200">
                            {formatAuditValue(before)}
                          </pre>
                        </div>
                        <div className="rounded-lg bg-emerald-50 p-2 dark:bg-emerald-950/40">
                          <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-emerald-600 opacity-80">
                            Depois
                          </p>
                          <pre className="whitespace-pre-wrap break-words font-mono text-[11px] leading-relaxed text-emerald-900 dark:text-emerald-200">
                            {formatAuditValue(after)}
                          </pre>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Full JSON */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 px-1">
                <div className="h-px flex-1 bg-border" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  JSON Completo
                </span>
                <div className="h-px flex-1 bg-border" />
              </div>
              {log.old_data != null && (
                <div className="rounded-xl border bg-background p-3">
                  <p className="mb-2 text-xs font-bold text-rose-500">ANTES</p>
                  <pre className="max-h-40 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-muted/50 p-2 font-mono text-[11px] leading-relaxed">
                    {formatPrettyJson(log.old_data)}
                  </pre>
                </div>
              )}
              {log.new_data != null && (
                <div className="rounded-xl border bg-background p-3">
                  <p className="mb-2 text-xs font-bold text-emerald-500">DEPOIS</p>
                  <pre className="max-h-40 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-muted/50 p-2 font-mono text-[11px] leading-relaxed">
                    {formatPrettyJson(log.new_data)}
                  </pre>
                </div>
              )}
              {log.old_data == null && log.new_data == null && (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  Nenhum dado detalhado disponível.
                </p>
              )}
            </div>
          </div>
        </ScrollArea>

        {/* Copy button */}
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() =>
              copyToClipboard(
                formatPrettyJson({ antes: log.old_data, depois: log.new_data }),
                log.id
              )
            }
          >
            {copiedId === log.id ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-500" /> Copiado!
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" /> Copiar JSON
              </>
            )}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <AppLayout title="Logs de Auditoria" subtitle="Rastreie cada alteração feita no sistema">
      <div className="space-y-5 animate-in fade-in duration-500">
        {/* ── Hero header ────────────────────────────────────────────────────── */}
        <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-5 shadow-sm">
          <div className="absolute right-4 top-4 opacity-5">
            <ShieldAlert className="h-32 w-32" />
          </div>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/15 shadow-inner">
                <ShieldAlert className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Logs de Auditoria</h1>
                <p className="text-sm text-muted-foreground">
                  Acompanhe inserções, atualizações e exclusões em tempo real
                </p>
              </div>
            </div>
            <div className="flex shrink-0 gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => {
                  fetchLogs();
                  fetchStats();
                }}
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Atualizar
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 border-rose-500/30 text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950/30"
                onClick={() => setIsCleanupDialogOpen(true)}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Limpar antigos
              </Button>
            </div>
          </div>
        </div>

        {/* ── Stats cards ────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="Total" value={stats.total} action="UPDATE" loading={statsLoading} />
          <StatCard
            label="Inserções"
            value={stats.inserts}
            action="INSERT"
            loading={statsLoading}
          />
          <StatCard
            label="Atualizações"
            value={stats.updates}
            action="UPDATE"
            loading={statsLoading}
          />
          <StatCard
            label="Exclusões"
            value={stats.deletes}
            action="DELETE"
            loading={statsLoading}
          />
        </div>

        {/* ── Filters ────────────────────────────────────────────────────────── */}
        <div className="rounded-2xl border bg-card/60 p-4 shadow-sm backdrop-blur">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
            <Filter className="h-4 w-4" />
            Filtros
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="ml-auto flex items-center gap-1 rounded-lg px-2 py-0.5 text-xs font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
              >
                <X className="h-3 w-3" /> Limpar
              </button>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {/* Date range */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Data inicial
              </label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Data final
              </label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-9 text-sm"
              />
            </div>

            {/* Action filter */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Tipo de ação
              </label>
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Todas as ações" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as ações</SelectItem>
                  <SelectItem value="INSERT">Inserção</SelectItem>
                  <SelectItem value="UPDATE">Atualização</SelectItem>
                  <SelectItem value="DELETE">Exclusão</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Table filter */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Tabela
              </label>
              <Select value={tableFilter} onValueChange={setTableFilter}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Todas as tabelas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as tabelas</SelectItem>
                  {availableTables.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Apply button */}
            <div className="flex items-end">
              <Button onClick={handleFilter} className="h-9 w-full gap-2">
                <Search className="h-4 w-4" />
                Filtrar
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className="mt-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por usuário, tabela, ação ou ID…"
                className="h-9 pl-8 text-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Results count */}
          <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
            <Activity className="h-3.5 w-3.5" />
            <span>
              {loading ? (
                "Carregando…"
              ) : (
                <>
                  <span className="font-semibold text-foreground">{totalCount}</span> registros
                  encontrados
                  {filteredLogs.length !== logs.length && (
                    <>
                      {" "}
                      · <span className="font-semibold text-foreground">
                        {filteredLogs.length}
                      </span>{" "}
                      após busca local
                    </>
                  )}
                </>
              )}
            </span>
          </div>
        </div>

        {/* ── Log Table ──────────────────────────────────────────────────────── */}
        <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
          <div className="flex items-center justify-between border-b bg-muted/20 px-5 py-3">
            <div className="flex items-center gap-2 font-semibold">
              <Database className="h-4 w-4 text-muted-foreground" />
              Histórico de Alterações
            </div>
            {totalCount > 0 && (
              <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                Página {page} / {totalPages}
              </span>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/10 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3 w-3" /> Data / Hora
                    </div>
                  </th>
                  <th className="px-4 py-3">Ação</th>
                  <th className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <Database className="h-3 w-3" /> Tabela
                    </div>
                  </th>
                  <th className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <User className="h-3 w-3" /> Usuário
                    </div>
                  </th>
                  <th className="px-4 py-3 text-right">Detalhes</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loading ? (
                  Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
                ) : filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-3 text-muted-foreground">
                        <ShieldAlert className="h-10 w-10 opacity-20" />
                        <p className="text-sm">Nenhum registro de auditoria encontrado.</p>
                        {hasActiveFilters && (
                          <button
                            onClick={clearFilters}
                            className="text-xs text-primary hover:underline"
                          >
                            Limpar filtros
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => {
                    const userName = resolveUserName(log.changed_by);
                    const isSystem = !log.changed_by;

                    return (
                      <tr key={log.id} className="group transition-colors hover:bg-muted/40">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="font-medium tabular-nums">
                            {format(new Date(log.changed_at), "dd/MM/yyyy", { locale: ptBR })}
                          </div>
                          <div className="text-xs text-muted-foreground tabular-nums">
                            {format(new Date(log.changed_at), "HH:mm:ss", { locale: ptBR })}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <ActionBadge action={log.action} />
                        </td>
                        <td className="px-4 py-3">
                          <code className="rounded-md bg-muted px-1.5 py-0.5 text-xs font-mono">
                            {log.table_name}
                          </code>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {isSystem ? (
                              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                                <Database className="h-3.5 w-3.5" />
                              </div>
                            ) : (
                              <UserAvatar name={userName} />
                            )}
                            <span
                              className={`text-sm font-medium ${isSystem ? "text-muted-foreground italic" : ""}`}
                            >
                              {userName}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 gap-1.5 text-xs opacity-70 transition-opacity group-hover:opacity-100"
                            onClick={() => setSelectedLog(log)}
                          >
                            Ver diff
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalCount > 0 && (
            <div className="flex items-center justify-between border-t bg-muted/10 px-5 py-3">
              <span className="text-xs text-muted-foreground">
                Exibindo{" "}
                <span className="font-semibold text-foreground">
                  {Math.min((page - 1) * pageSize + 1, totalCount)}–
                  {Math.min(page * pageSize, totalCount)}
                </span>{" "}
                de <span className="font-semibold text-foreground">{totalCount}</span>
              </span>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const p = totalPages <= 5 ? i + 1 : Math.max(1, page - 2) + i;
                  if (p > totalPages) return null;
                  return (
                    <Button
                      key={p}
                      variant={page === p ? "default" : "outline"}
                      size="sm"
                      className="h-8 w-8 p-0 text-xs"
                      onClick={() => setPage(p)}
                    >
                      {p}
                    </Button>
                  );
                })}
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages || totalPages === 0}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Detail Dialog ──────────────────────────────────────────────────────── */}
      <Dialog open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <ShieldAlert className="h-4 w-4 text-primary" />
              Diff Visual do Log
            </DialogTitle>
            <DialogDescription>
              Comparativo detalhado dos dados antes e depois da operação.
            </DialogDescription>
          </DialogHeader>
          {selectedLog && renderAuditDetails(selectedLog)}
        </DialogContent>
      </Dialog>

      {/* ── Cleanup Dialog ────────────────────────────────────────────────────── */}
      <Dialog open={isCleanupDialogOpen} onOpenChange={setIsCleanupDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-rose-500" />
              Limpar logs antigos
            </DialogTitle>
            <DialogDescription>
              Todos os logs anteriores à data selecionada serão{" "}
              <strong className="text-rose-500">permanentemente removidos</strong>. Esta ação não
              pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <label className="text-sm font-medium">Remover logs até esta data</label>
            <Input
              type="date"
              value={cleanupDate}
              onChange={(e) => setCleanupDate(e.target.value)}
            />
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsCleanupDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleCleanupByDate} className="gap-2">
              <Trash2 className="h-3.5 w-3.5" />
              Confirmar limpeza
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
