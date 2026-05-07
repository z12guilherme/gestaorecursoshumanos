# 🗄️ Gestão de Migrations (Supabase)

Como o nosso SaaS funciona no modelo "Multi-Instância" (um Supabase para cada cliente), utilizamos o sistema de Migrations da CLI do Supabase para garantir que o banco de dados de todos os clientes esteja sempre na mesma versão do código.

## 1. Setup Inicial (Primeira Vez)

> **🐳 Importante:** O Docker Desktop precisa estar instalado e rodando (a baleia tá nadando!) para que a CLI do Supabase consiga emular as ferramentas de banco localmente.

Abra o terminal na raiz do projeto e rode:
```bash
# Inicializa a pasta supabase/ no seu projeto
npx supabase init
```
Isso criará uma pasta chamada `supabase/`. Dentro dela, crie uma pasta `migrations/`.
Mova o nosso arquivo `20260423172634_remote_schema.sql` para dentro dessa pasta. Ele será a base para qualquer cliente novo!

## 2. Como criar uma nova funcionalidade (Nova Tabela/Coluna)

Quando você for criar algo novo (ex: módulo de Feedbacks):

1. Vá no painel web do seu Supabase "Master" (O seu principal de desenvolvimento).
2. Crie a tabela visualmente por lá, adicione as colunas e as regras de segurança (RLS).
3. No terminal do seu projeto, faça o login e conecte ao seu projeto Master:
   ```bash
   npx supabase login
   npx supabase link --project-ref <SEU_PROJECT_ID_MASTER>
   ```
4. Puxe as alterações que você fez visualmente para um novo arquivo de código:
   ```bash
   npx supabase db pull
   ```
Isso vai gerar um arquivo automático (ex: `20260505120000_create_feedbacks.sql`) na sua pasta de migrations.

## 3. Como atualizar os clientes (Deploy de Banco)

Quando você fechar um novo cliente ou quiser atualizar o banco de um cliente antigo com a sua nova tabela de feedbacks, basta linkar para o projeto dele e "empurrar" as migrations:

```bash
# Conecta no banco do cliente
npx supabase link --project-ref <PROJECT_ID_DO_CLIENTE>
# Aplica todas as migrations que ele ainda não tem
npx supabase db push
```