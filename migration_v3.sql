-- MIGRATION V3 - Financeiro Detalhado e Ouvidoria
-- Copie e cole este conteúdo no SQL Editor do Supabase

-- 1. Atualizar tabela de funcionários com campos financeiros detalhados
ALTER TABLE public.employees
ADD COLUMN IF NOT EXISTS family_salary_amount numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS insalubrity_amount numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS night_shift_amount numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS overtime_amount numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS vacation_amount numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS vacation_third_amount numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS variable_discounts jsonb DEFAULT '[]'::jsonb;

-- 2. Criar tabela de Sugestões (Ouvidoria)
CREATE TABLE IF NOT EXISTS public.suggestions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  customer_name text,
  contact_info text,
  content text NOT NULL,
  status text DEFAULT 'Nova'::text, -- 'Nova', 'Lida', 'Arquivada'
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT suggestions_pkey PRIMARY KEY (id)
);

-- 3. Configurar segurança (RLS) para Sugestões
ALTER TABLE public.suggestions ENABLE ROW LEVEL SECURITY;

-- Permitir que qualquer pessoa (público/clientes) insira sugestões sem login
CREATE POLICY "Allow public insert suggestions" ON public.suggestions
FOR INSERT WITH CHECK (true);

-- Permitir que apenas usuários autenticados (RH) leiam e gerenciem as sugestões
CREATE POLICY "Allow auth read suggestions" ON public.suggestions
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow auth update suggestions" ON public.suggestions
FOR UPDATE TO authenticated USING (true);