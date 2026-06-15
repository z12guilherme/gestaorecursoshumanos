-- =====================================================================
-- MIGRATION: Portal do Gestor
-- Crie estas tabelas no SQL Editor do Supabase (szqheiruhdfmzxmxjufb)
-- =====================================================================

-- Sequências para numeração automática
CREATE SEQUENCE IF NOT EXISTS public.manager_protocols_seq START 1;
CREATE SEQUENCE IF NOT EXISTS public.manager_tickets_seq  START 1;

-- 1. Tabela principal de protocolos
CREATE TABLE IF NOT EXISTS public.manager_protocols (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  protocol_number  TEXT DEFAULT (
                     'PROT-' || EXTRACT(YEAR FROM NOW())::TEXT || '-' ||
                     LPAD(NEXTVAL('public.manager_protocols_seq')::TEXT, 6, '0')
                   ),
  subject          TEXT NOT NULL,
  body             TEXT NOT NULL,
  sender_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sender_name      TEXT NOT NULL,
  priority         TEXT NOT NULL DEFAULT 'normal'
                     CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  category         TEXT NOT NULL DEFAULT 'general'
                     CHECK (category IN ('general', 'hr', 'finance', 'request', 'directive')),
  status           TEXT NOT NULL DEFAULT 'open'
                     CHECK (status IN ('open', 'closed', 'archived')),
  attachment_url   TEXT,
  attachment_name  TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Destinatários do protocolo
CREATE TABLE IF NOT EXISTS public.protocol_recipients (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  protocol_id      UUID NOT NULL REFERENCES public.manager_protocols(id) ON DELETE CASCADE,
  recipient_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_name   TEXT NOT NULL,
  read_at          TIMESTAMPTZ,
  acknowledged_at  TIMESTAMPTZ,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Respostas / replies do protocolo
CREATE TABLE IF NOT EXISTS public.protocol_replies (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  protocol_id  UUID NOT NULL REFERENCES public.manager_protocols(id) ON DELETE CASCADE,
  sender_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sender_name  TEXT NOT NULL,
  body         TEXT NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Chamados internos de gestores
CREATE TABLE IF NOT EXISTS public.manager_tickets (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_number   TEXT DEFAULT (
                    'TICK-' || EXTRACT(YEAR FROM NOW())::TEXT || '-' ||
                    LPAD(NEXTVAL('public.manager_tickets_seq')::TEXT, 6, '0')
                  ),
  requester_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  requester_name  TEXT NOT NULL,
  assigned_to     TEXT NOT NULL CHECK (assigned_to IN ('Diretoria', 'RH Estratégico')),
  subject         TEXT NOT NULL,
  description     TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'open'
                    CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority        TEXT NOT NULL DEFAULT 'normal'
                    CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  resolution      TEXT,
  attachment_url  TEXT,
  attachment_name TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================
-- RLS: Habilitar segurança por linha
-- =====================================================================

ALTER TABLE public.manager_protocols     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.protocol_recipients   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.protocol_replies      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manager_tickets       ENABLE ROW LEVEL SECURITY;

-- =====================================================================
-- Políticas: manager_protocols
-- =====================================================================

-- Usuário autenticado pode ver protocolos que enviou OU que recebeu
CREATE POLICY "Gestores veem seus protocolos" ON public.manager_protocols
  FOR SELECT TO authenticated
  USING (
    sender_id = auth.uid()
    OR id IN (
      SELECT protocol_id FROM public.protocol_recipients
      WHERE recipient_id = auth.uid()
    )
  );

-- Somente o remetente pode inserir
CREATE POLICY "Gestores criam protocolos" ON public.manager_protocols
  FOR INSERT TO authenticated
  WITH CHECK (sender_id = auth.uid());

-- =====================================================================
-- Políticas: protocol_recipients
-- =====================================================================

CREATE POLICY "Ver destinatários dos meus protocolos" ON public.protocol_recipients
  FOR SELECT TO authenticated
  USING (
    recipient_id = auth.uid()
    OR protocol_id IN (
      SELECT id FROM public.manager_protocols WHERE sender_id = auth.uid()
    )
  );

CREATE POLICY "Inserir destinatários" ON public.protocol_recipients
  FOR INSERT TO authenticated
  WITH CHECK (
    protocol_id IN (
      SELECT id FROM public.manager_protocols WHERE sender_id = auth.uid()
    )
  );

CREATE POLICY "Marcar lido / ciente" ON public.protocol_recipients
  FOR UPDATE TO authenticated
  USING (recipient_id = auth.uid());

-- =====================================================================
-- Políticas: protocol_replies
-- =====================================================================

CREATE POLICY "Ver respostas" ON public.protocol_replies
  FOR SELECT TO authenticated
  USING (
    protocol_id IN (
      SELECT id FROM public.manager_protocols WHERE sender_id = auth.uid()
      UNION
      SELECT protocol_id FROM public.protocol_recipients WHERE recipient_id = auth.uid()
    )
  );

CREATE POLICY "Responder protocolo" ON public.protocol_replies
  FOR INSERT TO authenticated
  WITH CHECK (sender_id = auth.uid());

-- =====================================================================
-- Políticas: manager_tickets
-- =====================================================================

CREATE POLICY "Ver meus chamados" ON public.manager_tickets
  FOR SELECT TO authenticated
  USING (requester_id = auth.uid());

CREATE POLICY "Abrir chamado" ON public.manager_tickets
  FOR INSERT TO authenticated
  WITH CHECK (requester_id = auth.uid());

CREATE POLICY "Atualizar chamado" ON public.manager_tickets
  FOR UPDATE TO authenticated
  USING (requester_id = auth.uid());
