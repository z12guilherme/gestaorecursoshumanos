# 🚀 Guia de Integração Rápida (SaaS Multi-Instância)

Este guia contém o passo a passo exato para configurar um novo cliente (instância) na plataforma RH - Rede DMI em menos de 15 minutos.

## 📋 Pré-requisitos
- Conta de e-mail do cliente (ex: `rh@empresa.com.br`).
- Acesso ao GitHub (seu repositório base).
- Conta no Vercel (pode ser a sua com um novo projeto ou a do cliente).
- Conta no Supabase (criada com o e-mail do cliente).
- Conta no EmailJS.

## 🛠️ Passo 1: Setup do Supabase (Banco de Dados)

1. Crie um novo projeto no Supabase.
2. Vá em **Project Settings -> API** e copie:
   - `Project URL`
   - `Project API Keys (anon, public)`
3. Vá no **SQL Editor** e rode o script completo de setup (`20260423172634_remote_schema.sql`).
   - *Este script já cria as tabelas, RLS, Storage Buckets, Triggers, Views Seguras, insere as configurações em branco na tabela `settings` e cria a função `setup_first_admin`.*
4. Vá no menu **Authentication -> Users** e crie o primeiro usuário (e-mail e senha) para o dono da empresa.
5. Volte no **SQL Editor** e rode o comando abaixo para dar permissão de Admin:
   ```sql
   SELECT setup_first_admin('email_do_dono@empresa.com.br', 'Nome do Dono');
   ```

## 📧 Passo 2: Setup do EmailJS (Envio de Holerites)

1. Crie uma conta ou acesse o EmailJS.
2. Adicione um **Email Service** (ex: Gmail, SMTP da empresa). Anote o `Service ID`.
3. Crie um **Email Template** com o nome "Holerite Template". Anote o `Template ID`.
   - **Variáveis do template:** `{{to_name}}`, `{{to_email}}`, `{{name}}` (Nome da empresa), `{{title}}` (Assunto), `{{message}}`, `{{link}}` (Link do PDF).
4. Vá em **Account -> API Keys** e anote a `Public Key`.

## 🌐 Passo 3: Deploy no Vercel

1. Acesse o Vercel e crie um **Novo Projeto**.
2. Importe o repositório do seu GitHub contendo o código do sistema.
3. Na seção **Environment Variables**, adicione as seguintes variáveis:
   - `VITE_SUPABASE_URL`: (A URL do Projeto copiada no Passo 1)
   - `VITE_SUPABASE_ANON_KEY`: (A chave `anon` copiada no Passo 1)
   - `VITE_EMAILJS_SERVICE_ID`: (O `Service ID` copiado no Passo 2)
   - `VITE_EMAILJS_TEMPLATE_ID`: (O `Template ID` copiado no Passo 2)
   - `VITE_EMAILJS_PUBLIC_KEY`: (A `Public Key` copiada no Passo 2)
4. Clique em **Deploy**.

## 🎨 Passo 4: White-label e Primeiro Acesso

1. Acesse a URL gerada pelo Vercel.
2. Faça login com o usuário criado no Passo 1.
3. Vá no menu **Configurações**:
   - Atualize o Nome da Empresa, CNPJ, Cores (Tema) e faça o upload da Logo.
4. O sistema já estará pronto para uso e com a identidade visual do cliente!