// =====================================================
// Tipos: Portal do Gestor & Comunicação Protocolada
// =====================================================

export type ProtocolPriority = 'low' | 'normal' | 'high' | 'urgent';
export type ProtocolCategory = 'general' | 'hr' | 'finance' | 'request' | 'directive';
export type ProtocolStatus = 'open' | 'closed' | 'archived';

export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type TicketTarget = 'Diretoria' | 'RH Estratégico';

export interface ManagerProtocol {
  id: string;
  protocol_number: string;       // Ex: PROT-2026-000001
  subject: string;
  body: string;
  sender_id: string;
  sender_name: string;
  priority: ProtocolPriority;
  category: ProtocolCategory;
  status: ProtocolStatus;
  created_at: string;
  updated_at: string;
  recipients?: ProtocolRecipient[];
  replies?: ProtocolReply[];
}

export interface ProtocolRecipient {
  id: string;
  protocol_id: string;
  recipient_id: string;
  recipient_name: string;
  read_at: string | null;
  acknowledged_at: string | null;
  created_at: string;
}

export interface ProtocolReply {
  id: string;
  protocol_id: string;
  sender_id: string;
  sender_name: string;
  body: string;
  created_at: string;
}

export interface ManagerTicket {
  id: string;
  ticket_number: string;         // Ex: TICK-2026-000001
  requester_id: string;
  requester_name: string;
  assigned_to: TicketTarget;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: ProtocolPriority;
  resolution?: string | null;
  created_at: string;
  updated_at: string;
}

// Payload para criação de protocolo
export interface CreateProtocolPayload {
  subject: string;
  body: string;
  sender_id: string;
  sender_name: string;
  priority: ProtocolPriority;
  category: ProtocolCategory;
  recipient_ids: { id: string; name: string }[];
}

// Payload para criação de chamado
export interface CreateTicketPayload {
  requester_id: string;
  requester_name: string;
  assigned_to: TicketTarget;
  subject: string;
  description: string;
  priority: ProtocolPriority;
}
