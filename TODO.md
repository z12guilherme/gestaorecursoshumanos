# TODO - Pendências Reais

> Atualizado em 2026-07-15 com implementações concluídas.

## O que já está entregue

- Validações com Zod nos formulários principais.
- Cache e sincronização de API com React Query.
- Audit logs e trilha de auditoria.
- Service layer inicial para regras de negócio.
- Testes unitários, de integração e E2E.
- PWA/offline, analytics, exportações e módulos SaaS/white-label.

## Concluído Recentemente

### Qualidade de código

- [x] Configurar Husky + lint-staged para bloquear commits com lint ou tipagem quebrados.

### Documentação interativa da UI

- [x] Criar Storybook para os componentes base da interface.

### Staging

- [x] Habilitar staging automático via Vercel Preview para cada branch.
- [x] Validar variáveis de ambiente e fluxo de deploy por branch.

### Arquitetura e Qualidade de Código

- [x] Refatorar a Camada de Serviços (Service Layer) para adotar o **Repository Pattern**.
  - `employeeService.ts` agora herda de `BaseRepository` e expõe `employeeRepository`.
  - Componentes React não mais acessam o Supabase diretamente para operações de colaboradores.

### Segurança e Banco de Dados

- [x] Implementar **Rate Limiting** em ações críticas:
  - Throttle de 2s no botão de login (anti brute-force).
  - Throttle de 3s na verificação MFA.
  - Throttle de 5s no registro de ponto eletrônico (evita duplos registros).
  - `useThrottle` adicionado ao `useDebounce.ts`.
- [x] **Autenticação Multifator (MFA/2FA)**: fluxo de verificação TOTP completo no `Login.tsx` via `supabase.auth.mfa.challengeAndVerify()`.
- [x] **Soft Delete** em tabelas críticas:
  - Migration SQL `20260715_soft_delete_employees.sql` criada com coluna `deleted_at`, índice de performance, View pública atualizada, políticas RLS e função `restore_employee()`.
  - `BaseRepository.delete()` agora usa soft delete real (coluna `deleted_at`) com fallback gracioso.
  - `BaseRepository.find()` filtra automaticamente registros com `deleted_at IS NOT NULL`.

### Performance e Escalabilidade

- [x] **Paginação Server-Side** em colaboradores:
  - `useEmployees` agora recebe `page` e `pageSize` reais (20 registros/página).
  - UI de paginação aprimorada com indicador de página atual e total.
  - Busca com filtros mantém comportamento client-side enquanto paginação sem filtros é server-side.
- [x] **Lazy Loading** de rotas (`React.lazy`) já existia. `jspdf` já usa dynamic import em `Payroll.tsx` via `await import("jspdf")`.

### Novas Funcionalidades

- [x] **Sincronização Offline** do Ponto Eletrônico:
  - `offlineDb.ts` com IndexedDB já implementado.
  - `ClockIn.tsx` já sincroniza ao voltar online via `window.addEventListener('online', ...)`.
  - Throttle adicionado para evitar duplos registros.
- [x] **Webhooks** para integração contábil:
  - Edge Function `supabase/functions/payroll-webhook/index.ts` criada.
  - Botão "Fechar Folha & Notificar ERP" adicionado em `Payroll.tsx`.
  - Aba "Integrações" adicionada em `Settings.tsx` para configurar URL do ERP.
  - Migration `20260715_add_webhook_url_settings.sql` criada para coluna `webhook_url` em `settings`.
  - Deploy: `supabase functions deploy payroll-webhook`.
