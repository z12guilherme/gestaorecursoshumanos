-- MIGRATION V4 - Perfis de Usuário Independentes
-- Copie e cole este conteúdo no SQL Editor do Supabase

-- 1. Criar a tabela de perfis vinculada ao auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name text,
  avatar_url text,
  email text,
  updated_at timestamp with time zone DEFAULT now()
);

-- 2. Habilitar segurança (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Política: Usuário só pode ver seu próprio perfil
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Política: Usuário só pode editar seu próprio perfil
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Política: Permitir inserção (necessário para o trigger abaixo)
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 3. Criar Trigger para criar perfil automaticamente ao cadastrar novo usuário
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, avatar_url)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', 'Novo Usuário'),
    new.email,
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Remover trigger antigo se existir para evitar duplicidade
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. BACKFILL: Criar perfis para os usuários que JÁ existem (Nataly e o outro email)
INSERT INTO public.profiles (id, email, full_name)
SELECT 
    id, 
    email, 
    'Usuário do Sistema' -- Nome padrão inicial, depois você edita cada um
FROM auth.users
ON CONFLICT (id) DO NOTHING;