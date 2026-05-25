-- MIGRATION V5 - Adicionar Cargo ao Perfil de Usuário
-- Adiciona um campo para o cargo/função exibido no perfil.

-- 1. Adicionar a coluna 'display_role' na tabela de perfis
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS display_role TEXT;

-- 2. BACKFILL: Preencher o cargo para usuários existentes
-- Vamos pegar o cargo da tabela 'employees' como valor inicial.
-- Se não encontrar, definimos como 'Administrador'.
UPDATE public.profiles p
SET display_role = COALESCE(
    (SELECT e.role FROM public.employees e WHERE e.email = p.email LIMIT 1),
    'Administrador'
)
WHERE p.display_role IS NULL;