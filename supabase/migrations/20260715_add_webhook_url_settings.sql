-- ============================================================
-- Migration: Adiciona webhook_url na tabela `settings`
-- Data: 2026-07-15
-- Descrição: Campo para configurar URL de webhook do ERP/contabilidade
--            usado pela Edge Function payroll-webhook ao fechar folha.
-- ============================================================

ALTER TABLE public.settings
  ADD COLUMN IF NOT EXISTS webhook_url TEXT DEFAULT NULL;

COMMENT ON COLUMN public.settings.webhook_url IS
  'URL do webhook do ERP ou sistema contábil para receber notificações quando uma folha de pagamento é fechada.';
