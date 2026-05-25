# 🗄️ Guia de Restauração do Banco de Dados (Supabase)

Este documento contém o esquema do banco de dados e as instruções necessárias para subir o projeto ** RH - Rede DMI** novamente no Supabase.

## 1. Variáveis de Ambiente

Antes de desativar o projeto atual, certifique-se de que você tem uma cópia do seu arquivo `.env` local. Quando criar o novo projeto no futuro, você precisará atualizar estas chaves:

```env
VITE_SUPABASE_URL="SUA_NOVA_URL_DO_SUPABASE"
VITE_SUPABASE_ANON_KEY="SUA_NOVA_CHAVE_ANONIMA"
```

## 2. Script SQL de Restauração

Com a evolução do sistema no modelo Multi-Tenant, o schema cresceu consideravelmente (incluindo views seguras, profiles atrelados ao auth.users, triggers de log, etc). 
Por isso, o script de restauração não é mais mantido manualmente neste arquivo.

Para restaurar o banco de dados do zero ou criar rapidamente a infraestrutura de um novo cliente:

1. Localize o arquivo de dump SQL mais recente (ex: `Backup - Supabase.sql` que é extraído via CLI).
2. Copie todo o conteúdo desse arquivo `.sql`.
3. Cole no **SQL Editor** do painel do Supabase da nova instância e clique em **Run**.

> **Vantagem:** O dump automático da CLI já inclui **todas as tabelas, Storage Buckets, Triggers, Funções do PostgreSQL e Políticas de Segurança (RLS)** na ordem exata de dependência.

## 3. Configuração de Segurança (RLS)

Todas as políticas de **Row Level Security (RLS)** estão totalmente embutidas no arquivo `.sql` exportado pela CLI do Supabase. 
Elas restringem o acesso aos dados com precisão, garantindo que colunas sensíveis só sejam acessadas por quem tem o nível correto de autenticação. Nenhuma configuração manual avulsa é necessária.

## 4. Storage (Arquivos)

Se o seu projeto utiliza upload de arquivos (ex: currículos em `candidates.resume_url` ou avatares), lembre-se de recriar os **Buckets** no menu Storage:

As políticas de acesso de *Storage* também são exportadas pelo comando de `dump`.
Basta criar (ou garantir que existem) os buckets abaixo de forma manual na UI caso não os veja:
* `resumes`
* `avatars`
* `documents`
* `time-off-attachments`

## 5. Extraindo Novas Configurações via CLI (Para o Dev)

Para atualizar o arquivo principal de instalação com todas as inovações que você construiu diretamente no seu Supabase Master:

> **⚠️ Pré-requisito:** O [Docker Desktop](https://www.docker.com/products/docker-desktop/) precisa estar aberto e rodando no seu computador (a famosa "baleia precisa estar nadando" 🐳) para que a CLI do Supabase consiga executar o dump do banco.

```bash
# 1. Faça login
npx supabase login

# 2. Conecte ao seu projeto Mestre
npx supabase link --project-ref szqheiruhdfmzxmxjufb

# 3. Puxe toda a estrutura para um arquivo local consolidado
npx supabase db dump --linked > "Backup - Supabase.sql"
```