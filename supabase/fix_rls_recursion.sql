-- =====================================================================
-- FIX: Recursão infinita nas políticas RLS de protocol_recipients
-- Erro: 42P17 - infinite recursion detected in policy for relation "protocol_recipients"
--
-- CAUSA: As políticas formam um ciclo:
--   manager_protocols SELECT → subconsulta em protocol_recipients
--   protocol_recipients SELECT → subconsulta em manager_protocols
--   → LOOP INFINITO
--
-- SOLUÇÃO: Usar funções SECURITY DEFINER que bypassam RLS ao consultar
--          a tabela "irmã", quebrando o ciclo de recursão.
-- =====================================================================

-- ── Passo 1: Remover as políticas com recursão ───────────────────────

DROP POLICY IF EXISTS "Gestores veem seus protocolos"          ON public.manager_protocols;
DROP POLICY IF EXISTS "Ver destinatários dos meus protocolos"  ON public.protocol_recipients;
DROP POLICY IF EXISTS "Ver respostas"                          ON public.protocol_replies;

-- ── Passo 2: Criar funções auxiliares SECURITY DEFINER ───────────────
--
-- Estas funções rodam com privilégios do criador (sem RLS),
-- evitando o loop entre as duas tabelas.

-- Retorna TRUE se o usuário atual é remetente do protocolo dado
CREATE OR REPLACE FUNCTION public.is_protocol_sender(p_protocol_id UUID)
  RETURNS BOOLEAN
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.manager_protocols
    WHERE id = p_protocol_id
      AND sender_id = auth.uid()
  );
$$;

-- Retorna TRUE se o usuário atual é destinatário do protocolo dado
CREATE OR REPLACE FUNCTION public.is_protocol_recipient(p_protocol_id UUID)
  RETURNS BOOLEAN
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.protocol_recipients
    WHERE protocol_id = p_protocol_id
      AND recipient_id = auth.uid()
  );
$$;

-- ── Passo 3: Recriar políticas sem recursão ──────────────────────────

-- manager_protocols: remetente OU destinatário pode ver
CREATE POLICY "Gestores veem seus protocolos" ON public.manager_protocols
  FOR SELECT TO authenticated
  USING (
    sender_id = auth.uid()
    OR public.is_protocol_recipient(id)   -- usa função SECURITY DEFINER → sem RLS
  );

-- protocol_recipients: próprio destinatário OU remetente do protocolo pode ver
CREATE POLICY "Ver destinatários dos meus protocolos" ON public.protocol_recipients
  FOR SELECT TO authenticated
  USING (
    recipient_id = auth.uid()
    OR public.is_protocol_sender(protocol_id)  -- usa função SECURITY DEFINER → sem RLS
  );

-- protocol_replies: participante (remetente ou destinatário) pode ver
CREATE POLICY "Ver respostas" ON public.protocol_replies
  FOR SELECT TO authenticated
  USING (
    public.is_protocol_sender(protocol_id)
    OR public.is_protocol_recipient(protocol_id)
  );

-- ── Verificação ──────────────────────────────────────────────────────
-- Execute para confirmar que as políticas foram criadas corretamente:
-- SELECT schemaname, tablename, policyname, cmd, qual
-- FROM pg_policies
-- WHERE tablename IN ('manager_protocols', 'protocol_recipients', 'protocol_replies')
-- ORDER BY tablename, policyname;
