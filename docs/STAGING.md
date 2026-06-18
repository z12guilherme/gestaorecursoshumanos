# Guia de Staging e Preview Deployments

## O que foi configurado

Este projeto agora possui um pipeline completo de staging automático:

1. **`ci.yml`** — Roda em todo push e PR: lint, typecheck e testes unitários.
2. **`staging.yml`** — Roda em todo PR aberto: faz build com variáveis de staging e publica um Preview no Vercel, comentando a URL diretamente no PR.
3. **`vercel.json`** — Configura headers de segurança, cache de assets e rewrite de SPA.

## Como funciona o fluxo

```
Desenvolvedor abre PR
        ↓
GitHub Actions: ci.yml (lint + typecheck + testes)
        ↓
GitHub Actions: staging.yml (build + deploy preview)
        ↓
Vercel publica: pr-42.gestaorecursoshumanos.vercel.app
        ↓
Bot comenta a URL no PR automaticamente
        ↓
Revisão e aprovação do PR
        ↓
Merge na main → deploy automático em produção (deploy-clinica.yml)
```

## Configuração necessária (única vez)

### 1. Criar projeto Supabase de Staging

- Acesse [supabase.com](https://supabase.com) e crie um novo projeto chamado `gestaorecursoshumanos-staging`
- Execute o script SQL completo (`supabase/migrations/`) neste novo projeto
- Copie a `URL` e a `anon key` do projeto de staging

### 2. Adicionar Secrets no GitHub

Acesse: `Settings → Secrets and variables → Actions → New repository secret`

| Secret | Valor |
| :--- | :--- |
| `STAGING_SUPABASE_URL` | URL do projeto Supabase de staging |
| `STAGING_SUPABASE_ANON_KEY` | Anon key do projeto Supabase de staging |
| `VERCEL_TOKEN` | Token de API do Vercel (Account Settings → Tokens) |
| `VERCEL_ORG_ID` | ID da organização no Vercel (`.vercel/project.json`) |
| `VERCEL_PROJECT_ID` | ID do projeto no Vercel (`.vercel/project.json`) |

### 3. Obter IDs do Vercel

Execute localmente uma vez:
```bash
npx vercel link
cat .vercel/project.json
# { "orgId": "...", "projectId": "..." }
```

### 4. Validar

Abra um PR de teste. O bot deve comentar a URL de preview em ~2 minutos.

## Variáveis de ambiente por ambiente

| Variável | Produção | Staging |
| :--- | :--- | :--- |
| `VITE_SUPABASE_URL` | Projeto Supabase prod | Projeto Supabase staging |
| `VITE_SUPABASE_ANON_KEY` | Anon key prod | Anon key staging |
| `VITE_EMAILJS_*` | Configuração real | Pode reutilizar a de prod |
