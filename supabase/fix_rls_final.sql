-- =====================================================================
-- FIX DEFINITIVO: Recursão infinita nas políticas RLS
-- Execute ESTE script no SQL Editor do Supabase (substitui tudo anterior)
-- =====================================================================

-- ── PASSO 1: Remove TODAS as políticas existentes nas 3 tabelas ───────
-- (garante limpeza total, independente dos nomes que tiverem)

DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname, tablename
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN ('manager_protocols', 'protocol_recipients', 'protocol_replies')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, pol.tablename);
  END LOOP;
END;
$$;

-- ── PASSO 2: Remove funções auxiliares antigas se existirem ──────────

DROP FUNCTION IF EXISTS public.is_protocol_sender(UUID);
DROP FUNCTION IF EXISTS public.is_protocol_recipient(UUID);

-- ── PASSO 3: Cria funções SECURITY DEFINER ────────────────────────────
-- Estas funções consultam as tabelas SEM disparar RLS,
-- quebrando o ciclo de recursão.

-- Verifica se o usuário atual é remetente do protocolo
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

-- Verifica se o usuário atual é destinatário do protocolo
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

-- ── PASSO 4: Recria políticas SEM recursão ───────────────────────────

-- manager_protocols --------------------------------------------------
CREATE POLICY "mp_select" ON public.manager_protocols
  FOR SELECT TO authenticated
  USING (
    sender_id = auth.uid()
    OR public.is_protocol_recipient(id)
  );

CREATE POLICY "mp_insert" ON public.manager_protocols
  FOR INSERT TO authenticated
  WITH CHECK (sender_id = auth.uid());

-- protocol_recipients ------------------------------------------------
CREATE POLICY "pr_select" ON public.protocol_recipients
  FOR SELECT TO authenticated
  USING (
    recipient_id = auth.uid()
    OR public.is_protocol_sender(protocol_id)
  );

CREATE POLICY "pr_insert" ON public.protocol_recipients
  FOR INSERT TO authenticated
  WITH CHECK (public.is_protocol_sender(protocol_id));

CREATE POLICY "pr_update" ON public.protocol_recipients
  FOR UPDATE TO authenticated
  USING (recipient_id = auth.uid());

-- protocol_replies ---------------------------------------------------
CREATE POLICY "pry_select" ON public.protocol_replies
  FOR SELECT TO authenticated
  USING (
    public.is_protocol_sender(protocol_id)
    OR public.is_protocol_recipient(protocol_id)
  );

CREATE POLICY "pry_insert" ON public.protocol_replies
  FOR INSERT TO authenticated
  WITH CHECK (sender_id = auth.uid());

-- ── PASSO 5: Verificação ─────────────────────────────────────────────
-- Rode a query abaixo para confirmar as políticas:
-- SELECT tablename, policyname, cmd
-- FROM pg_policies
-- WHERE tablename IN ('manager_protocols', 'protocol_recipients', 'protocol_replies')
-- ORDER BY tablename, policyname;
