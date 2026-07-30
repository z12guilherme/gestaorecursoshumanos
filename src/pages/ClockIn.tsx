import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Employee } from "@/types/hr";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { format, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  LogIn,
  LogOut,
  ArrowLeft,
  Megaphone,
  Pin,
  FileText,
  Download,
  LifeBuoy,
  Search,
  Copy,
  Check,
  MessageSquare,
  KeyRound,
  Clock,
  Calendar,
  IdCard,
} from "lucide-react";
import { useEmployees } from "@/hooks/useEmployees";
import { useCommunication } from "@/hooks/useCommunication";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/lib/supabase";
import { useDocuments } from "@/hooks/useDocuments";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { PayslipButton } from "@/components/PayslipButton";
import { PayslipViewerModal } from "@/components/PayslipViewerModal";
import { EmployeeBadge } from "@/components/EmployeeBadge";
import { offlineDb } from "@/lib/offlineDb";
import { DEFAULT_EMPLOYEE_PORTAL_NAME } from "@/lib/branding";
import { useThrottle } from "@/hooks/useDebounce";

export default function ClockInPage() {
  const { employees } = useEmployees();
  const { announcements } = useCommunication();

  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const { toast } = useToast();
  const navigate = useNavigate();
  const [companySettings, setCompanySettings] = useState<any>({
    company_name: "",
    cnpj: "",
  });

  // Documents State
  const [showDocumentsDialog, setShowDocumentsDialog] = useState(false);
  const [identifiedEmployee, setIdentifiedEmployee] = useState<Employee | null>(null);
  const [isPayslipViewerOpen, setIsPayslipViewerOpen] = useState(false);
  const { documents } = useDocuments(identifiedEmployee?.id);

  // Badge State
  const [showBadgeDialog, setShowBadgeDialog] = useState(false);
  const [badgeEmployee, setBadgeEmployee] = useState<Employee | null>(null);

  // Support States
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [supportTab, setSupportTab] = useState("new");
  const [newTicket, setNewTicket] = useState({ name: "", title: "", description: "" });
  const [createdTicketNum, setCreatedTicketNum] = useState<string | null>(null);
  const [trackTicketNum, setTrackTicketNum] = useState("");
  const [trackedTicket, setTrackedTicket] = useState<any | null>(null);
  const [loadingSupport, setLoadingSupport] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    async function fetchSettings() {
      const { data } = await supabase
        .from("settings")
        .select("company_name, cnpj, avatar_url")
        .maybeSingle();
      if (data) setCompanySettings((prev: any) => ({ ...prev, ...data }));
    }
    fetchSettings();
    return () => clearInterval(timer);
  }, []);

  // Sincronização Offline Automática
  useEffect(() => {
    const syncOfflineEntries = async () => {
      if (!navigator.onLine) return;

      const pending = await offlineDb.getPendingEntries();
      if (pending.length > 0) {
        toast({
          title: "Sincronizando...",
          description: `Enviando ${pending.length} registros offline para o servidor.`,
        });
        for (const entry of pending) {
          const { id, ...entryData } = entry;
          const { error } = await supabase.from("time_entries").insert(entryData);
          if (!error && id) {
            await offlineDb.deleteEntry(id);
          }
        }
        toast({
          title: "Sincronização Concluída!",
          description: "Todos os registros offline foram enviados com sucesso.",
          className: "bg-emerald-600 text-white border-none",
        });
      }
    };

    window.addEventListener("online", syncOfflineEntries);
    syncOfflineEntries(); // Tenta sincronizar ao abrir a tela se estiver online
    return () => window.removeEventListener("online", syncOfflineEntries);
  }, []);

  const getEmployeeByPin = async (inputPin: string) => {
    // 1. Tenta encontrar na lista carregada (se disponível)
    const employee = employees.find((e) => e.password === inputPin);
    if (employee) return employee;

    try {
      // 2. Tenta via RPC (Bypass de RLS seguro para Anon)
      const { data: rpcData, error: rpcError } = await supabase.rpc("get_employee_by_pin", {
        pin_input: inputPin,
      });
      if (!rpcError && rpcData && rpcData.length > 0) return rpcData[0];

      // 3. Tenta via Query Direta (Fallback)
      const { data } = await supabase
        .from("employees")
        .select("*")
        .eq("password", inputPin)
        .maybeSingle();

      if (data) return data;
    } catch (err) {
      console.error("Erro ao buscar funcionário:", err);
    }

    toast({
      title: "Acesso Negado",
      description: "Senha não encontrada. Verifique suas credenciais.",
      variant: "destructive",
    });
    return null;
  };

  const handleClockActionRaw = async (type: "in" | "out") => {
    if (!pin) return;
    setLoading(true);

    const employee = await getEmployeeByPin(pin);
    if (!employee) {
      setLoading(false);
      setPin("");
      return;
    }

    // Validação de sequência de ponto
    if (navigator.onLine) {
      try {
        const { data: lastEntry } = await supabase
          .from("time_entries")
          .select("type, timestamp")
          .eq("employee_id", employee.id)
          .order("timestamp", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (lastEntry) {
          const lastEntryDate = new Date(lastEntry.timestamp);
          const today = new Date();
          const isSameDay =
            lastEntryDate.getDate() === today.getDate() &&
            lastEntryDate.getMonth() === today.getMonth() &&
            lastEntryDate.getFullYear() === today.getFullYear();

          const isLastIn = lastEntry.type === "in" || lastEntry.type === "lunch_end";
          const isLastOut = lastEntry.type === "out" || lastEntry.type === "lunch_start";

          if (isSameDay) {
            const diffMinutes = (today.getTime() - lastEntryDate.getTime()) / (1000 * 60);
            if (diffMinutes < 1) {
              toast({
                title: "Aguarde um momento",
                description: "Ponto já registrado. Aguarde pelo menos 1 minuto para novo registro.",
                variant: "destructive",
              });
              setLoading(false);
              setPin("");
              return;
            }

            // Validação de alternância (Entrada -> Saída) apenas no mesmo dia, flexibilizando plantões
            if ((type === "in" && isLastIn) || (type === "out" && isLastOut)) {
              toast({
                title: "Ação Inválida",
                description: `Você já possui um registro de ${isLastIn ? "entrada" : "saída"} hoje. A próxima ação deve ser de ${isLastIn ? "saída" : "entrada"}.`,
                variant: "destructive",
              });
              setLoading(false);
              setPin("");
              return;
            }
          }
        }
      } catch (err) {
        console.warn("Modo offline ou erro de rede: ignorando validação restrita de sequência.");
      }
    }

    // Captura Geolocalização
    let locationData: { latitude?: number; longitude?: number } = {};

    toast({
      title: "Obtendo localização...",
      description: "Aguarde enquanto capturamos sua posição GPS.",
      duration: 2000,
    });

    try {
      if (!("geolocation" in navigator)) {
        toast({
          title: "Erro",
          description: "Geolocalização não é suportada neste navegador.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
        });
      });
      locationData = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
    } catch (error: any) {
      let errorMessage = "Localização não obtida. É necessário ativar o GPS.";
      if (error.code === 1) errorMessage = "Permissão de localização negada.";
      else if (error.code === 2) errorMessage = "Sinal de GPS indisponível.";
      else if (error.code === 3) errorMessage = "Tempo esgotado ao buscar localização.";

      console.error("Erro ao obter localização:", error);
      toast({ title: "Erro de Localização", description: errorMessage, variant: "destructive" });
      setLoading(false);
      return;
    }

    const entryData = {
      employee_id: employee.id,
      timestamp: new Date().toISOString(),
      type,
      ...locationData,
    };

    if (navigator.onLine) {
      const { error } = await supabase.from("time_entries").insert(entryData);
      if (error) {
        toast({
          title: "Erro",
          description: "Falha ao registrar ponto no servidor.",
          variant: "destructive",
        });
      } else {
        toast({
          title: `Ponto Registrado!`,
          description: `${employee.name} - ${type === "in" ? "Entrada" : "Saída"} às ${format(new Date(), "HH:mm")}.`,
          className: "bg-green-600 text-white border-none",
        });
      }
    } else {
      // Salva localmente via IndexedDB se estiver sem internet
      await offlineDb.saveEntry(entryData);
      toast({
        title: `Ponto Salvo Offline 📡`,
        description: `${employee.name} - ${type === "in" ? "Entrada" : "Saída"} guardado. Será enviado quando a conexão voltar.`,
        className: "bg-amber-500 text-white border-none",
      });
    }

    setLoading(false);
    setPin("");
  };

  // Throttle de 5s no registro de ponto para evitar duplos cliques acidentais
  // e garantir que o colaborador aguarde entre batidas
  const handleClockAction = useThrottle(handleClockActionRaw, 5000);

  const handleAccessDocuments = async () => {
    if (!pin) {
      toast({
        title: "PIN Obrigatório",
        description: "Digite seu PIN de 4 dígitos para acessar.",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    const employee = await getEmployeeByPin(pin);

    if (employee) {
      setIdentifiedEmployee(employee);
      setShowDocumentsDialog(true);
      setPin("");
    }
    setLoading(false);
  };

  const handleAccessBadge = async () => {
    if (!pin) {
      toast({
        title: "PIN Obrigatório",
        description: "Digite seu PIN de 4 dígitos para ver o crachá.",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    const employee = await getEmployeeByPin(pin);

    if (employee) {
      setBadgeEmployee(employee);
      setShowBadgeDialog(true);
      setPin("");
    }
    setLoading(false);
  };

  const handleCreateTicket = async () => {
    if (!newTicket.name || !newTicket.title || !newTicket.description) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }

    setLoadingSupport(true);
    const ticketNum = Math.random().toString(36).substr(2, 8).toUpperCase();

    const { error } = await supabase.from("tickets").insert({
      ticket_num: ticketNum,
      employee_name: newTicket.name,
      title: newTicket.title,
      description: newTicket.description,
      status: "open",
      priority: "medium",
    });

    setLoadingSupport(false);

    if (error) {
      toast({ title: "Erro", description: "Falha ao abrir chamado.", variant: "destructive" });
    } else {
      setCreatedTicketNum(ticketNum);
      setNewTicket({ name: "", title: "", description: "" });
      toast({ title: "Chamado Aberto!", description: "Guarde seu número de protocolo." });
    }
  };

  const handleTrackTicket = async () => {
    if (!trackTicketNum) return;
    setLoadingSupport(true);

    const { data, error } = await supabase
      .from("tickets")
      .select("*")
      .eq("ticket_num", trackTicketNum.toUpperCase())
      .maybeSingle();

    setLoadingSupport(false);

    if (error) {
      toast({ title: "Erro", description: "Erro ao buscar chamado.", variant: "destructive" });
    } else if (!data) {
      toast({
        title: "Não encontrado",
        description: "Nenhum chamado encontrado com este número.",
        variant: "destructive",
      });
      setTrackedTicket(null);
    } else {
      setTrackedTicket(data);
    }
  };

  // PIN dot indicator helper
  const pinDots = Array.from({ length: 4 }, (_, i) => i < pin.length);

  return (
    <div
      className="min-h-screen flex flex-col font-sans"
      style={{
        background: "linear-gradient(160deg, #f0f4ff 0%, #e8effe 50%, #f5f3ff 100%)",
      }}
    >
      {/* Decorative blobs – subtle on light bg */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div
          className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full opacity-30"
          style={{
            background: "radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full opacity-20"
          style={{
            background: "radial-gradient(circle, rgba(59,130,246,0.18) 0%, transparent 70%)",
          }}
        />
      </div>

      {/* ── TOP BAR ─────────────────────────────── */}
      <header
        className="relative z-20 flex items-center justify-between px-6"
        style={{
          background: "rgba(255,255,255,0.80)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(99,102,241,0.12)",
          height: "72px",
          boxShadow: "0 1px 20px rgba(99,102,241,0.08)",
        }}
      >
        {/* Logo & Company */}
        <div className="flex items-center gap-3">
          <div
            className="h-11 w-11 rounded-xl flex items-center justify-center text-white font-extrabold text-sm shadow-md"
            style={{ background: "linear-gradient(135deg, #6366f1 0%, #3b82f6 100%)" }}
          >
            {companySettings?.company_name
              ? companySettings.company_name.substring(0, 3).toUpperCase()
              : "HOS"}
          </div>
          <div>
            <h1 className="font-bold text-slate-800 text-base leading-tight">
              {companySettings?.company_name || DEFAULT_EMPLOYEE_PORTAL_NAME}
            </h1>
            <p className="text-xs text-indigo-500">Portal do Colaborador</p>
          </div>
        </div>

        {/* Clock (desktop) */}
        <div className="hidden md:flex flex-col items-end">
          <span
            className="text-2xl font-black font-mono tracking-tight"
            style={{
              background: "linear-gradient(90deg, #6366f1, #3b82f6)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {format(currentTime, "HH:mm")}
          </span>
          <span className="text-xs text-slate-500 capitalize">
            {format(currentTime, "EEEE, d 'de' MMMM", { locale: ptBR })}
          </span>
        </div>
      </header>

      {/* ── MAIN CONTENT ────────────────────────── */}
      <main className="relative z-10 flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ── LEFT COLUMN (7 cols) ─────────────── */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          {/* Hero / Clock Card */}
          <div
            className="rounded-2xl p-7 relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #6366f1 0%, #3b82f6 100%)",
              boxShadow: "0 12px 40px rgba(99,102,241,0.30)",
            }}
          >
            {/* Decorative ring */}
            <div
              className="absolute -top-20 -right-20 w-72 h-72 rounded-full opacity-10"
              style={{ border: "60px solid white" }}
            />
            <div className="absolute top-6 right-6 opacity-10" aria-hidden="true">
              <Clock className="w-28 h-28 text-white" />
            </div>

            <p className="text-indigo-100 text-sm font-medium mb-1">Bem-vindo ao seu portal</p>
            <h2 className="text-white text-3xl md:text-4xl font-black mb-7 leading-snug">
              O que você deseja
              <br />
              fazer hoje?
            </h2>

            <div className="flex flex-wrap gap-3">
              {/* Date chip */}
              <div
                className="flex items-center gap-3 rounded-xl px-4 py-3"
                style={{
                  background: "rgba(255,255,255,0.18)",
                  border: "1px solid rgba(255,255,255,0.25)",
                }}
              >
                <div className="p-2 rounded-lg" style={{ background: "rgba(255,255,255,0.20)" }}>
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-indigo-100 text-xs">Data de Hoje</p>
                  <p className="text-white font-bold">{format(currentTime, "dd/MM/yyyy")}</p>
                </div>
              </div>

              {/* Time chip */}
              <div
                className="flex items-center gap-3 rounded-xl px-4 py-3"
                style={{
                  background: "rgba(255,255,255,0.18)",
                  border: "1px solid rgba(255,255,255,0.25)",
                }}
              >
                <div className="p-2 rounded-lg" style={{ background: "rgba(255,255,255,0.20)" }}>
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-blue-100 text-xs">Hora Atual</p>
                  <p className="text-white font-bold font-mono">
                    {format(currentTime, "HH:mm:ss")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* PIN & Actions Card */}
          <div
            className="rounded-2xl p-6 flex-1"
            style={{
              background: "rgba(255,255,255,0.90)",
              border: "1px solid rgba(99,102,241,0.10)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              boxShadow: "0 4px 30px rgba(99,102,241,0.08)",
            }}
          >
            {/* Section label */}
            <div className="flex items-center gap-2 mb-5">
              <div className="p-2 rounded-lg" style={{ background: "rgba(99,102,241,0.10)" }}>
                <KeyRound className="w-4 h-4 text-indigo-500" />
              </div>
              <div>
                <p className="text-slate-800 font-bold text-base">Acesso Rápido</p>
                <p className="text-slate-500 text-xs">Digite seu PIN para liberar as ações</p>
              </div>
            </div>

            {/* PIN input */}
            <div className="max-w-xs mx-auto mb-6">
              <input
                type="password"
                placeholder="Digite seu PIN (4 dígitos)"
                className="w-full text-center text-2xl tracking-[0.5em] font-bold h-14 rounded-xl px-4 outline-none transition-all placeholder:text-sm placeholder:tracking-normal placeholder:font-normal placeholder:text-slate-400"
                style={{
                  background: "#f8faff",
                  border: pin.length > 0 ? "2px solid #6366f1" : "2px solid #e2e8f0",
                  color: "#1e293b",
                  boxShadow: pin.length > 0 ? "0 0 0 4px rgba(99,102,241,0.12)" : "none",
                }}
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                disabled={loading}
              />
              {/* Dot indicators */}
              <div className="flex justify-center gap-3 mt-3">
                {pinDots.map((filled, i) => (
                  <div
                    key={i}
                    className="w-3 h-3 rounded-full transition-all duration-200"
                    style={{
                      background: filled ? "linear-gradient(135deg, #6366f1, #3b82f6)" : "#e2e8f0",
                      boxShadow: filled ? "0 0 8px rgba(99,102,241,0.45)" : "none",
                      transform: filled ? "scale(1.2)" : "scale(1)",
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Primary action buttons */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <button
                className="h-24 flex flex-col items-center justify-center gap-2 rounded-xl transition-all duration-200 active:scale-95 disabled:opacity-50 group"
                style={{
                  background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
                  border: "2px solid #86efac",
                  boxShadow: "0 4px 16px rgba(16,185,129,0.12)",
                }}
                onClick={() => handleClockAction("in")}
                disabled={loading}
              >
                <div
                  className="p-2 rounded-lg transition-all duration-200 group-hover:scale-110"
                  style={{ background: "rgba(16,185,129,0.15)" }}
                >
                  <LogIn className="w-6 h-6 text-emerald-600" />
                </div>
                <span className="text-emerald-700 font-bold text-base">Registrar Entrada</span>
              </button>

              <button
                className="h-24 flex flex-col items-center justify-center gap-2 rounded-xl transition-all duration-200 active:scale-95 disabled:opacity-50 group"
                style={{
                  background: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)",
                  border: "2px solid #fcd34d",
                  boxShadow: "0 4px 16px rgba(245,158,11,0.12)",
                }}
                onClick={() => handleClockAction("out")}
                disabled={loading}
              >
                <div
                  className="p-2 rounded-lg transition-all duration-200 group-hover:scale-110"
                  style={{ background: "rgba(245,158,11,0.15)" }}
                >
                  <LogOut className="w-6 h-6 text-amber-600" />
                </div>
                <span className="text-amber-700 font-bold text-base">Registrar Saída</span>
              </button>
            </div>

            {/* Secondary buttons */}
            <div className="grid grid-cols-3 gap-3">
              {[
                {
                  icon: <FileText className="w-5 h-5" />,
                  label: "Documentos",
                  onClick: handleAccessDocuments,
                },
                {
                  icon: <IdCard className="w-5 h-5" />,
                  label: "Crachá",
                  onClick: handleAccessBadge,
                },
                {
                  icon: <LifeBuoy className="w-5 h-5" />,
                  label: "Suporte",
                  onClick: () => setIsSupportOpen(true),
                },
              ].map(({ icon, label, onClick }) => (
                <button
                  key={label}
                  className="h-14 flex items-center justify-center gap-2 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-[1.02] active:scale-95"
                  style={{
                    background: "#f8faff",
                    border: "1px solid #e2e8f0",
                    color: "#475569",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = "#eef2ff";
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "#a5b4fc";
                    (e.currentTarget as HTMLButtonElement).style.color = "#4f46e5";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = "#f8faff";
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "#e2e8f0";
                    (e.currentTarget as HTMLButtonElement).style.color = "#475569";
                  }}
                  onClick={onClick}
                >
                  {icon}
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN (5 cols) ────────────── */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          {/* Announcements */}
          <div
            className="flex-1 rounded-2xl flex flex-col overflow-hidden"
            style={{
              background: "rgba(255,255,255,0.90)",
              border: "1px solid rgba(99,102,241,0.10)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              boxShadow: "0 4px 30px rgba(99,102,241,0.08)",
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: "1px solid #f1f5f9" }}
            >
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg" style={{ background: "rgba(99,102,241,0.10)" }}>
                  <Megaphone className="w-4 h-4 text-indigo-500" />
                </div>
                <span className="text-slate-800 font-bold">Mural de Avisos</span>
              </div>
              <span
                className="text-xs font-bold px-2.5 py-1 rounded-full"
                style={{
                  background: "#eef2ff",
                  color: "#4f46e5",
                  border: "1px solid #c7d2fe",
                }}
              >
                {announcements.length} Novos
              </span>
            </div>

            {/* Scroll content */}
            <ScrollArea className="flex-1 h-[460px]">
              <div className="p-5 space-y-4">
                {/* Pinned notice */}
                <div
                  className="rounded-xl p-4 relative overflow-hidden"
                  style={{
                    background: "linear-gradient(135deg, #eff6ff 0%, #eef2ff 100%)",
                    border: "1px solid #bfdbfe",
                  }}
                >
                  <div className="absolute top-3 right-3">
                    <Pin className="w-3.5 h-3.5 text-indigo-400 fill-indigo-400" />
                  </div>
                  <h4 className="font-bold text-blue-800 mb-2 pr-5 text-sm">
                    Como acessar seu Holerite?
                  </h4>
                  <p className="text-xs text-blue-700/80 leading-relaxed">
                    Digite sua senha no painel ao lado e clique em "Meus Documentos". Você poderá
                    visualizar, assinar e baixar seu contra cheque do mês anterior instantaneamente
                    (Verifique com o RH se foram feitas as atualizações mensais).
                  </p>
                </div>

                {announcements.map((announcement) => (
                  <div
                    key={announcement.id}
                    className="rounded-xl p-4 transition-all duration-200 cursor-default"
                    style={{
                      background: "#ffffff",
                      border: "1px solid #f1f5f9",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLDivElement).style.borderColor = "#c7d2fe";
                      (e.currentTarget as HTMLDivElement).style.boxShadow =
                        "0 4px 16px rgba(99,102,241,0.10)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLDivElement).style.borderColor = "#f1f5f9";
                      (e.currentTarget as HTMLDivElement).style.boxShadow =
                        "0 1px 4px rgba(0,0,0,0.04)";
                    }}
                  >
                    <div className="flex justify-between items-start mb-1.5">
                      <h4 className="font-semibold text-slate-800 text-sm">{announcement.title}</h4>
                      {announcement.priority === "high" && (
                        <span
                          className="w-2 h-2 rounded-full bg-red-500 shrink-0 mt-1"
                          title="Alta Prioridade"
                        />
                      )}
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed mb-3">
                      {announcement.content}
                    </p>
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>
                        {format(new Date(announcement.created_at), "d 'de' MMM", { locale: ptBR })}
                      </span>
                      <span>{announcement.author || "RH"}</span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Admin link */}
          <div className="text-center">
            <button
              className="text-slate-400 hover:text-slate-600 text-xs flex items-center gap-1 mx-auto transition-colors duration-200"
              onClick={() => navigate("/entrar")}
            >
              <ArrowLeft className="h-3 w-3" />
              Acesso Administrativo
            </button>
          </div>
        </div>
      </main>

      <PayslipViewerModal
        open={isPayslipViewerOpen}
        onOpenChange={setIsPayslipViewerOpen}
        employee={identifiedEmployee as any}
        referenceDate={subMonths(new Date(), 1)}
      />

      {/* Dialog de Documentos */}
      <Dialog open={showDocumentsDialog} onOpenChange={setShowDocumentsDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Documentos de {identifiedEmployee?.name}</DialogTitle>
            <DialogDescription>Visualize ou baixe seus documentos.</DialogDescription>
          </DialogHeader>

          {identifiedEmployee && (
            <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg flex items-center justify-between border border-blue-100 dark:border-blue-900 mt-4">
              <div className="flex flex-col">
                <span className="font-medium text-blue-900 dark:text-blue-300">Contra Cheque</span>
                <span className="text-xs text-blue-700 dark:text-blue-400">Mês Anterior</span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setIsPayslipViewerOpen(true)}>
                  Visualizar
                </Button>
                <PayslipButton
                  employee={identifiedEmployee as any}
                  referenceDate={subMonths(new Date(), 1)}
                />
              </div>
            </div>
          )}

          <div className="py-4">
            <h4 className="text-sm font-medium mb-2 text-muted-foreground">Outros Arquivos</h4>
            <ScrollArea className="h-[300px] pr-4">
              {documents.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  <FileText className="h-10 w-10 mx-auto mb-2 opacity-20" />
                  <p>Nenhum documento disponível.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="bg-primary/10 p-2 rounded-md">
                          <FileText className="h-4 w-4 text-primary" />
                        </div>
                        <span className="text-sm font-medium truncate">{doc.name}</span>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => window.open(doc.url, "_blank")}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowDocumentsDialog(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog do Crachá */}
      <Dialog open={showBadgeDialog} onOpenChange={setShowBadgeDialog}>
        <DialogContent className="sm:max-w-sm flex flex-col items-center justify-center p-8 bg-slate-50/95 dark:bg-slate-900/95 border-none shadow-2xl rounded-2xl">
          {badgeEmployee && (
            <EmployeeBadge
              employee={badgeEmployee}
              companyName={companySettings?.company_name || undefined}
              companyLogo={companySettings?.avatar_url || undefined}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog de Suporte */}
      <Dialog open={isSupportOpen} onOpenChange={setIsSupportOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Central de Atendimento ao Colaborador</DialogTitle>
            <DialogDescription>
              Abra um chamado para o RH ou consulte o status de uma solicitação.
            </DialogDescription>
          </DialogHeader>

          <Tabs value={supportTab} onValueChange={setSupportTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="new">Abrir Chamado</TabsTrigger>
              <TabsTrigger value="track">Consultar Status</TabsTrigger>
            </TabsList>

            <TabsContent value="new" className="space-y-4 py-4">
              {!createdTicketNum ? (
                <>
                  <div className="space-y-2">
                    <Label>Seu Nome</Label>
                    <Input
                      placeholder="Digite seu nome completo"
                      value={newTicket.name}
                      onChange={(e) => setNewTicket({ ...newTicket, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Assunto</Label>
                    <Input
                      placeholder="Ex: Dúvida sobre holerite"
                      value={newTicket.title}
                      onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Descrição</Label>
                    <Textarea
                      placeholder="Descreva sua solicitação..."
                      value={newTicket.description}
                      onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                    />
                  </div>
                  <Button className="w-full" onClick={handleCreateTicket} disabled={loadingSupport}>
                    {loadingSupport ? "Enviando..." : "Abrir Chamado"}
                  </Button>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 space-y-4 text-center">
                  <div className="h-12 w-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                    <Check className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Chamado Aberto com Sucesso!</h3>
                    <p className="text-sm text-muted-foreground">
                      Guarde o número abaixo para consultar o status.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 bg-secondary p-3 rounded-md border">
                    <span className="text-xl font-mono font-bold tracking-wider">
                      {createdTicketNum}
                    </span>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        navigator.clipboard.writeText(createdTicketNum);
                        toast({ title: "Copiado!" });
                      }}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setCreatedTicketNum(null);
                      setSupportTab("track");
                    }}
                  >
                    Consultar Status
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="track" className="space-y-4 py-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Digite o número do protocolo (Ex: X7Y2Z9)"
                  value={trackTicketNum}
                  onChange={(e) => setTrackTicketNum(e.target.value)}
                  className="uppercase"
                />
                <Button onClick={handleTrackTicket} disabled={loadingSupport}>
                  <Search className="h-4 w-4" />
                </Button>
              </div>

              {trackedTicket && (
                <div className="bg-secondary/20 border rounded-lg p-4 space-y-3 animate-in fade-in-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold">{trackedTicket.title}</h4>
                      <p className="text-xs text-muted-foreground">
                        Aberto em {format(new Date(trackedTicket.created_at), "dd/MM/yyyy HH:mm")}
                      </p>
                    </div>
                    <Badge variant={trackedTicket.status === "resolved" ? "default" : "secondary"}>
                      {trackedTicket.status === "open"
                        ? "Aberto"
                        : trackedTicket.status === "in_progress"
                          ? "Em Andamento"
                          : trackedTicket.status === "resolved"
                            ? "Resolvido"
                            : "Fechado"}
                    </Badge>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium text-muted-foreground">Sua mensagem:</span>
                    <p className="mt-1">{trackedTicket.description}</p>
                  </div>
                  {trackedTicket.hr_notes && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded border border-blue-100 dark:border-blue-800 text-sm">
                      <span className="font-medium text-blue-700 dark:text-blue-300 flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" /> Resposta do RH:
                      </span>
                      <p className="mt-1 text-blue-900 dark:text-blue-100">
                        {trackedTicket.hr_notes}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}
