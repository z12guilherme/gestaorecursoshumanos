import { useState, useEffect, useCallback } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { managerPortalService } from "@/services/managerPortalService";
import {
  ManagerProtocol,
  ManagerTicket,
  ProtocolReply,
  ProtocolPriority,
  ProtocolCategory,
  TicketTarget,
} from "@/types/manager";
import { toast } from "sonner";
import {
  Briefcase,
  Inbox,
  Send,
  FilePlus2,
  LifeBuoy,
  Bell,
  CheckCheck,
  Clock,
  ChevronDown,
  ChevronUp,
  Users,
  TrendingUp,
  AlertTriangle,
  Shield,
  Loader2,
  Tag,
  MessageSquare,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useEmployees } from "@/hooks/useEmployees";
import emailjs from '@emailjs/browser';

// ─────────────────────────────────────────────────────────────
// Helpers de apresentação
// ─────────────────────────────────────────────────────────────

const PRIORITY_LABELS: Record<ProtocolPriority, string> = {
  low: "Baixa",
  normal: "Normal",
  high: "Alta",
  urgent: "Urgente",
};

const PRIORITY_COLORS: Record<ProtocolPriority, string> = {
  low: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-500/20 dark:text-slate-300 dark:border-slate-500/30",
  normal: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/30",
  high: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30",
  urgent: "bg-red-100 text-red-700 border-red-200 dark:bg-red-500/20 dark:text-red-300 dark:border-red-500/30",
};

const CATEGORY_LABELS: Record<ProtocolCategory, string> = {
  general: "Geral",
  hr: "RH",
  finance: "Financeiro",
  request: "Solicitação",
  directive: "Diretiva",
};

const TICKET_STATUS_LABELS: Record<string, string> = {
  open: "Aberto",
  in_progress: "Em Andamento",
  resolved: "Resolvido",
  closed: "Fechado",
};

const TICKET_STATUS_COLORS: Record<string, string> = {
  open: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/30",
  in_progress: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30",
  resolved: "bg-green-100 text-green-700 border-green-200 dark:bg-green-500/20 dark:text-green-300 dark:border-green-500/30",
  closed: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-500/20 dark:text-slate-300 dark:border-slate-500/30",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ─────────────────────────────────────────────────────────────
// Sub-componente: Card de Protocolo
// ─────────────────────────────────────────────────────────────

interface ProtocolCardProps {
  protocol: ManagerProtocol;
  currentUserId: string;
  currentUserName: string;
  isInbox: boolean;
  onAcknowledge: (id: string) => void;
  onMarkRead: (id: string) => void;
  onReply: (protocolId: string, body: string) => void;
}

function ProtocolCard({
  protocol,
  currentUserId,
  currentUserName,
  isInbox,
  onAcknowledge,
  onMarkRead,
  onReply,
}: ProtocolCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [submittingReply, setSubmittingReply] = useState(false);

  const myRecipient = protocol.recipients?.find(
    (r) => r.recipient_id === currentUserId
  );
  const isUnread = isInbox && myRecipient && !myRecipient.read_at;
  const isAcknowledged = isInbox && myRecipient && !!myRecipient.acknowledged_at;
  const replyCount = protocol.replies?.length || 0;

  const handleExpand = () => {
    if (!expanded && isInbox && isUnread) {
      onMarkRead(protocol.id);
    }
    setExpanded(!expanded);
  };

  const handleReplySubmit = async () => {
    if (!replyText.trim()) return;
    setSubmittingReply(true);
    await onReply(protocol.id, replyText.trim());
    setReplyText("");
    setShowReplyBox(false);
    setSubmittingReply(false);
  };

  const recipientsSummary = protocol.recipients
    ? protocol.recipients.map((r) => r.recipient_name).join(", ")
    : "—";

  return (
    <div
      className={`rounded-xl border transition-all duration-200 ${
        isUnread
          ? "border-blue-200 bg-blue-50 dark:border-blue-500/50 dark:bg-blue-950/30"
          : "border-slate-200 bg-white dark:border-white/10 dark:bg-white/5"
      }`}
    >
      {/* Header */}
      <button
        className="w-full text-left p-4 flex items-start gap-3"
        onClick={handleExpand}
      >
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            {isUnread && (
              <span className="h-2 w-2 rounded-full bg-blue-400 shrink-0 mt-1" />
            )}
            <span className="font-mono text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
              {protocol.protocol_number}
            </span>
            <span
              className={`text-xs px-2 py-0.5 rounded border ${
                PRIORITY_COLORS[protocol.priority]
              }`}
            >
              {PRIORITY_LABELS[protocol.priority]}
            </span>
            <span className="text-xs text-slate-600 dark:text-slate-500">
              {CATEGORY_LABELS[protocol.category]}
            </span>
            {replyCount > 0 && (
              <span className="text-xs text-slate-600 dark:text-slate-500 flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                {replyCount}
              </span>
            )}
          </div>
          <p className="font-semibold text-slate-900 dark:text-white truncate">{protocol.subject}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isInbox ? `De: ${protocol.sender_name}` : `Para: ${recipientsSummary}`}
            {" · "}
            {formatDate(protocol.created_at)}
          </p>
        </div>
        <div className="shrink-0 mt-1 text-slate-500 dark:text-slate-400">
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </button>

      {/* Corpo expandido */}
      {expanded && (
        <div className="px-4 pb-4 space-y-4">
          <Separator className="bg-slate-100 dark:bg-white/10" />

          {/* Corpo da mensagem */}
          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4">
            <p className="text-sm text-slate-700 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
              {protocol.body}
            </p>
          </div>

          {/* Destinatários com status de leitura */}
          {!isInbox && protocol.recipients && protocol.recipients.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Status de Leitura
              </p>
              {protocol.recipients.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center gap-3 text-sm"
                >
                  <span className="text-slate-300 flex-1">{r.recipient_name}</span>
                  {r.acknowledged_at ? (
                    <span className="text-green-400 flex items-center gap-1 text-xs">
                      <CheckCheck className="h-3 w-3" />
                      Ciente em {formatDate(r.acknowledged_at)}
                    </span>
                  ) : r.read_at ? (
                    <span className="text-blue-400 flex items-center gap-1 text-xs">
                      <CheckCheck className="h-3 w-3" />
                      Lido em {formatDate(r.read_at)}
                    </span>
                  ) : (
                    <span className="text-slate-500 flex items-center gap-1 text-xs">
                      <Clock className="h-3 w-3" />
                      Não lido
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Thread de respostas */}
          {protocol.replies && protocol.replies.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Respostas
              </p>
              {protocol.replies.map((reply) => (
                <div
                  key={reply.id}
                  className={`rounded-lg p-3 text-sm ${
                    reply.sender_id === currentUserId
                      ? "bg-blue-50 border-blue-100 dark:bg-blue-900/30 dark:border-blue-500/20 ml-4 border"
                      : "bg-slate-50 border-slate-200 dark:bg-slate-800/50 border dark:border-white/5"
                  }`}
                >
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                    <span className="font-medium text-slate-800 dark:text-slate-300">
                      {reply.sender_name}
                    </span>{" "}
                    · {formatDate(reply.created_at)}
                  </p>
                  <p className="text-slate-700 dark:text-slate-200 whitespace-pre-wrap">{reply.body}</p>
                </div>
              ))}
            </div>
          )}

          {/* Ações */}
          <div className="flex flex-wrap gap-2">
            {isInbox && !isAcknowledged && (
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-500 text-white"
                onClick={() => onAcknowledge(protocol.id)}
              >
                <CheckCheck className="h-4 w-4 mr-1.5" />
                Dar Ciente
              </Button>
            )}
            {isInbox && isAcknowledged && (
              <span className="text-xs text-green-400 flex items-center gap-1 py-1">
                <CheckCheck className="h-4 w-4" />
                Ciente registrado
              </span>
            )}
            <Button
              size="sm"
              variant="outline"
              className="border-white/20 text-slate-300 hover:bg-white/10"
              onClick={() => setShowReplyBox(!showReplyBox)}
            >
              <MessageSquare className="h-4 w-4 mr-1.5" />
              Responder
            </Button>
          </div>

          {/* Caixa de resposta */}
          {showReplyBox && (
            <div className="space-y-2">
              <Textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Escreva sua resposta..."
                className="bg-slate-900 border-white/20 text-white placeholder:text-slate-500 resize-none"
                rows={3}
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-500"
                  onClick={handleReplySubmit}
                  disabled={!replyText.trim() || submittingReply}
                >
                  {submittingReply ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  ) : (
                    <Send className="h-4 w-4 mr-1.5" />
                  )}
                  Enviar
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-slate-400"
                  onClick={() => {
                    setShowReplyBox(false);
                    setReplyText("");
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Sub-componente: Card de Chamado
// ─────────────────────────────────────────────────────────────

function TicketCard({ ticket }: { ticket: ManagerTicket }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-xl border border-slate-200 bg-white dark:border-white/10 dark:bg-white/5">
      <button
        className="w-full text-left p-4 flex items-start gap-3 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors rounded-xl"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="font-mono text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
              {ticket.ticket_number}
            </span>
            <span
              className={`text-xs px-2 py-0.5 rounded border ${
                TICKET_STATUS_COLORS[ticket.status]
              }`}
            >
              {TICKET_STATUS_LABELS[ticket.status]}
            </span>
            <span
              className={`text-xs px-2 py-0.5 rounded border ${
                PRIORITY_COLORS[ticket.priority]
              }`}
            >
              {PRIORITY_LABELS[ticket.priority]}
            </span>
            <span className="text-xs text-slate-600 dark:text-slate-500">→ {ticket.assigned_to}</span>
          </div>
          <p className="font-semibold text-slate-900 dark:text-white truncate">{ticket.subject}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Aberto em {formatDate(ticket.created_at)}
          </p>
        </div>
        <div className="shrink-0 mt-1 text-slate-500 dark:text-slate-400">
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3">
          <Separator className="bg-slate-100 dark:bg-white/10" />
          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4">
            <p className="text-sm text-slate-700 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
              {ticket.description}
            </p>
          </div>
          {ticket.resolution && (
            <div className="bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-500/20 rounded-lg p-4">
              <p className="text-xs text-green-700 dark:text-green-400 font-medium mb-1">Resolução</p>
              <p className="text-sm text-slate-800 dark:text-slate-200">{ticket.resolution}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Componente Principal
// ─────────────────────────────────────────────────────────────

type Tab = "dashboard" | "inbox" | "sent" | "new" | "tickets" | "new-ticket";

export default function ManagerPortal() {
  const { user, profile } = useAuth();
  const { employees } = useEmployees();
  const [activeTab, setActiveTab] = useState<Tab>("inbox");

  // Dados
  const [inbox, setInbox] = useState<ManagerProtocol[]>([]);
  const [sent, setSent] = useState<ManagerProtocol[]>([]);
  const [tickets, setTickets] = useState<ManagerTicket[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Formulário novo protocolo
  const [newSubject, setNewSubject] = useState("");
  const [newBody, setNewBody] = useState("");
  const [newPriority, setNewPriority] = useState<ProtocolPriority>("normal");
  const [newCategory, setNewCategory] = useState<ProtocolCategory>("general");
  const [newRecipients, setNewRecipients] = useState<string[]>([]);
  const [sending, setSending] = useState(false);

  // Formulário novo chamado
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketDescription, setTicketDescription] = useState("");
  const [ticketTarget, setTicketTarget] = useState<TicketTarget>("RH Estratégico");
  const [ticketPriority, setTicketPriority] = useState<ProtocolPriority>("normal");
  const [sendingTicket, setSendingTicket] = useState(false);

  const userId = user?.id || "mock-admin-id";
  const userName = profile?.full_name || "Usuário";

  // Lista de gestores para destinatários (trazida do Supabase Profiles)
  const [managerProfiles, setManagerProfiles] = useState<{ id: string; name: string; email?: string }[]>([]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [inboxData, sentData, ticketsData, unread] = await Promise.all([
        managerPortalService.getInbox(userId),
        managerPortalService.getSent(userId),
        managerPortalService.getTickets(userId),
        managerPortalService.getUnreadCount(userId),
      ]);
      setInbox(inboxData);
      setSent(sentData);
      setTickets(ticketsData);
      setUnreadCount(unread);

      // Buscar perfis válidos para destinatários
      const { supabase } = await import("@/lib/supabase");
      const { USE_MOCK } = await import("@/lib/mockDatabase");

      if (USE_MOCK) {
        setManagerProfiles([
          { id: "102", name: "Ana do Marketing" },
          { id: "103", name: "João do Financeiro" },
        ]);
      } else {
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("id, full_name, email")
          .neq("id", userId) // Exclui o próprio usuário
          .order("full_name");
          
        if (profilesData) {
          setManagerProfiles(
            profilesData.map((p) => ({
              id: p.id,
              name: p.full_name || p.email || "Usuário",
              email: p.email,
            }))
          );
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Erro ao carregar dados do portal.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ── Handlers ──────────────────────────────────

  const handleMarkRead = async (protocolId: string) => {
    await managerPortalService.markAsRead(userId, protocolId);
    setUnreadCount((c) => Math.max(0, c - 1));
    setInbox((prev) =>
      prev.map((p) =>
        p.id === protocolId
          ? {
              ...p,
              recipients: p.recipients?.map((r) =>
                r.recipient_id === userId
                  ? { ...r, read_at: new Date().toISOString() }
                  : r
              ),
            }
          : p
      )
    );
  };

  const handleAcknowledge = async (protocolId: string) => {
    try {
      await managerPortalService.acknowledge(userId, protocolId);
      const now = new Date().toISOString();
      setInbox((prev) =>
        prev.map((p) =>
          p.id === protocolId
            ? {
                ...p,
                recipients: p.recipients?.map((r) =>
                  r.recipient_id === userId
                    ? { ...r, acknowledged_at: now, read_at: r.read_at || now }
                    : r
                ),
              }
            : p
        )
      );
      toast.success("Ciente registrado com sucesso!");
    } catch {
      toast.error("Erro ao registrar ciente.");
    }
  };

  const handleReply = async (protocolId: string, body: string) => {
    try {
      const reply = await managerPortalService.replyToProtocol(
        protocolId,
        userId,
        userName,
        body
      );
      const addReply = (protocols: ManagerProtocol[]) =>
        protocols.map((p) =>
          p.id === protocolId
            ? { ...p, replies: [...(p.replies || []), reply] }
            : p
        );
      setInbox((prev) => addReply(prev));
      setSent((prev) => addReply(prev));
      toast.success("Resposta enviada!");
    } catch {
      toast.error("Erro ao enviar resposta.");
    }
  };

  const handleSendProtocol = async () => {
    if (!newSubject.trim() || !newBody.trim() || newRecipients.length === 0) {
      toast.error("Preencha assunto, mensagem e selecione ao menos um destinatário.");
      return;
    }
    setSending(true);
    try {
      const recipientObjects = newRecipients.map((id) => {
        const found = managerProfiles.find((m) => m.id === id);
        return { id, name: found?.name || id };
      });

      const newProtocol = await managerPortalService.createProtocol({
        subject: newSubject,
        body: newBody,
        sender_id: userId,
        sender_name: userName,
        priority: newPriority,
        category: newCategory,
        recipient_ids: recipientObjects,
      });

      // Disparar notificações por e-mail via EmailJS
      const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
      const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
      const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

      if (serviceId && templateId && publicKey) {
        // Envia de forma assíncrona para não travar a tela
        Promise.all(newRecipients.map(async (id) => {
          const found = managerProfiles.find((m) => m.id === id);
          if (found && found.email) {
            try {
              await emailjs.send(
                serviceId,
                templateId,
                {
                  to_name: found.name,
                  to_email: found.email,
                  name: "Portal de Gestores - RH",
                  title: `Novo Protocolo Oficial: ${newSubject}`,
                  message: `Você recebeu um novo protocolo de ${userName} (${PRIORITY_LABELS[newPriority]}).\n\nPor favor, acesse o sistema para ler e registrar sua ciência.`,
                  link: window.location.origin + '/manager-portal'
                },
                publicKey
              );
            } catch (emailErr) {
              console.error("Erro ao enviar notificação de e-mail:", emailErr);
            }
          }
        }));
      }

      setSent((prev) => [newProtocol, ...prev]);
      setNewSubject("");
      setNewBody("");
      setNewPriority("normal");
      setNewCategory("general");
      setNewRecipients([]);
      setActiveTab("sent");
      toast.success(`Protocolo ${newProtocol.protocol_number} enviado com sucesso!`);
    } catch {
      toast.error("Erro ao enviar protocolo.");
    } finally {
      setSending(false);
    }
  };

  const handleSendTicket = async () => {
    if (!ticketSubject.trim() || !ticketDescription.trim()) {
      toast.error("Preencha o assunto e a descrição do chamado.");
      return;
    }
    setSendingTicket(true);
    try {
      const newTicket = await managerPortalService.createTicket({
        requester_id: userId,
        requester_name: userName,
        assigned_to: ticketTarget,
        subject: ticketSubject,
        description: ticketDescription,
        priority: ticketPriority,
      });
      setTickets((prev) => [newTicket, ...prev]);
      setTicketSubject("");
      setTicketDescription("");
      setTicketPriority("normal");
      setActiveTab("tickets");
      toast.success(`Chamado ${newTicket.ticket_number} aberto com sucesso!`);
    } catch {
      toast.error("Erro ao abrir chamado.");
    } finally {
      setSendingTicket(false);
    }
  };

  // ── Estatísticas do Dashboard ──────────────────

  const activeEmployees = employees.filter((e) => e.status === "active").length;
  const vacationEmployees = employees.filter((e) => e.status === "vacation").length;
  const openTickets = tickets.filter((t) => t.status === "open" || t.status === "in_progress").length;
  const pendingAck = inbox.filter(
    (p) => p.recipients?.some((r) => r.recipient_id === userId && !r.acknowledged_at)
  ).length;

  // ─────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────

  const navItems: { id: Tab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: "dashboard", label: "Dashboard", icon: <TrendingUp className="h-4 w-4" /> },
    {
      id: "inbox",
      label: "Caixa de Entrada",
      icon: <Inbox className="h-4 w-4" />,
      badge: unreadCount || undefined,
    },
    { id: "sent", label: "Enviados", icon: <Send className="h-4 w-4" /> },
    { id: "new", label: "Novo Protocolo", icon: <FilePlus2 className="h-4 w-4" /> },
    {
      id: "tickets",
      label: "Meus Chamados",
      icon: <LifeBuoy className="h-4 w-4" />,
      badge: openTickets || undefined,
    },
    { id: "new-ticket", label: "Abrir Chamado", icon: <AlertTriangle className="h-4 w-4" /> },
  ];

  return (
    <AppLayout>
      <div className="min-h-screen bg-slate-50 dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        {/* Header */}
        <div className="border-b border-slate-200 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-600 dark:bg-gradient-to-br dark:from-blue-600 dark:to-indigo-600 shadow-md shadow-blue-500/25">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">Área de Gestores</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Portal de Comunicação Protocolada · {userName}
              </p>
            </div>
            {unreadCount > 0 && (
              <div className="ml-auto flex items-center gap-2 bg-blue-100 dark:bg-blue-500/20 border border-blue-200 dark:border-blue-500/30 rounded-full px-3 py-1.5">
                <Bell className="h-4 w-4 text-blue-600 dark:text-blue-400 animate-pulse" />
                <span className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                  {unreadCount} não lido{unreadCount > 1 ? "s" : ""}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex h-[calc(100vh-73px)]">
          {/* Sidebar de navegação */}
          <nav className="w-56 border-r border-slate-200 dark:border-white/10 bg-white/50 dark:bg-slate-900/60 p-3 flex flex-col gap-1 shrink-0">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 w-full text-left ${
                  activeTab === item.id
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/25"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
                }`}
              >
                {item.icon}
                <span className="flex-1">{item.label}</span>
                {item.badge !== undefined && (
                  <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center shrink-0">
                    {item.badge > 9 ? "9+" : item.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>

          {/* Conteúdo principal */}
          <main className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="flex items-center justify-center h-48 text-slate-400">
                <Loader2 className="h-8 w-8 animate-spin mr-3" />
                Carregando portal...
              </div>
            ) : (
              <>
                {/* ── DASHBOARD ── */}
                {activeTab === "dashboard" && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Dashboard</h2>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Visão geral do seu ambiente de gestão
                      </p>
                    </div>

                    {/* KPI Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      {[
                        {
                          label: "Colaboradores Ativos",
                          value: activeEmployees,
                          icon: <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />,
                          color: "bg-blue-50 border-blue-100 dark:from-blue-600/20 dark:to-blue-800/10 dark:border-blue-500/20",
                        },
                        {
                          label: "Em Férias",
                          value: vacationEmployees,
                          icon: <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />,
                          color: "bg-amber-50 border-amber-100 dark:from-amber-600/20 dark:to-amber-800/10 dark:border-amber-500/20",
                        },
                        {
                          label: "Não Respondidos",
                          value: pendingAck,
                          icon: <Bell className="h-5 w-5 text-red-600 dark:text-red-400" />,
                          color: "bg-red-50 border-red-100 dark:from-red-600/20 dark:to-red-800/10 dark:border-red-500/20",
                        },
                        {
                          label: "Chamados Abertos",
                          value: openTickets,
                          icon: <LifeBuoy className="h-5 w-5 text-green-600 dark:text-green-400" />,
                          color: "bg-green-50 border-green-100 dark:from-green-600/20 dark:to-green-800/10 dark:border-green-500/20",
                        },
                      ].map((kpi) => (
                        <div
                          key={kpi.label}
                          className={`rounded-xl border bg-gradient-to-br p-4 ${kpi.color}`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="p-2 rounded-lg bg-white dark:bg-white/5 shadow-sm dark:shadow-none">{kpi.icon}</div>
                          </div>
                          <p className="text-3xl font-bold text-slate-800 dark:text-white mt-3">
                            {kpi.value}
                          </p>
                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{kpi.label}</p>
                        </div>
                      ))}
                    </div>

                    {/* Atividade Recente */}
                    <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-5">
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <Tag className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                        Últimos Protocolos Recebidos
                      </h3>
                      {inbox.length === 0 ? (
                        <p className="text-sm text-slate-500">Nenhum protocolo recebido.</p>
                      ) : (
                        <div className="space-y-3">
                          {inbox.slice(0, 3).map((p) => (
                            <div
                              key={p.id}
                              className="flex items-center gap-3 text-sm cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 rounded-lg p-2 -mx-2 transition-colors"
                              onClick={() => setActiveTab("inbox")}
                            >
                              <span className="font-mono text-xs text-slate-500 shrink-0">
                                {p.protocol_number}
                              </span>
                              <span className="text-slate-700 dark:text-slate-300 truncate flex-1">{p.subject}</span>
                              <span
                                className={`text-xs px-2 py-0.5 rounded border shrink-0 ${PRIORITY_COLORS[p.priority]}`}
                              >
                                {PRIORITY_LABELS[p.priority]}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ── INBOX ── */}
                {activeTab === "inbox" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Caixa de Entrada</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {inbox.length} protocolo{inbox.length !== 1 ? "s" : ""} recebido
                          {inbox.length !== 1 ? "s" : ""}
                          {unreadCount > 0 && ` · ${unreadCount} não lido${unreadCount > 1 ? "s" : ""}`}
                        </p>
                      </div>
                    </div>
                    {inbox.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-48 text-slate-500">
                        <Inbox className="h-12 w-12 mb-3 opacity-40" />
                        <p>Nenhum protocolo na caixa de entrada.</p>
                      </div>
                    ) : (
                      inbox.map((p) => (
                        <ProtocolCard
                          key={p.id}
                          protocol={p}
                          currentUserId={userId}
                          currentUserName={userName}
                          isInbox={true}
                          onAcknowledge={handleAcknowledge}
                          onMarkRead={handleMarkRead}
                          onReply={handleReply}
                        />
                      ))
                    )}
                  </div>
                )}

                {/* ── ENVIADOS ── */}
                {activeTab === "sent" && (
                  <div className="space-y-4">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white">Protocolos Enviados</h2>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {sent.length} protocolo{sent.length !== 1 ? "s" : ""} enviado
                        {sent.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                    {sent.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-48 text-slate-500">
                        <Send className="h-12 w-12 mb-3 opacity-40 text-slate-400" />
                        <p>Nenhum protocolo enviado ainda.</p>
                      </div>
                    ) : (
                      sent.map((p) => (
                        <ProtocolCard
                          key={p.id}
                          protocol={p}
                          currentUserId={userId}
                          currentUserName={userName}
                          isInbox={false}
                          onAcknowledge={handleAcknowledge}
                          onMarkRead={handleMarkRead}
                          onReply={handleReply}
                        />
                      ))
                    )}
                  </div>
                )}

                {/* ── NOVO PROTOCOLO ── */}
                {activeTab === "new" && (
                  <div className="max-w-2xl space-y-5">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white">Novo Protocolo</h2>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Envie uma comunicação oficial protocolada
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-6 space-y-5">
                      {/* Assunto */}
                      <div className="space-y-1.5">
                        <Label className="text-slate-700 dark:text-slate-300">Assunto *</Label>
                        <Input
                          value={newSubject}
                          onChange={(e) => setNewSubject(e.target.value)}
                          placeholder="Assunto do protocolo..."
                          className="bg-white dark:bg-slate-900 border-slate-200 dark:border-white/20 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                        />
                      </div>

                      {/* Prioridade e Categoria */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label className="text-slate-700 dark:text-slate-300">Prioridade *</Label>
                          <Select
                            value={newPriority}
                            onValueChange={(v) => setNewPriority(v as ProtocolPriority)}
                          >
                            <SelectTrigger className="bg-white dark:bg-slate-900 border-slate-200 dark:border-white/20 text-slate-900 dark:text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-white/20">
                              {(Object.entries(PRIORITY_LABELS) as [ProtocolPriority, string][]).map(
                                ([k, v]) => (
                                  <SelectItem
                                    key={k}
                                    value={k}
                                    className="text-slate-800 dark:text-slate-200 focus:bg-slate-100 dark:focus:bg-white/10"
                                  >
                                    {v}
                                  </SelectItem>
                                )
                              )}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-slate-700 dark:text-slate-300">Categoria *</Label>
                          <Select
                            value={newCategory}
                            onValueChange={(v) => setNewCategory(v as ProtocolCategory)}
                          >
                            <SelectTrigger className="bg-white dark:bg-slate-900 border-slate-200 dark:border-white/20 text-slate-900 dark:text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-white/20">
                              {(Object.entries(CATEGORY_LABELS) as [ProtocolCategory, string][]).map(
                                ([k, v]) => (
                                  <SelectItem
                                    key={k}
                                    value={k}
                                    className="text-slate-800 dark:text-slate-200 focus:bg-slate-100 dark:focus:bg-white/10"
                                  >
                                    {v}
                                  </SelectItem>
                                )
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Destinatários */}
                      <div className="space-y-2">
                        <Label className="text-slate-700 dark:text-slate-300">
                          Destinatários * ({newRecipients.length} selecionado
                          {newRecipients.length !== 1 ? "s" : ""})
                        </Label>
                        <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
                          {managerProfiles.map((m) => {
                            const selected = newRecipients.includes(m.id);
                            return (
                              <button
                                key={m.id}
                                type="button"
                                onClick={() =>
                                  setNewRecipients((prev) =>
                                    selected
                                      ? prev.filter((id) => id !== m.id)
                                      : [...prev, m.id]
                                  )
                                }
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm text-left transition-all ${
                                  selected
                                    ? "border-blue-500 bg-blue-50 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300"
                                    : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 dark:border-white/10 dark:bg-white/5 dark:text-slate-400 dark:hover:border-white/20 dark:hover:text-slate-300"
                                }`}
                              >
                                <div
                                  className={`h-3 w-3 rounded-sm border shrink-0 ${
                                    selected
                                      ? "bg-blue-500 border-blue-500"
                                      : "border-slate-400 dark:border-slate-500 bg-white dark:bg-transparent"
                                  }`}
                                />
                                <span className="truncate">{m.name}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Corpo */}
                      <div className="space-y-1.5">
                        <Label className="text-slate-700 dark:text-slate-300">Mensagem *</Label>
                        <Textarea
                          value={newBody}
                          onChange={(e) => setNewBody(e.target.value)}
                          placeholder="Escreva o conteúdo do protocolo aqui..."
                          className="bg-white dark:bg-slate-900 border-slate-200 dark:border-white/20 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 resize-none"
                          rows={8}
                        />
                      </div>

                      <Button
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold shadow-lg shadow-blue-500/20"
                        onClick={handleSendProtocol}
                        disabled={sending}
                      >
                        {sending ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Send className="h-4 w-4 mr-2" />
                        )}
                        {sending ? "Enviando..." : "Enviar Protocolo"}
                      </Button>
                    </div>
                  </div>
                )}

                {/* ── CHAMADOS ── */}
                {activeTab === "tickets" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Meus Chamados</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {tickets.length} chamado{tickets.length !== 1 ? "s" : ""} registrado
                          {tickets.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-500 text-white"
                        onClick={() => setActiveTab("new-ticket")}
                      >
                        <AlertTriangle className="h-4 w-4 mr-1.5" />
                        Novo Chamado
                      </Button>
                    </div>
                    {tickets.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-48 text-slate-500">
                        <LifeBuoy className="h-12 w-12 mb-3 opacity-40 text-slate-400" />
                        <p>Nenhum chamado aberto.</p>
                      </div>
                    ) : (
                      tickets.map((t) => <TicketCard key={t.id} ticket={t} />)
                    )}
                  </div>
                )}

                {/* ── NOVO CHAMADO ── */}
                {activeTab === "new-ticket" && (
                  <div className="max-w-2xl space-y-5">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white">Abrir Chamado</h2>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Solicitação formal para Diretoria ou RH Estratégico
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-6 space-y-5">
                      <div className="space-y-1.5">
                        <Label className="text-slate-700 dark:text-slate-300">Encaminhar para *</Label>
                        <Select
                          value={ticketTarget}
                          onValueChange={(v) => setTicketTarget(v as TicketTarget)}
                        >
                          <SelectTrigger className="bg-white dark:bg-slate-900 border-slate-200 dark:border-white/20 text-slate-900 dark:text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-white/20">
                            <SelectItem value="RH Estratégico" className="text-slate-800 dark:text-slate-200 focus:bg-slate-100 dark:focus:bg-white/10">
                              RH Estratégico
                            </SelectItem>
                            <SelectItem value="Diretoria" className="text-slate-800 dark:text-slate-200 focus:bg-slate-100 dark:focus:bg-white/10">
                              Diretoria
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-slate-700 dark:text-slate-300">Prioridade *</Label>
                        <Select
                          value={ticketPriority}
                          onValueChange={(v) => setTicketPriority(v as ProtocolPriority)}
                        >
                          <SelectTrigger className="bg-white dark:bg-slate-900 border-slate-200 dark:border-white/20 text-slate-900 dark:text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-white/20">
                            {(Object.entries(PRIORITY_LABELS) as [ProtocolPriority, string][]).map(
                              ([k, v]) => (
                                <SelectItem
                                  key={k}
                                  value={k}
                                  className="text-slate-800 dark:text-slate-200 focus:bg-slate-100 dark:focus:bg-white/10"
                                >
                                  {v}
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-slate-700 dark:text-slate-300">Assunto *</Label>
                        <Input
                          value={ticketSubject}
                          onChange={(e) => setTicketSubject(e.target.value)}
                          placeholder="Assunto do chamado..."
                          className="bg-white dark:bg-slate-900 border-slate-200 dark:border-white/20 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-slate-700 dark:text-slate-300">Descrição *</Label>
                        <Textarea
                          value={ticketDescription}
                          onChange={(e) => setTicketDescription(e.target.value)}
                          placeholder="Descreva detalhadamente sua solicitação..."
                          className="bg-white dark:bg-slate-900 border-slate-200 dark:border-white/20 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 resize-none"
                          rows={8}
                        />
                      </div>

                      <Button
                        className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-semibold shadow-lg shadow-amber-500/20"
                        onClick={handleSendTicket}
                        disabled={sendingTicket}
                      >
                        {sendingTicket ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 mr-2" />
                        )}
                        {sendingTicket ? "Abrindo..." : "Abrir Chamado"}
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </AppLayout>
  );
}
