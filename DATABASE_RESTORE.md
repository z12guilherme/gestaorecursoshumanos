# 🗄️ Guia de Restauração do Banco de Dados (Supabase)

Este documento contém o esquema do banco de dados e as instruções necessárias para subir o projeto **GestaoRH** novamente no Supabase.

## 1. Variáveis de Ambiente

Antes de desativar o projeto atual, certifique-se de que você tem uma cópia do seu arquivo `.env` local. Quando criar o novo projeto no futuro, você precisará atualizar estas chaves:

```env
VITE_SUPABASE_URL="SUA_NOVA_URL_DO_SUPABASE"
VITE_SUPABASE_ANON_KEY="SUA_NOVA_CHAVE_ANONIMA"
```

## 2. Script SQL de Restauração

Copie o código abaixo e cole no **SQL Editor** do painel do Supabase para recriar toda a estrutura de tabelas.

> **Nota:** A ordem das tabelas foi ajustada para respeitar as dependências (Chaves Estrangeiras).

```sql
-- 1. Tabela de Colaboradores (Base para outras tabelas)
CREATE TABLE public.employees (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text,
  role text,
  department text,
  status text DEFAULT 'Ativo'::text,
  admission_date date,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  phone text,
  contract_type text,
  birth_date date,
  salary numeric,
  manager text,
  password text DEFAULT '1234'::text, -- Senha utilizada para o Ponto Eletrônico
  CONSTRAINT employees_pkey PRIMARY KEY (id)
);

-- 2. Tabela de Vagas
CREATE TABLE public.jobs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  department text,
  location text,
  type text,
  status text DEFAULT 'Aberta'::text,
  description text,
  requirements text[], -- Ajustado para array de texto
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT jobs_pkey PRIMARY KEY (id)
);

-- 3. Tabela de Candidatos (Depende de Jobs)
CREATE TABLE public.candidates (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  job_id uuid,
  name text NOT NULL,
  email text,
  phone text,
  position text,
  status text DEFAULT 'Inscrito'::text,
  rating integer DEFAULT 0,
  notes text,
  applied_at timestamp with time zone DEFAULT now(),
  resume_url text,
  CONSTRAINT candidates_pkey PRIMARY KEY (id),
  CONSTRAINT candidates_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id)
);

-- 4. Registros de Ponto (Depende de Employees)
CREATE TABLE public.time_entries (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  employee_id uuid,
  timestamp timestamp with time zone DEFAULT now(),
  type text CHECK (type = ANY (ARRAY['in'::text, 'out'::text])),
  CONSTRAINT time_entries_pkey PRIMARY KEY (id),
  CONSTRAINT time_entries_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id)
);

-- 5. Solicitações de Férias/Ausência (Depende de Employees)
CREATE TABLE public.time_off_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  employee_id uuid,
  type text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  status text DEFAULT 'pending'::text,
  reason text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT time_off_requests_pkey PRIMARY KEY (id),
  CONSTRAINT time_off_requests_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id)
);

-- 6. Avaliações de Desempenho (Depende de Employees)
CREATE TABLE public.performance_reviews (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  employee_id uuid,
  reviewer_id uuid,
  period text,
  overall_score numeric,
  goals jsonb,
  competencies jsonb,
  feedback text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT performance_reviews_pkey PRIMARY KEY (id),
  CONSTRAINT performance_reviews_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id),
  CONSTRAINT performance_reviews_reviewer_id_fkey FOREIGN KEY (reviewer_id) REFERENCES public.employees(id)
);

-- 7. Mensagens da IA
CREATE TABLE public.ai_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  role text NOT NULL CHECK (role = ANY (ARRAY['user'::text, 'assistant'::text])),
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT ai_messages_pkey PRIMARY KEY (id)
);

-- 8. Comunicados e Avisos
CREATE TABLE public.announcements (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  priority text CHECK (priority = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text])),
  author text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT announcements_pkey PRIMARY KEY (id)
);

-- 9. Scripts de Automação
CREATE TABLE public.automation_scripts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  code text NOT NULL,
  language text DEFAULT 'python'::text,
  instructions text,
  is_custom boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT automation_scripts_pkey PRIMARY KEY (id)
);

-- 10. Configurações do Sistema
CREATE TABLE public.settings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  company_name text,
  cnpj text,
  email text,
  phone text,
  website text,
  address text,
  city text,
  state text,
  zip_code text,
  theme text DEFAULT 'light'::text,
  notifications_enabled boolean DEFAULT true,
  developer_name text DEFAULT 'Marcos Guilherme'::text,
  avatar_url text,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT settings_pkey PRIMARY KEY (id)
);
```

## 3. Configuração de Segurança (RLS)

Por padrão, o Supabase bloqueia o acesso público às tabelas. Para que o frontend funcione corretamente, você precisará configurar as políticas de segurança (Row Level Security).

**Opção Rápida (Desenvolvimento):**
Se quiser liberar o acesso para leitura e escrita para qualquer usuário autenticado (ou público, dependendo da sua regra de negócio), execute também:

```sql
-- Exemplo: Habilitar RLS e permitir acesso total (CUIDADO: Use apenas em dev ou ajuste conforme necessidade)
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir acesso total a employees" ON public.employees FOR ALL USING (true) WITH CHECK (true);

-- Repita para as outras tabelas se necessário, ou configure políticas específicas no painel "Authentication > Policies".
```

*Recomendação:* No futuro, configure políticas que verifiquem `auth.uid()` para garantir que apenas usuários autorizados possam editar dados sensíveis.

## 4. Storage (Arquivos)

Se o seu projeto utiliza upload de arquivos (ex: currículos em `candidates.resume_url` ou avatares), lembre-se de recriar os **Buckets** no menu Storage:

1.  Acesse **Storage** no painel.
2.  Crie um bucket chamado `resumes` (ou o nome utilizado no código).
3.  Crie um bucket chamado `avatars` (se aplicável).
4.  Configure as políticas do Storage. Rode o script abaixo no SQL Editor:

```sql
-- Políticas de Storage (Copie e cole no SQL Editor)

-- 1. Bucket 'resumes' (Currículos)
-- Permitir upload público (Candidatos enviam currículo sem login)
DROP POLICY IF EXISTS "Public Upload Resumes" ON storage.objects;
CREATE POLICY "Public Upload Resumes" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'resumes');
-- Permitir leitura pública (RH visualiza currículos)
DROP POLICY IF EXISTS "Public Read Resumes" ON storage.objects;
CREATE POLICY "Public Read Resumes" ON storage.objects FOR SELECT USING (bucket_id = 'resumes');

-- 2. Bucket 'avatars' (Fotos de Perfil)
-- Permitir leitura pública
DROP POLICY IF EXISTS "Public Read Avatars" ON storage.objects;
CREATE POLICY "Public Read Avatars" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
-- Permitir upload apenas para usuários logados (RH)
DROP POLICY IF EXISTS "Auth Upload Avatars" ON storage.objects;
CREATE POLICY "Auth Upload Avatars" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'avatars');
```

## 5. Como Restaurar

1.  Crie um novo projeto no Supabase.
2.  Vá em **SQL Editor**.
3.  Cole o script da seção **2. Script SQL de Restauração** e clique em **Run**.
4.  (Opcional) Cole scripts de RLS ou configure manualmente.
5.  Atualize o arquivo `.env` do seu projeto React com as novas credenciais.
6.  Rode `npm run dev` e teste a aplicação.