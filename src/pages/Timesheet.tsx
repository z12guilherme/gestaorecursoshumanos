import { useState, useEffect, useRef, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { useEmployees } from "@/hooks/useEmployees";
import { format, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  XCircle,
  Coffee,
  LogIn,
  LogOut,
  MapPin,
  MessageSquare,
  Download,
  Clock,
  ChevronLeft,
  ChevronRight,
  Archive,
  Loader2,
  Users,
  AlertTriangle,
  Timer,
  CalendarDays,
  TrendingUp,
  FileSpreadsheet,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useDebounce } from "@/hooks/useDebounce";
import { timeEntryService } from "@/services/timeEntryService";
import { archiveService } from "@/services/archiveService";
import { ExceptionsPanel } from "@/components/timesheet/ExceptionsPanel";
import { LiveStatusBoard } from "@/components/timesheet/LiveStatusBoard";
import { WeeklyHeatmap } from "@/components/timesheet/WeeklyHeatmap";

interface TimeEntry {
  id: string;
  timestamp: string;
  type: "in" | "out" | "lunch_start" | "lunch_end";
  employee_id: string;
  latitude?: number;
  longitude?: number;
  notes?: string;
  employees: { name: string; department?: string } | null;
}

interface EmployeeStatus {
  id: string;
  name: string;
  department: string;
  hasRegistered: boolean;
  workedHours: string;
  totalMinutes: number;
  entryTime: string;
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
}) {
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
              {label}
            </p>
            <p className="text-2xl font-bold text-foreground">{value}</p>
            {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
          </div>
          <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl", color)}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Punch timeline badge ─────────────────────────────────────────────────────
function PunchBadge({ type, time }: { type: string; time: string }) {
  const config = {
    in: { label: "Entrada", icon: LogIn, cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    out: { label: "Saída", icon: LogOut, cls: "bg-red-50 text-red-700 border-red-200" },
    lunch_start: {
      label: "Almoço ↓",
      icon: Coffee,
      cls: "bg-amber-50 text-amber-700 border-amber-200",
    },
    lunch_end: { label: "Almoço ↑", icon: Coffee, cls: "bg-blue-50 text-blue-700 border-blue-200" },
  } as Record<string, { label: string; icon: React.ElementType; cls: string }>;

  const c = config[type] ?? {
    label: type,
    icon: Clock,
    cls: "bg-muted text-muted-foreground border-border",
  };
  const Ic = c.icon;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium",
        c.cls
      )}
    >
      <Ic className="h-3 w-3" />
      <span>{c.label}</span>
      <span className="font-semibold">{time}</span>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Timesheet() {
  const { employees, loading: loadingEmployees } = useEmployees();
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [dailyAllEntries, setDailyAllEntries] = useState<TimeEntry[]>([]);
  const [weeklyEntries, setWeeklyEntries] = useState<TimeEntry[]>([]);
  const [employeeStatus, setEmployeeStatus] = useState<EmployeeStatus[]>([]);
  const [loadingEntries, setLoadingEntries] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [filterEmployeeId, setFilterEmployeeId] = useState<string | null>(null);
  const [mapLocation, setMapLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 50;
  const parentRef = useRef<HTMLDivElement>(null);
  const debouncedDate = useDebounce(selectedDate, 500);

  const [listStartDate, setListStartDate] = useState(
    format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), "yyyy-MM-dd")
  );
  const [listEndDate, setListEndDate] = useState(
    format(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0), "yyyy-MM-dd")
  );
  const debouncedListStartDate = useDebounce(listStartDate, 500);
  const debouncedListEndDate = useDebounce(listEndDate, 500);

  const rowVirtualizer = useVirtualizer({
    count: employeeStatus.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 72,
    overscan: 5,
  });

  // ── Fetch paginated entries for display ──────────────────────────────────────
  useEffect(() => {
    async function fetchEntries() {
      setLoadingEntries(true);
      try {
        const { data, count } = await timeEntryService.getEntries(
          page,
          pageSize,
          debouncedListStartDate,
          debouncedListEndDate,
          filterEmployeeId
        );
        setEntries(data as any[]);
        setTotalCount(count);
      } catch (error) {
        console.error("Erro ao buscar registros paginados:", error);
      } finally {
        setLoadingEntries(false);
      }
    }
    fetchEntries();
  }, [debouncedListStartDate, debouncedListEndDate, page, filterEmployeeId]);

  // ── Fetch weekly heatmap data ────────────────────────────────────────────────
  useEffect(() => {
    async function fetchWeekly() {
      const end = new Date();
      const start = subDays(end, 4);
      try {
        const data = await timeEntryService.getPeriodEntries(
          format(start, "yyyy-MM-dd"),
          format(end, "yyyy-MM-dd")
        );
        setWeeklyEntries(data);
      } catch (error) {
        console.error("Erro ao buscar semanal:", error);
      }
    }
    fetchWeekly();
  }, []);

  // ── Fetch daily summary for status panel ────────────────────────────────────
  useEffect(() => {
    async function fetchDailySummary() {
      try {
        const data = await timeEntryService.getDailyEntriesForSummary(debouncedDate);
        setDailyAllEntries(data as any[]);
      } catch (error) {
        console.error("Erro ao buscar resumo diário:", error);
      }
    }
    fetchDailySummary();
  }, [debouncedDate]);

  // Reset page on filter change
  useEffect(() => {
    setPage(1);
  }, [debouncedListStartDate, debouncedListEndDate, filterEmployeeId]);

  // ── Build employee status ────────────────────────────────────────────────────
  useEffect(() => {
    const isMock =
      String(import.meta.env.VITE_USE_MOCK)
        .trim()
        .toLowerCase() === "true";
    const sourceEmployees =
      isMock && employees.length === 0
        ? [
            { id: "101", name: "Carlos Desenvolvedor", department: "TI", status: "active" },
            { id: "102", name: "Ana do Marketing", department: "Marketing", status: "active" },
            { id: "103", name: "João do Financeiro", department: "Financeiro", status: "active" },
          ]
        : employees;

    if (sourceEmployees.length > 0) {
      const active = sourceEmployees.filter((e) => e.status === "active" || e.status === "Ativo");
      const statusList: EmployeeStatus[] = active.map((emp) => {
        const empEntries = dailyAllEntries.filter((e) => e.employee_id === emp.id) as any[];
        const sorted = [...empEntries].sort(
          (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
        const inEntry = sorted.find((e) => e.type === "in");
        const totalMinutes = timeEntryService.calculateDailyMinutes(empEntries);
        return {
          id: emp.id,
          name: emp.name,
          department: emp.department || "N/A",
          hasRegistered: empEntries.length > 0,
          workedHours: timeEntryService.calculateDailyHours(empEntries),
          totalMinutes,
          entryTime: inEntry ? format(new Date(inEntry.timestamp), "HH:mm") : "-",
        };
      });
      setEmployeeStatus(statusList);
    }
  }, [employees, dailyAllEntries]);

  const loading = loadingEmployees || loadingEntries;
  const anomalies = useMemo(
    () => timeEntryService.findAnomalies(dailyAllEntries),
    [dailyAllEntries]
  );
  const currentWeekDays = useMemo(() => {
    const today = new Date();
    return [subDays(today, 4), subDays(today, 3), subDays(today, 2), subDays(today, 1), today];
  }, []);

  // ── KPI derived values ───────────────────────────────────────────────────────
  const kpi = useMemo(() => {
    const present = employeeStatus.filter((e) => e.hasRegistered).length;
    const absent = employeeStatus.length - present;
    const withHours = employeeStatus.filter((e) => e.totalMinutes > 0);
    const avgMinutes =
      withHours.length > 0
        ? Math.round(withHours.reduce((s, e) => s + e.totalMinutes, 0) / withHours.length)
        : 0;
    const avgHours =
      avgMinutes > 0
        ? `${Math.floor(avgMinutes / 60)}h ${String(avgMinutes % 60).padStart(2, "0")}m`
        : "-";
    return { present, absent, avgHours, anomalies: anomalies.length };
  }, [employeeStatus, anomalies]);

  // ── Group entries for display: by date → by employee ────────────────────────
  const groupedByDate = useMemo(() => {
    const byDate: Record<string, Record<string, TimeEntry[]>> = {};
    for (const e of entries) {
      const d = e.timestamp.split("T")[0];
      const empName = e.employees?.name || e.employee_id;
      if (!byDate[d]) byDate[d] = {};
      if (!byDate[d][empName]) byDate[d][empName] = [];
      byDate[d][empName].push(e);
    }
    return byDate;
  }, [entries]);

  const sortedDates = useMemo(
    () => Object.keys(groupedByDate).sort((a, b) => b.localeCompare(a)),
    [groupedByDate]
  );

  // ── Export ───────────────────────────────────────────────────────────────────
  const handleExport = async () => {
    setExporting(true);
    try {
      // 1. Fetch ALL records for the period (no pagination)
      const allEntries = await timeEntryService.getAllEntriesForExport(
        listStartDate,
        listEndDate,
        filterEmployeeId
      );

      // 2. Generate report with correct hours per employee/day
      const report = timeEntryService.generateTimesheetReport(allEntries as any);

      if (report.length === 0) {
        alert("Nenhum registro encontrado para o período selecionado.");
        return;
      }

      // 3. Build Excel
      const ExcelJS = await import("exceljs");
      const workbook = new ExcelJS.Workbook();
      workbook.creator = "Sistema RH";
      workbook.created = new Date();

      const ws = workbook.addWorksheet("Espelho de Ponto", {
        pageSetup: { fitToPage: true, orientation: "landscape" },
      });

      // Header row
      ws.columns = [
        { header: "Funcionário", key: "name", width: 28 },
        { header: "Departamento", key: "department", width: 20 },
        { header: "Data", key: "date", width: 13 },
        { header: "Entrada", key: "timeIn", width: 10 },
        { header: "Saída Almoço", key: "lunchStart", width: 13 },
        { header: "Volta Almoço", key: "lunchEnd", width: 13 },
        { header: "Saída", key: "timeOut", width: 10 },
        { header: "Horas Trabalhadas", key: "hoursWorked", width: 18 },
        { header: "Horas Extras", key: "overtimeStr", width: 14 },
        { header: "Status", key: "status", width: 15 },
      ];

      // Style header
      const headerRow = ws.getRow(1);
      headerRow.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
      headerRow.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1E293B" } };
      headerRow.alignment = { vertical: "middle", horizontal: "center" };
      headerRow.height = 22;

      // Add data rows
      report.forEach((row, idx) => {
        const dataRow = ws.addRow(row);
        dataRow.height = 18;
        dataRow.alignment = { vertical: "middle" };

        // Zebra striping
        const bg = idx % 2 === 0 ? "FFF8FAFC" : "FFFFFFFF";
        dataRow.fill = { type: "pattern", pattern: "solid", fgColor: { argb: bg } };

        // Highlight overtime in amber
        if (row.isOvertime) {
          dataRow.getCell("overtimeStr").font = { bold: true, color: { argb: "FFD97706" } };
          dataRow.getCell("hoursWorked").font = { bold: true, color: { argb: "FFD97706" } };
        }

        // Status color
        const statusCell = dataRow.getCell("status");
        if (row.status === "Encerrado") {
          statusCell.font = { color: { argb: "FF059669" }, bold: true };
        } else if (row.status === "Em andamento") {
          statusCell.font = { color: { argb: "FF2563EB" }, bold: true };
        } else {
          statusCell.font = { color: { argb: "FFDC2626" } };
        }
      });

      // Summary row
      ws.addRow({});
      const totalPresent = report.filter((r) => r.status !== "Não registrou").length;
      const totalOvertime = report.filter((r) => r.isOvertime).length;
      const summaryRow = ws.addRow({
        name: `Total: ${report.length} registros | Presentes: ${totalPresent} | Com hora extra: ${totalOvertime}`,
      });
      summaryRow.font = { bold: true, italic: true, size: 10, color: { argb: "FF64748B" } };

      // Borders on all data cells
      ws.eachRow({ includeEmpty: false }, (row, rowNum) => {
        if (rowNum === 1) return;
        row.eachCell({ includeEmpty: true }, (cell) => {
          cell.border = {
            top: { style: "thin", color: { argb: "FFE2E8F0" } },
            bottom: { style: "thin", color: { argb: "FFE2E8F0" } },
          };
        });
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Espelho_Ponto_${listStartDate}_a_${listEndDate}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Erro ao exportar:", error);
      alert("Falha ao gerar o relatório. Tente novamente.");
    } finally {
      setExporting(false);
    }
  };

  const handleArchiveEntries = async () => {
    if (
      !window.confirm(
        "Deseja realmente arquivar e excluir os registros de ponto com mais de 6 meses? Um arquivo CSV será baixado com o backup."
      )
    )
      return;

    setArchiving(true);
    try {
      const oldEntries = await archiveService.archiveAndDeleteColdData("time_entries", 6);
      if (oldEntries.length > 0) {
        archiveService.downloadAsCSV(oldEntries, "backup_time_entries");
        alert(
          `${oldEntries.length} registros antigos foram arquivados e removidos do banco de dados.`
        );
        setPage(1);
      } else {
        alert("Nenhum registro antigo foi encontrado para arquivamento.");
      }
    } catch (error) {
      console.error("Falha ao arquivar:", error);
      alert("Falha ao arquivar registros antigos.");
    } finally {
      setArchiving(false);
    }
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <AppLayout title="Gestão de Ponto" subtitle="Painel analítico e registros de entrada/saída">
      <div className="space-y-6">
        {/* ── KPI Cards ──────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            icon={Users}
            label="Presentes hoje"
            value={kpi.present}
            sub={`de ${employeeStatus.length} ativos`}
            color="bg-emerald-50 text-emerald-600"
          />
          <KpiCard
            icon={XCircle}
            label="Ausentes hoje"
            value={kpi.absent}
            sub="sem registro no dia"
            color="bg-red-50 text-red-500"
          />
          <KpiCard
            icon={Timer}
            label="Média de horas"
            value={kpi.avgHours}
            sub="colaboradores com registro"
            color="bg-blue-50 text-blue-600"
          />
          <KpiCard
            icon={AlertTriangle}
            label="Exceções"
            value={kpi.anomalies}
            sub="batidas incompletas"
            color={kpi.anomalies > 0 ? "bg-amber-50 text-amber-600" : "bg-slate-50 text-slate-400"}
          />
        </div>

        {/* ── Alertas + Live Status + Heatmap ───────────────────────────────── */}
        <ExceptionsPanel anomalies={anomalies} />
        <LiveStatusBoard entries={dailyAllEntries} />
        <WeeklyHeatmap entries={weeklyEntries} days={currentWeekDays} />

        {/* ── Main 2-col grid ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT — Status diário por funcionário */}
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-sm h-full">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-semibold">Status do Dia</CardTitle>
                    <CardDescription className="text-xs mt-0.5">
                      {format(new Date(selectedDate + "T12:00:00"), "dd 'de' MMMM", {
                        locale: ptBR,
                      })}
                    </CardDescription>
                  </div>
                  <CalendarDays className="h-4 w-4 text-muted-foreground" />
                </div>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="h-8 text-sm mt-2"
                />
              </CardHeader>
              <CardContent className="pt-0">
                <div ref={parentRef} className="max-h-[55vh] overflow-y-auto">
                  {loadingEmployees ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                  ) : employeeStatus.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      Nenhum funcionário ativo encontrado.
                    </p>
                  ) : (
                    <div
                      style={{ height: `${rowVirtualizer.getTotalSize()}px`, position: "relative" }}
                    >
                      {rowVirtualizer.getVirtualItems().map((vRow) => {
                        const emp = employeeStatus[vRow.index];
                        const isSelected = filterEmployeeId === emp.id;
                        const isOvertime = emp.totalMinutes > 480;
                        return (
                          <div
                            key={emp.id}
                            style={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              width: "100%",
                              height: `${vRow.size}px`,
                              transform: `translateY(${vRow.start}px)`,
                            }}
                            className="pb-2"
                          >
                            <div
                              onClick={() =>
                                setFilterEmployeeId((prev) => (prev === emp.id ? null : emp.id))
                              }
                              className={cn(
                                "flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-150",
                                isSelected
                                  ? "border-primary/40 bg-primary/5 shadow-sm"
                                  : "border-border/60 hover:border-border hover:bg-muted/40"
                              )}
                            >
                              {/* Avatar iniciais */}
                              <div
                                className={cn(
                                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                                  emp.hasRegistered
                                    ? "bg-emerald-100 text-emerald-700"
                                    : "bg-slate-100 text-slate-400"
                                )}
                              >
                                {emp.name
                                  .split(" ")
                                  .slice(0, 2)
                                  .map((n) => n[0])
                                  .join("")}
                              </div>

                              {/* Info */}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate leading-tight">
                                  {emp.name}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">
                                  {emp.department}
                                </p>
                              </div>

                              {/* Right side */}
                              <div className="text-right shrink-0">
                                {emp.hasRegistered ? (
                                  <>
                                    <p
                                      className={cn(
                                        "text-xs font-semibold",
                                        isOvertime ? "text-amber-600" : "text-emerald-600"
                                      )}
                                    >
                                      {emp.workedHours}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground">
                                      ↳ {emp.entryTime}
                                    </p>
                                  </>
                                ) : (
                                  <XCircle className="h-4 w-4 text-destructive/60" />
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT — Registros do período */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                      Registros de Ponto
                      {filterEmployeeId && (
                        <Badge variant="secondary" className="text-xs font-normal">
                          Filtrado
                          <button
                            className="ml-1 hover:text-destructive"
                            onClick={() => setFilterEmployeeId(null)}
                          >
                            ✕
                          </button>
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="text-xs mt-0.5">
                      {totalCount} registros no período
                    </CardDescription>
                  </div>

                  {/* Controls */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Date range */}
                    <div className="flex items-center gap-1.5 bg-muted/60 px-2 py-1.5 rounded-lg border border-border/60">
                      <Input
                        type="date"
                        value={listStartDate}
                        onChange={(e) => setListStartDate(e.target.value)}
                        className="w-[118px] h-7 text-xs border-0 bg-transparent p-0 focus-visible:ring-0"
                      />
                      <span className="text-muted-foreground text-xs">→</span>
                      <Input
                        type="date"
                        value={listEndDate}
                        onChange={(e) => setListEndDate(e.target.value)}
                        className="w-[118px] h-7 text-xs border-0 bg-transparent p-0 focus-visible:ring-0"
                      />
                    </div>

                    <Button
                      size="sm"
                      onClick={handleExport}
                      disabled={exporting}
                      className="h-8 gap-1.5 text-xs"
                    >
                      {exporting ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <FileSpreadsheet className="h-3.5 w-3.5" />
                      )}
                      {exporting ? "Gerando..." : "Exportar Excel"}
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleArchiveEntries}
                      disabled={archiving}
                      className="h-8 gap-1.5 text-xs"
                    >
                      {archiving ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Archive className="h-3.5 w-3.5" />
                      )}
                      Arquivar
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                {loadingEntries ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-3">
                    <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Carregando registros...</p>
                  </div>
                ) : sortedDates.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-14 gap-2">
                    <Clock className="h-10 w-10 text-muted-foreground/30" />
                    <p className="text-sm font-medium text-muted-foreground">
                      Nenhum registro no período
                    </p>
                    <p className="text-xs text-muted-foreground/70">
                      Selecione um intervalo de datas diferente
                    </p>
                  </div>
                ) : (
                  <div className="space-y-5 max-h-[65vh] overflow-y-auto pr-1">
                    {sortedDates.map((date) => {
                      const empMap = groupedByDate[date];
                      const dateLabel = format(new Date(date + "T12:00:00"), "EEEE, dd 'de' MMMM", {
                        locale: ptBR,
                      });
                      return (
                        <div key={date}>
                          {/* Date header */}
                          <div className="flex items-center gap-3 mb-3">
                            <div className="flex items-center gap-2">
                              <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide capitalize">
                                {dateLabel}
                              </span>
                            </div>
                            <div className="flex-1 h-px bg-border/60" />
                            <Badge variant="outline" className="text-[10px] h-5">
                              {Object.keys(empMap).length} funcionários
                            </Badge>
                          </div>

                          {/* Employee rows */}
                          <div className="space-y-2">
                            {Object.entries(empMap).map(([empName, empEntries]) => {
                              const sorted = [...empEntries].sort(
                                (a, b) =>
                                  new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
                              );
                              const hours = timeEntryService.calculateDailyHours(empEntries as any);
                              const mins = timeEntryService.calculateDailyMinutes(
                                empEntries as any
                              );
                              const isOT = mins > 480;
                              const dept = empEntries[0]?.employees?.department || "";

                              return (
                                <div
                                  key={empName}
                                  className="rounded-xl border border-border/60 bg-card p-3 hover:border-border transition-colors"
                                >
                                  {/* Employee header */}
                                  <div className="flex items-center justify-between mb-2.5">
                                    <div className="flex items-center gap-2">
                                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                                        {empName
                                          .split(" ")
                                          .slice(0, 2)
                                          .map((n) => n[0])
                                          .join("")}
                                      </div>
                                      <div>
                                        <p className="text-sm font-medium leading-tight">
                                          {empName}
                                        </p>
                                        {dept && (
                                          <p className="text-[10px] text-muted-foreground">
                                            {dept}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                    {hours !== "-" && (
                                      <div className="text-right">
                                        <div
                                          className={cn(
                                            "flex items-center gap-1 text-xs font-semibold",
                                            isOT ? "text-amber-600" : "text-emerald-600"
                                          )}
                                        >
                                          {isOT && <TrendingUp className="h-3 w-3" />}
                                          <Clock className="h-3 w-3" />
                                          {hours}
                                        </div>
                                        {isOT && (
                                          <p className="text-[10px] text-amber-500/80 text-right">
                                            hora extra
                                          </p>
                                        )}
                                      </div>
                                    )}
                                  </div>

                                  {/* Punch timeline */}
                                  <div className="flex flex-wrap items-center gap-1.5">
                                    {sorted.map((entry, i) => (
                                      <div key={entry.id} className="flex items-center gap-1">
                                        <PunchBadge
                                          type={entry.type}
                                          time={format(new Date(entry.timestamp), "HH:mm")}
                                        />
                                        {i < sorted.length - 1 && (
                                          <div className="h-px w-3 bg-border/60" />
                                        )}
                                      </div>
                                    ))}
                                    {/* Location + notes */}
                                    {sorted.some((e) => e.latitude != null) && (
                                      <button
                                        className="inline-flex items-center gap-1 text-[10px] text-blue-500 hover:underline ml-1"
                                        onClick={() => {
                                          const e = sorted.find((e) => e.latitude != null);
                                          if (e?.latitude && e?.longitude)
                                            setMapLocation({ lat: e.latitude, lng: e.longitude });
                                        }}
                                      >
                                        <MapPin className="h-3 w-3" />
                                        GPS
                                      </button>
                                    )}
                                    {sorted.some((e) => e.notes) && (
                                      <span
                                        className="inline-flex items-center gap-1 text-[10px] text-muted-foreground ml-1"
                                        title={sorted.find((e) => e.notes)?.notes}
                                      >
                                        <MessageSquare className="h-3 w-3" />
                                        nota
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}

                    {/* Pagination */}
                    <div className="flex items-center justify-between pt-3 border-t border-border/60">
                      <p className="text-xs text-muted-foreground">
                        {entries.length} de {totalCount} registros
                      </p>
                      <div className="flex items-center gap-1.5">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => setPage((p) => Math.max(1, p - 1))}
                          disabled={page === 1}
                        >
                          <ChevronLeft className="h-3.5 w-3.5" />
                        </Button>
                        <span className="text-xs font-medium px-1">
                          {page} / {Math.ceil(totalCount / pageSize) || 1}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() =>
                            setPage((p) => (p < Math.ceil(totalCount / pageSize) ? p + 1 : p))
                          }
                          disabled={page >= Math.ceil(totalCount / pageSize) || totalCount === 0}
                        >
                          <ChevronRight className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* ── Map Dialog ─────────────────────────────────────────────────────── */}
      <Dialog open={!!mapLocation} onOpenChange={() => setMapLocation(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Localização do Registro</DialogTitle>
          </DialogHeader>
          <div className="aspect-video w-full bg-muted rounded-xl overflow-hidden border border-border">
            {mapLocation && (
              <iframe
                width="100%"
                height="100%"
                src={`https://maps.google.com/maps?q=${mapLocation.lat},${mapLocation.lng}&z=15&output=embed`}
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
              />
            )}
          </div>
          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={() =>
                window.open(
                  `https://www.google.com/maps?q=${mapLocation?.lat},${mapLocation?.lng}`,
                  "_blank"
                )
              }
            >
              <MapPin className="h-4 w-4 mr-2" />
              Abrir no Google Maps
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
