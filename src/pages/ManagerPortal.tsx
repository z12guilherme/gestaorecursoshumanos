import { useState, useEffect, useCallback, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { managerPortalService } from "@/services/managerPortalService";
import { supabase } from "@/lib/supabase";
import { USE_MOCK } from "@/lib/mockDatabase";
import {
  ManagerProtocol,
  ManagerTicket,
  ProtocolPriority,
  ProtocolCategory,
  TicketTarget,
} from "@/types/manager";
import { toast } from "sonner";
import {
  Send,
  CheckCheck,
  Loader2,
  MessageSquare,
  Search,
  Plus,
  AlertCircle,
  FileText,
  ArrowLeft,
  KeyRound,
  Paperclip,
  X,
  Download
} from "lucide-react";
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
import emailjs from '@emailjs/browser';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger
} from "@/components/ui/dialog";
import { ChangePassword } from "@/components/settings/ChangePassword";
import { Switch } from "@/components/ui/switch";

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

function formatTime(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  }
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit" });
}

function getInitial(name: string) {
  return name ? name.charAt(0).toUpperCase() : "?";
}

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

type ConversationType = 'protocol' | 'ticket';

interface ConversationItem {
  id: string;
  type: ConversationType;
  title: string;
  subtitle: string;
  snippet: string;
  date: string;
  timestamp: number;
  unread: boolean;
  priority: ProtocolPriority;
  originalData: any;
}

// ─────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────

export default function ManagerPortal() {
  const { user, profile } = useAuth();
  const userId = user?.id || "mock-admin-id";
  const userName = profile?.full_name || "Usuário";

  // Data
  const [inbox, setInbox] = useState<ManagerProtocol[]>([]);
  const [sent, setSent] = useState<ManagerProtocol[]>([]);
  const [tickets, setTickets] = useState<ManagerTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [managerProfiles, setManagerProfiles] = useState<{ id: string; name: string; email?: string }[]>([]);

  // UI State
  const [search, setSearch] = useState("");
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [isMobileListHidden, setIsMobileListHidden] = useState(false);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [newType, setNewType] = useState<'protocol' | 'ticket'>('protocol');
  const [isGlobalNotice, setIsGlobalNotice] = useState(false);

  // Reply / Ack state
  const [replyText, setReplyText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // New Protocol Form
  const [newSubject, setNewSubject] = useState("");
  const [newBody, setNewBody] = useState("");
  const [newPriority, setNewPriority] = useState<ProtocolPriority>("normal");
  const [newCategory, setNewCategory] = useState<ProtocolCategory>("general");
  const [newRecipients, setNewRecipients] = useState<string[]>([]);

  // New Ticket Form
  const [ticketTarget, setTicketTarget] = useState<TicketTarget>("RH Estratégico");

  // Attachments
  const [newFile, setNewFile] = useState<File | null>(null);

  // Tabs
  const [activeTab, setActiveTab] = useState<'chat' | 'password'>('chat');

  const loadData = useCallback(async () => {
    setLoading(true);

    // Segurança extra: se não for ambiente mock e o ID for o padrão de inicialização,
    // aguardamos o carregamento real do AuthContext.
    if (!USE_MOCK && (userId === "mock-admin-id" || !user?.id)) {
      setLoading(false);
      return;
    }

    try {
      const [inboxData, sentData, ticketsData] = await Promise.all([
        managerPortalService.getInbox(userId),
        managerPortalService.getSent(userId),
        managerPortalService.getTickets(userId),
      ]);
      setInbox(inboxData);
      setSent(sentData);
      setTickets(ticketsData);

      if (USE_MOCK) {
        setManagerProfiles([
          { id: "102", name: "Ana do Marketing" },
          { id: "103", name: "João do Financeiro" },
        ]);
      } else {
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("id, full_name, email")
          .neq("id", userId)
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

  // Transform data into unified list
  const conversations = useMemo(() => {
    const list: ConversationItem[] = [];

    inbox.forEach(p => {
      const myRecipient = p.recipients?.find((r) => r.recipient_id === userId);
      const isUnread = myRecipient ? !myRecipient.read_at : false;
      if (p.id) list.push({
        id: p.id,
        type: 'protocol',
        title: p.sender_name,
        subtitle: p.subject,
        snippet: String(p?.body || "").substring(0, 50) + "...",
        date: formatTime(p.created_at),
        timestamp: new Date(p.created_at).getTime(),
        unread: isUnread,
        priority: p.priority,
        originalData: p
      });
    });

    sent.forEach(p => {
      if (list.some(i => i.id === p.id)) return;
      const recNames = p.recipients?.map(r => r.recipient_name).join(', ') || 'Desconhecido';
      if (p.id) list.push({
        id: p.id,
        type: 'protocol',
        title: `Para: ${recNames}`,
        subtitle: p.subject,
        snippet: String(p?.body || "").substring(0, 50) + "...",
        date: formatTime(p.created_at),
        timestamp: new Date(p.created_at).getTime(),
        unread: false,
        priority: p.priority,
        originalData: p
      });
    });

    tickets.forEach(t => {
      if (t.id) list.push({
        id: t.id,
        type: 'ticket',
        title: `Chamado: ${t.assigned_to}`,
        subtitle: t.subject,
        snippet: String(t?.description || "").substring(0, 50) + "...",
        date: formatTime(t.created_at),
        timestamp: new Date(t.created_at).getTime(),
        unread: t.status === 'open' || t.status === 'in_progress',
        priority: t.priority,
        originalData: t
      });
    });

    return list.sort((a, b) => b.timestamp - a.timestamp);
  }, [inbox, sent, tickets, userId]);

  const filteredConversations = useMemo(() => {
    if (!search) return conversations;
    const lower = search.toLowerCase();
    return conversations.filter(c =>
      c.title.toLowerCase().includes(lower) ||
      c.subtitle.toLowerCase().includes(lower)
    );
  }, [conversations, search]);

  const activeConv = useMemo(() => {
    return conversations.find(c => c.id === selectedConvId) || null;
  }, [conversations, selectedConvId]);

  // Handlers
  const handleSelectConversation = async (conv: ConversationItem) => {
    setSelectedConvId(conv.id);
    setIsMobileListHidden(true); // show chat on mobile

    if (conv.type === 'protocol' && conv.unread) {
      await managerPortalService.markAsRead(userId, conv.id);
      setInbox((prev) =>
        prev.map((p) =>
          p.id === conv.id
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
    }
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
      toast.success("Ciente registrado!");
    } catch {
      toast.error("Erro ao registrar ciente.");
    }
  };

  const handleReply = async () => {
    if (!replyText.trim() || !activeConv || activeConv.type !== 'protocol') return;
    setSubmitting(true);
    try {
      const reply = await managerPortalService.replyToProtocol(
        activeConv.id,
        userId,
        userName,
        replyText.trim()
      );
      const addReply = (protocols: ManagerProtocol[]) =>
        protocols.map((p) =>
          p.id === activeConv.id
            ? { ...p, replies: [...(p.replies || []), reply] }
            : p
        );
      setInbox(addReply);
      setSent(addReply);
      setReplyText("");
    } catch {
      toast.error("Erro ao enviar resposta.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreate = async () => {
    setSubmitting(true);
    try {
      let attachment_url = null;
      let attachment_name = null;

      if (newFile) {
        if (USE_MOCK) {
          attachment_url = URL.createObjectURL(newFile);
          attachment_name = newFile.name;
        } else {
          const fileName = `${userId}/${Date.now()}_${newFile.name}`;
          const { error: uploadError } = await supabase.storage
            .from('documents')
            .upload(fileName, newFile);

          if (uploadError) {
            toast.error("Erro ao fazer upload do anexo.");
            setSubmitting(false);
            return;
          }

          const { data: { publicUrl } } = supabase.storage
            .from('documents')
            .getPublicUrl(fileName);

          attachment_url = publicUrl;
          attachment_name = newFile.name;
        }
      }

      if (newType === 'protocol') {
        const recipientObjects = isGlobalNotice
          ? managerProfiles.map((m) => ({ id: m.id, name: m.name }))
          : newRecipients.map((id) => {
            const found = managerProfiles.find((m) => m.id === id);
            return { id, name: found?.name || id };
          });

        if (!newSubject || !newBody || recipientObjects.length === 0) {
          toast.error("Preencha todos os campos do protocolo e adicione destinatários.");
          setSubmitting(false);
          return;
        }

        const subjectWithPrefix = isGlobalNotice ? `[AVISO GLOBAL] ${newSubject}` : newSubject;

        const newP = await managerPortalService.createProtocol({
          subject: subjectWithPrefix,
          body: newBody,
          sender_id: userId,
          sender_name: userName,
          priority: newPriority,
          category: newCategory,
          recipient_ids: recipientObjects,
          attachment_url,
          attachment_name,
        });

        // Email notification
        const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
        const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
        const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
        if (serviceId && templateId && publicKey) {
          Promise.all(recipientObjects.map(async (rec) => {
            const found = managerProfiles.find((m) => m.id === rec.id);
            if (found && found.email) {
              emailjs.send(serviceId, templateId, {
                to_name: found.name,
                to_email: found.email,
                name: "Portal",
                title: subjectWithPrefix,
                message: newBody,
                link: window.location.origin + '/manager-portal'
              }, publicKey).catch(console.error);
            }
          }));
        }
        setSent([newP, ...sent]);
        setSelectedConvId(newP.id);
        toast.success("Enviado!");
      } else {
        if (!newSubject || !newBody) {
          toast.error("Preencha todos os campos do chamado.");
          setSubmitting(false);
          return;
        }
        const newT = await managerPortalService.createTicket({
          requester_id: userId,
          requester_name: userName,
          assigned_to: ticketTarget,
          subject: newSubject,
          description: newBody,
          priority: newPriority,
          attachment_url,
          attachment_name,
        });

        // Email confirmation for the ticket requester (copy)
        const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
        const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
        const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
        if (serviceId && templateId && publicKey && profile?.email) {
          emailjs.send(serviceId, templateId, {
            to_name: userName,
            to_email: profile.email,
            name: "Portal",
            title: `[Chamado - ${ticketTarget}] ${newSubject}`,
            message: newBody,
            link: window.location.origin + '/manager-portal'
          }, publicKey).catch(console.error);
        }

        setTickets([newT, ...tickets]);
        setSelectedConvId(newT.id);
        toast.success("Aberto!");
      }
      setIsNewModalOpen(false);
      setNewSubject("");
      setNewBody("");
      setNewRecipients([]);
      setIsGlobalNotice(false);
      setNewFile(null);
      setIsMobileListHidden(true);
    } catch {
      toast.error("Erro na criação.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <div className="flex flex-col h-[calc(100vh-64px)] sm:h-[calc(100vh-73px)] bg-slate-50 dark:bg-slate-900 overflow-hidden relative">
        {/* Navigation Tabs Header */}
        <div className="bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-white/10 px-4 py-2 flex items-center gap-2 shrink-0">
          <Button
            variant={activeTab === 'chat' ? 'secondary' : 'ghost'}
            className="h-9 gap-2 font-medium"
            onClick={() => setActiveTab('chat')}
          >
            <MessageSquare className="w-4 h-4" />
            Portal de Comunicação
          </Button>
          <Button
            variant={activeTab === 'password' ? 'secondary' : 'ghost'}
            className="h-9 gap-2 font-medium"
            onClick={() => setActiveTab('password')}
          >
            <KeyRound className="w-4 h-4" />
            Trocar Senha
          </Button>
        </div>

        {activeTab === 'chat' ? (
          <div className="flex flex-1 overflow-hidden relative">
            {/* SIDEBAR (Lista de Conversas) */}
            <div
              className={`w-full sm:w-80 md:w-96 border-r border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950 flex flex-col shrink-0 transition-transform ${isMobileListHidden ? '-translate-x-full absolute h-full sm:relative sm:translate-x-0' : 'translate-x-0 absolute h-full sm:relative z-10'}`}
            >
              <div className="p-4 border-b border-slate-200 dark:border-white/10 flex flex-col gap-3 bg-slate-50/50 dark:bg-white/5">
                <div className="flex items-center justify-between">
                  <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    Portal
                  </h1>
                  <Dialog open={isNewModalOpen} onOpenChange={setIsNewModalOpen}>
                    <DialogTrigger asChild>
                      <Button size="icon" className="h-8 w-8 rounded-full bg-blue-600 hover:bg-blue-500 shadow-md">
                        <Plus className="h-4 w-4 text-white" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                      <DialogHeader>
                        <DialogTitle className="text-slate-900 dark:text-white">Nova Mensagem</DialogTitle>
                        <DialogDescription className="text-slate-500">Crie um novo protocolo ou abra um chamado para a diretoria.</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-2">
                        <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                          <Button
                            variant="ghost"
                            className={`flex-1 ${newType === 'protocol' ? 'bg-white dark:bg-slate-700 shadow-sm' : ''}`}
                            onClick={() => setNewType('protocol')}
                          >
                            Protocolo
                          </Button>
                          <Button
                            variant="ghost"
                            className={`flex-1 ${newType === 'ticket' ? 'bg-white dark:bg-slate-700 shadow-sm' : ''}`}
                            onClick={() => setNewType('ticket')}
                          >
                            Chamado
                          </Button>
                        </div>

                        {newType === 'protocol' && (
                          <div className="space-y-4">
                            <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 px-4 py-3 rounded-xl border border-blue-100 dark:border-blue-800/50">
                              <div className="space-y-0.5">
                                <Label className="text-blue-900 dark:text-blue-100 font-semibold text-sm cursor-pointer" onClick={() => setIsGlobalNotice(!isGlobalNotice)}>Aviso Global</Label>
                                <p className="text-xs text-blue-700 dark:text-blue-300">Enviar para todos os gestores cadastrados</p>
                              </div>
                              <Switch checked={isGlobalNotice} onCheckedChange={setIsGlobalNotice} />
                            </div>

                            {!isGlobalNotice && (
                              <div className="space-y-2">
                                <Label>Destinatários</Label>
                                <Select
                                  onValueChange={(val) => {
                                    if (!newRecipients.includes(val)) setNewRecipients([...newRecipients, val]);
                                  }}
                                >
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Selecione um gestor" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {managerProfiles.map(m => (
                                      <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                {newRecipients.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {newRecipients.map(id => {
                                      const m = managerProfiles.find(x => x.id === id);
                                      return (
                                        <span key={id} className="text-xs bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full flex items-center gap-1">
                                          {m?.name || id}
                                          <button onClick={() => setNewRecipients(prev => prev.filter(x => x !== id))} className="hover:text-blue-900 ml-1">×</button>
                                        </span>
                                      )
                                    })}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}

                        {newType === 'ticket' && (
                          <div className="space-y-2">
                            <Label>Para</Label>
                            <Select value={ticketTarget} onValueChange={(v) => setTicketTarget(v as TicketTarget)}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="RH Estratégico">RH Estratégico</SelectItem>
                                <SelectItem value="Diretoria">Diretoria</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}

                        <div className="space-y-2">
                          <Label>Assunto</Label>
                          <Input value={newSubject} onChange={e => setNewSubject(e.target.value)} placeholder="Título da mensagem" />
                        </div>

                        <div className="space-y-2">
                          <Label>Mensagem</Label>
                          <Textarea value={newBody} onChange={e => setNewBody(e.target.value)} rows={4} placeholder="Digite sua mensagem aqui..." className="resize-none" />
                        </div>

                        <div className="space-y-2">
                          <Label>Anexo (Opcional)</Label>
                          <div className="flex items-center gap-2">
                            <Label htmlFor="file-upload" className="cursor-pointer flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 py-2 px-4 rounded-md transition-colors border border-slate-200 dark:border-slate-700 border-dashed w-full">
                              <Paperclip className="w-4 h-4" />
                              <span className="text-sm font-medium">Anexar Documento</span>
                            </Label>
                            <input
                              id="file-upload"
                              type="file"
                              className="hidden"
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  setNewFile(e.target.files[0]);
                                }
                              }}
                            />
                          </div>
                          {newFile && (
                            <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded-md mt-2 border border-blue-100 dark:border-blue-800/50">
                              <span className="text-sm text-blue-700 dark:text-blue-300 truncate max-w-[200px] sm:max-w-[300px]">
                                {newFile.name}
                              </span>
                              <button
                                onClick={() => setNewFile(null)}
                                className="text-blue-500 hover:text-blue-700 dark:hover:text-blue-200 transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>

                        <Button className="w-full bg-blue-600 hover:bg-blue-500 text-white mt-4" onClick={handleCreate} disabled={submitting}>
                          {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                          Enviar
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <Input
                    placeholder="Buscar conversas..."
                    className="pl-9 bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 rounded-full h-9 text-sm"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                {loading ? (
                  <div className="flex justify-center p-8 text-slate-400"><Loader2 className="w-6 h-6 animate-spin" /></div>
                ) : filteredConversations.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-sm">Nenhuma conversa encontrada.</div>
                ) : (
                  <div className="flex flex-col">
                    {filteredConversations.map(conv => (
                      <button
                        key={conv.id}
                        onClick={() => handleSelectConversation(conv)}
                        className={`w-full text-left p-4 border-b border-slate-100 dark:border-white/5 transition-colors flex items-start gap-3 relative hover:bg-slate-50 dark:hover:bg-white/5 ${selectedConvId === conv.id ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-semibold text-white shadow-sm ${conv.type === 'protocol' ? 'bg-gradient-to-br from-blue-500 to-indigo-600' : 'bg-gradient-to-br from-amber-500 to-orange-600'}`}>
                          {conv.type === 'protocol' ? getInitial(conv.title) : <AlertCircle className="w-5 h-5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-baseline mb-0.5">
                            <span className="font-semibold text-sm text-slate-900 dark:text-slate-100 truncate pr-2">{conv.title}</span>
                            <span className={`text-[10px] whitespace-nowrap ${conv.unread ? 'text-blue-600 font-bold dark:text-blue-400' : 'text-slate-400'}`}>{conv.date}</span>
                          </div>
                          <p className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate mb-1">{conv.subtitle}</p>
                          <p className={`text-xs truncate ${conv.unread ? 'text-slate-800 dark:text-slate-200 font-medium' : 'text-slate-500 dark:text-slate-400'}`}>
                            {conv.snippet}
                          </p>
                        </div>
                        {conv.unread && (
                          <div className="absolute top-4 right-4 w-2.5 h-2.5 bg-blue-500 rounded-full shadow-sm" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* CHAT AREA */}
            <div className={`flex-1 flex flex-col bg-[#efeae2] dark:bg-slate-900 h-full relative transition-transform ${isMobileListHidden ? 'translate-x-0 w-full' : 'hidden sm:flex sm:translate-x-0'}`}>
              {activeConv ? (
                <>
                  {/* Chat Header */}
                  <div className="h-16 px-4 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-white/10 flex items-center gap-3 shrink-0 shadow-sm z-10">
                    <button
                      className="sm:hidden p-2 -ml-2 text-slate-500 hover:text-slate-800 dark:hover:text-white"
                      onClick={() => setIsMobileListHidden(false)}
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 font-semibold text-white ${activeConv.type === 'protocol' ? 'bg-gradient-to-br from-blue-500 to-indigo-600' : 'bg-gradient-to-br from-amber-500 to-orange-600'}`}>
                      {activeConv.type === 'protocol' ? getInitial(activeConv.title) : <AlertCircle className="w-5 h-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="font-semibold text-sm text-slate-900 dark:text-slate-100 truncate">{activeConv.title}</h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{activeConv.subtitle}</p>
                    </div>
                  </div>

                  {/* Chat Bubbles */}
                  <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col gap-4 relative">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, black 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>

                    {/* Initial Message */}
                    <div className="flex gap-2 max-w-[85%] self-start relative z-10">
                      <div className="bg-white dark:bg-slate-800 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm border border-slate-100 dark:border-slate-700">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                            {activeConv.type === 'protocol' ? activeConv.originalData.sender_name : activeConv.originalData.requester_name}
                          </span>
                        </div>
                        <p className="text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                          {activeConv.type === 'protocol' ? activeConv.originalData.body : activeConv.originalData.description}
                        </p>
                        <div className="text-[10px] text-slate-400 text-right mt-2 font-medium">
                          {formatTime(activeConv.originalData.created_at)}
                        </div>
                      </div>
                    </div>

                    {/* Attachment for Initial Message */}
                    {activeConv.originalData.attachment_url && (
                      <div className="flex gap-2 max-w-[85%] self-start relative z-10 mt-[-8px]">
                        <a
                          href={activeConv.originalData.attachment_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-white dark:bg-slate-800 flex items-center gap-2 px-3 py-2 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                        >
                          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center shrink-0">
                            <Paperclip className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate max-w-[150px] sm:max-w-[200px]">
                              {activeConv.originalData.attachment_name || "Anexo"}
                            </p>
                          </div>
                          <Download className="w-4 h-4 text-slate-400" />
                        </a>
                      </div>
                    )}
                  </div>


                  {/* Read Receipts Info for Protocols */}
                  {activeConv.type === 'protocol' && activeConv.originalData.recipients && (
                    <div className="flex justify-center my-2 relative z-10">
                      <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm text-xs text-slate-500 dark:text-slate-400 px-3 py-1 rounded-full border border-slate-200/50 dark:border-white/5 inline-flex flex-col gap-1 items-center">
                        <span className="font-medium text-[10px] uppercase tracking-wider">Status</span>
                        {activeConv.originalData.recipients.map((r: any) => (
                          <div key={r.id} className="flex items-center gap-1.5">
                            <span>{r.recipient_name}:</span>
                            {r.acknowledged_at ? (
                              <span className="text-green-600 dark:text-green-400 flex items-center">✔ Ciente</span>
                            ) : r.read_at ? (
                              <span className="text-blue-600 dark:text-blue-400 flex items-center">✔ Lido</span>
                            ) : (
                              <span>Pendente</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Replies for Protocols */}
                  {activeConv.type === 'protocol' && activeConv.originalData.replies?.map((reply: any) => {
                    const isMe = reply.sender_id === userId;
                    return (
                      <div key={reply.id} className={`flex gap-2 max-w-[85%] relative z-10 ${isMe ? 'self-end' : 'self-start'}`}>
                        <div className={`${isMe ? 'bg-[#d9fdd3] dark:bg-emerald-900/60 text-slate-900 border-emerald-100 dark:border-emerald-800/50 rounded-tr-sm' : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-100 dark:border-slate-700 rounded-tl-sm'} rounded-2xl px-4 py-3 shadow-sm border`}>
                          {!isMe && (
                            <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">
                              {reply.sender_name}
                            </div>
                          )}
                          <p className={`text-sm whitespace-pre-wrap leading-relaxed ${isMe ? 'dark:text-emerald-100' : ''}`}>{reply.body}</p>
                          <div className={`text-[10px] text-right mt-1.5 font-medium ${isMe ? 'text-emerald-700 dark:text-emerald-400/80' : 'text-slate-400'}`}>
                            {formatTime(reply.created_at)}
                          </div>
                        </div>
                      </div>
                    )
                  })}

                  {/* Resolution for Tickets */}
                  {activeConv.type === 'ticket' && activeConv.originalData.resolution && (
                    <div className="flex gap-2 max-w-[85%] self-start relative z-10 mt-4">
                      <div className="bg-blue-50 dark:bg-blue-900/30 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm border border-blue-100 dark:border-blue-800/50">
                        <div className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-1 flex items-center gap-1">
                          <CheckCheck className="w-3 h-3" /> Resolução
                        </div>
                        <p className="text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                          {activeConv.originalData.resolution}
                        </p>
                      </div>
                    </div>
                  )}


                  {/* Chat Input Area */}
                  <div className="bg-slate-50 dark:bg-slate-950 p-3 sm:p-4 border-t border-slate-200 dark:border-white/10 shrink-0 z-10 relative">
                    {activeConv.type === 'protocol' && (
                      <div className="max-w-4xl mx-auto flex items-end gap-2">
                        {/* Acknowledge Button if needed */}
                        {(() => {
                          const myRec = activeConv.originalData.recipients?.find((r: any) => r.recipient_id === userId);
                          if (myRec && !myRec.acknowledged_at && activeConv.originalData.sender_id !== userId) {
                            return (
                              <Button
                                variant="outline"
                                className="bg-green-50 hover:bg-green-100 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800/50 dark:text-green-400 dark:hover:bg-green-900/40"
                                onClick={() => handleAcknowledge(activeConv.id)}
                              >
                                <CheckCheck className="w-4 h-4 sm:mr-2" />
                                <span className="hidden sm:inline">Dar Ciente</span>
                              </Button>
                            )
                          }
                          return null;
                        })()}

                        <div className="flex-1 relative">
                          <Textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Escreva uma mensagem..."
                            className="min-h-[44px] max-h-32 rounded-2xl py-3 px-4 resize-none bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 shadow-sm pr-12 focus-visible:ring-1 focus-visible:ring-blue-500"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleReply();
                              }
                            }}
                          />
                          <Button
                            size="icon"
                            onClick={handleReply}
                            disabled={!replyText.trim() || submitting}
                            className="absolute right-1.5 bottom-1.5 h-8 w-8 rounded-full bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50 disabled:bg-slate-400"
                          >
                            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 ml-0.5" />}
                          </Button>
                        </div>
                      </div>
                    )}

                    {activeConv.type === 'ticket' && (
                      <div className="text-center text-xs text-slate-500 dark:text-slate-400 p-2">
                        Este é um chamado {activeConv.originalData.status === 'closed' ? 'fechado' : 'em andamento'}. As resoluções aparecerão acima.
                      </div>
                    )}
                  </div>
                </>
              ) : (
                // Empty State (No conversation selected)
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50 dark:bg-slate-900">
                  <div className="w-20 h-20 bg-blue-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 shadow-inner">
                    <MessageSquare className="w-10 h-10 text-blue-500 dark:text-slate-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Portal de Comunicação</h2>
                  <p className="text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed mb-8 text-sm">
                    Selecione uma conversa na lista ao lado para visualizar os detalhes, ou clique no botão <strong className="text-blue-600 dark:text-blue-400">+</strong> para iniciar um novo Protocolo ou Chamado.
                  </p>
                  <div className="grid grid-cols-2 gap-4 w-full max-w-sm text-left">
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700/50">
                      <FileText className="w-5 h-5 text-indigo-500 mb-2" />
                      <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">Protocolos</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Comunicação oficial e rastreável com outros gestores.</p>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700/50">
                      <AlertCircle className="w-5 h-5 text-amber-500 mb-2" />
                      <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">Chamados</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Solicitações formais para o RH ou Diretoria.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 flex justify-center items-start">
            <div className="w-full max-w-xl">
              <ChangePassword />
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
