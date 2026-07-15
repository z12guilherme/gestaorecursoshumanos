-- ============================================================
-- Migration: Soft Delete na tabela `employees`
-- Data: 2026-07-15
-- Descrição: Adiciona deleted_at para suporte a exclusão lógica.
--            Registros com deleted_at preenchido são tratados como
--            deletados e filtrados automaticamente pela aplicação.
-- ============================================================

-- 1. Adiciona a coluna deleted_at (NULL = ativo, preenchido = deletado)
ALTER TABLE public.employees
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

-- 2. Adiciona coluna termination_reason (caso não exista)
ALTER TABLE public.employees
  ADD COLUMN IF NOT EXISTS termination_reason TEXT DEFAULT NULL;

-- 3. Índice para performance: buscas de ativos são extremamente comuns
CREATE INDEX IF NOT EXISTS idx_employees_deleted_at
  ON public.employees (deleted_at)
  WHERE deleted_at IS NULL;

-- 4. Atualiza (ou recria) a View `employees_public` para excluir deletados
DROP VIEW IF EXISTS public.employees_public;

CREATE OR REPLACE VIEW public.employees_public AS
  SELECT
    id,
    name,
    email,
    role,
    department,
    status,
    admission_date,
    phone,
    contract_type,
    birth_date,
    manager,
    work_schedule,
    unit,
    avatar_url,
    created_at,
    termination_date,
    termination_reason,
    vacation_due_date,
    vacation_limit_date,
    custom_fields
  FROM public.employees
  WHERE deleted_at IS NULL;

GRANT SELECT ON public.employees_public TO authenticated;
GRANT SELECT ON public.employees_public TO anon;

-- 5. Atualiza políticas RLS para excluir deletados nas queries de leitura
DROP POLICY IF EXISTS "Usuários autenticados podem ver colaboradores" ON public.employees;
DROP POLICY IF EXISTS "Authenticated users can view employees" ON public.employees;

CREATE POLICY "Authenticated users can view active employees"
  ON public.employees
  FOR SELECT
  TO authenticated
  USING (deleted_at IS NULL);

CREATE POLICY "Admins can view all employees including deleted"
  ON public.employees
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin')
    )
  );

-- 6. Função para restaurar colaborador deletado (soft undelete)
CREATE OR REPLACE FUNCTION public.restore_employee(employee_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.employees
  SET
    deleted_at = NULL,
    status = 'Ativo'
  WHERE id = employee_id;
END;
$$;

COMMENT ON FUNCTION public.restore_employee IS
  'Restaura um colaborador excluído logicamente (soft delete), limpando deleted_at e reativando o status.';
