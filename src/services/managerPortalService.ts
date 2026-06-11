import { supabase } from "@/lib/supabase";
import { mockDatabase, USE_MOCK } from "@/lib/mockDatabase";
import {
  ManagerProtocol,
  ProtocolRecipient,
  ProtocolReply,
  ManagerTicket,
  CreateProtocolPayload,
  CreateTicketPayload,
} from "@/types/manager";

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

const generateMockProtocolNumber = (): string => {
  const year = new Date().getFullYear();
  const existing = mockDatabase.get("manager_protocols");
  const seq = existing.length + 1;
  return `PROT-${year}-${String(seq).padStart(6, "0")}`;
};

const generateMockTicketNumber = (): string => {
  const year = new Date().getFullYear();
  const existing = mockDatabase.get("manager_tickets");
  const seq = existing.length + 1;
  return `TICK-${year}-${String(seq).padStart(6, "0")}`;
};

// ─────────────────────────────────────────────
// Service
// ─────────────────────────────────────────────

export const managerPortalService = {

  // ── Caixa de Entrada ──────────────────────────
  async getInbox(userId: string): Promise<ManagerProtocol[]> {
    if (USE_MOCK) {
      const recipients: ProtocolRecipient[] = mockDatabase
        .get("protocol_recipients")
        .filter((r: ProtocolRecipient) => r.recipient_id === userId);

      const protocolIds = recipients.map((r) => r.protocol_id);
      const protocols: ManagerProtocol[] = mockDatabase
        .get("manager_protocols")
        .filter((p: ManagerProtocol) => protocolIds.includes(p.id))
        .sort((a: ManagerProtocol, b: ManagerProtocol) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

      return protocols.map((p) => ({
        ...p,
        recipients: recipients.filter((r) => r.protocol_id === p.id),
        replies: mockDatabase
          .get("protocol_replies")
          .filter((r: ProtocolReply) => r.protocol_id === p.id),
      }));
    }

    const { data: recipientRows, error: rErr } = await supabase
      .from("protocol_recipients")
      .select("protocol_id")
      .eq("recipient_id", userId);

    if (rErr) throw rErr;

    const ids = (recipientRows || []).map((r) => r.protocol_id);
    if (ids.length === 0) return [];

    const { data, error } = await supabase
      .from("manager_protocols")
      .select(`*, recipients:protocol_recipients(*), replies:protocol_replies(*)`)
      .in("id", ids)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data as ManagerProtocol[]) || [];
  },

  // ── Enviados ─────────────────────────────────
  async getSent(userId: string): Promise<ManagerProtocol[]> {
    if (USE_MOCK) {
      const protocols: ManagerProtocol[] = mockDatabase
        .get("manager_protocols")
        .filter((p: ManagerProtocol) => p.sender_id === userId)
        .sort((a: ManagerProtocol, b: ManagerProtocol) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

      return protocols.map((p) => ({
        ...p,
        recipients: mockDatabase
          .get("protocol_recipients")
          .filter((r: ProtocolRecipient) => r.protocol_id === p.id),
        replies: mockDatabase
          .get("protocol_replies")
          .filter((r: ProtocolReply) => r.protocol_id === p.id),
      }));
    }

    const { data, error } = await supabase
      .from("manager_protocols")
      .select(`*, recipients:protocol_recipients(*), replies:protocol_replies(*)`)
      .eq("sender_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data as ManagerProtocol[]) || [];
  },

  // ── Criar Protocolo ──────────────────────────
  async createProtocol(payload: CreateProtocolPayload): Promise<ManagerProtocol> {
    if (USE_MOCK) {
      const id = `proto-${Date.now()}`;
      const now = new Date().toISOString();
      const newProtocol: ManagerProtocol = {
        id,
        protocol_number: generateMockProtocolNumber(),
        subject: payload.subject,
        body: payload.body,
        sender_id: payload.sender_id,
        sender_name: payload.sender_name,
        priority: payload.priority,
        category: payload.category,
        status: "open",
        created_at: now,
        updated_at: now,
      };
      mockDatabase.add("manager_protocols", newProtocol);

      const recipients: ProtocolRecipient[] = payload.recipient_ids.map((r, i) => ({
        id: `recip-${Date.now()}-${i}`,
        protocol_id: id,
        recipient_id: r.id,
        recipient_name: r.name,
        read_at: null,
        acknowledged_at: null,
        created_at: now,
      }));
      recipients.forEach((r) => mockDatabase.add("protocol_recipients", r));

      return { ...newProtocol, recipients, replies: [] };
    }

    const { data: protoData, error: protoError } = await supabase
      .from("manager_protocols")
      .insert({
        subject: payload.subject,
        body: payload.body,
        sender_id: payload.sender_id,
        sender_name: payload.sender_name,
        priority: payload.priority,
        category: payload.category,
        protocol_number: `PROT-${new Date().getFullYear()}-${Date.now()}`, // será sobrescrito pela função SQL
      })
      .select()
      .single();

    if (protoError) throw protoError;

    const recipientsToInsert = payload.recipient_ids.map((r) => ({
      protocol_id: protoData.id,
      recipient_id: r.id,
      recipient_name: r.name,
    }));

    const { error: recipError } = await supabase
      .from("protocol_recipients")
      .insert(recipientsToInsert);

    if (recipError) throw recipError;

    return protoData as ManagerProtocol;
  },

  // ── Marcar como Lido ─────────────────────────
  async markAsRead(userId: string, protocolId: string): Promise<void> {
    if (USE_MOCK) {
      const recipients: ProtocolRecipient[] = mockDatabase.get("protocol_recipients");
      const idx = recipients.findIndex(
        (r) => r.recipient_id === userId && r.protocol_id === protocolId && !r.read_at
      );
      if (idx !== -1) {
        recipients[idx].read_at = new Date().toISOString();
        mockDatabase.set("protocol_recipients", recipients);
      }
      return;
    }

    await supabase
      .from("protocol_recipients")
      .update({ read_at: new Date().toISOString() })
      .eq("recipient_id", userId)
      .eq("protocol_id", protocolId)
      .is("read_at", null);
  },

  // ── Dar Ciente ───────────────────────────────
  async acknowledge(userId: string, protocolId: string): Promise<void> {
    if (USE_MOCK) {
      const recipients: ProtocolRecipient[] = mockDatabase.get("protocol_recipients");
      const idx = recipients.findIndex(
        (r) => r.recipient_id === userId && r.protocol_id === protocolId
      );
      if (idx !== -1) {
        recipients[idx].acknowledged_at = new Date().toISOString();
        recipients[idx].read_at = recipients[idx].read_at || new Date().toISOString();
        mockDatabase.set("protocol_recipients", recipients);
      }
      return;
    }

    await supabase
      .from("protocol_recipients")
      .update({
        acknowledged_at: new Date().toISOString(),
        read_at: new Date().toISOString(),
      })
      .eq("recipient_id", userId)
      .eq("protocol_id", protocolId);
  },

  // ── Responder Protocolo ──────────────────────
  async replyToProtocol(
    protocolId: string,
    senderId: string,
    senderName: string,
    body: string
  ): Promise<ProtocolReply> {
    if (USE_MOCK) {
      const reply: ProtocolReply = {
        id: `reply-${Date.now()}`,
        protocol_id: protocolId,
        sender_id: senderId,
        sender_name: senderName,
        body,
        created_at: new Date().toISOString(),
      };
      mockDatabase.add("protocol_replies", reply);
      return reply;
    }

    const { data, error } = await supabase
      .from("protocol_replies")
      .insert({ protocol_id: protocolId, sender_id: senderId, sender_name: senderName, body })
      .select()
      .single();

    if (error) throw error;
    return data as ProtocolReply;
  },

  // ── Chamados ─────────────────────────────────
  async getTickets(userId: string): Promise<ManagerTicket[]> {
    if (USE_MOCK) {
      return mockDatabase
        .get("manager_tickets")
        .filter((t: ManagerTicket) => t.requester_id === userId)
        .sort((a: ManagerTicket, b: ManagerTicket) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
    }

    const { data, error } = await supabase
      .from("manager_tickets")
      .select("*")
      .eq("requester_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data as ManagerTicket[]) || [];
  },

  async createTicket(payload: CreateTicketPayload): Promise<ManagerTicket> {
    if (USE_MOCK) {
      const now = new Date().toISOString();
      const ticket: ManagerTicket = {
        id: `tick-${Date.now()}`,
        ticket_number: generateMockTicketNumber(),
        requester_id: payload.requester_id,
        requester_name: payload.requester_name,
        assigned_to: payload.assigned_to,
        subject: payload.subject,
        description: payload.description,
        status: "open",
        priority: payload.priority,
        resolution: null,
        created_at: now,
        updated_at: now,
      };
      mockDatabase.add("manager_tickets", ticket);
      return ticket;
    }

    const { data, error } = await supabase
      .from("manager_tickets")
      .insert({
        requester_id: payload.requester_id,
        requester_name: payload.requester_name,
        assigned_to: payload.assigned_to,
        subject: payload.subject,
        description: payload.description,
        priority: payload.priority,
        ticket_number: generateMockTicketNumber(),
      })
      .select()
      .single();

    if (error) throw error;
    return data as ManagerTicket;
  },

  // ── Contagens para Badge de não lidos ────────
  async getUnreadCount(userId: string): Promise<number> {
    if (USE_MOCK) {
      return mockDatabase
        .get("protocol_recipients")
        .filter((r: ProtocolRecipient) => r.recipient_id === userId && !r.read_at)
        .length;
    }

    const { count } = await supabase
      .from("protocol_recipients")
      .select("*", { count: "exact", head: true })
      .eq("recipient_id", userId)
      .is("read_at", null);

    return count || 0;
  },
};
