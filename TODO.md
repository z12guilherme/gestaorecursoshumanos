# TODO - Pendências Reais

> Atualizado em 2026-06-25 com base na análise de melhorias.

## O que já está entregue

- Validações com Zod nos formulários principais.
- Cache e sincronização de API com React Query.
- Audit logs e trilha de auditoria.
- Service layer inicial para regras de negócio.
- Testes unitários, de integração e E2E.
- PWA/offline, analytics, exportações e módulos SaaS/white-label.

## Pendências reais

### 1. Infraestrutura

- [ ] Criar e configurar e-mails corporativos para os gestores via Hostinger.
- [ ] Definir DNS, contas e credenciais para uso nos fluxos internos.

> ⚠️ Este item depende de acesso externo ao painel da Hostinger e permanece aberto até a configuração ser feita manualmente.

### 2. Arquitetura e Qualidade de Código

- [ ] Refatorar a Camada de Serviços (Service Layer) para adotar o **Repository Pattern**, garantindo que componentes React não acessem o Supabase diretamente.

### 3. Segurança e Banco de Dados

- [ ] Aprimorar o **Rate Limiting** em ações críticas com Throttling/Debounce no frontend e avaliar Edge Functions para endpoints sensíveis.
- [ ] Implementar **Autenticação Multifator (MFA/2FA)** para contas de Administrador/Gestor.
- [ ] Adotar **Soft Delete** em tabelas críticas como `employees`, adicionando uma coluna `deleted_at` e ajustando as políticas de RLS e Views.

### 4. Performance e Escalabilidade

- [ ] Implementar **Paginação Server-Side** nas tabelas principais (ex: colaboradores) utilizando o método `.range()` do Supabase.
- [ ] Otimizar o carregamento com **Lazy Loading** de rotas (`React.lazy`) e importação dinâmica de bibliotecas pesadas (ex: `jspdf`).

### 5. Novas Funcionalidades

- [ ] Desenvolver a funcionalidade de **Sincronização Offline** para o Ponto Eletrônico, utilizando IndexedDB e Service Workers.
- [ ] Criar **Webhooks** para integração contábil automatizada com sistemas de ERP quando uma folha de pagamento for fechada.

---

## Concluído Recentemente

### Qualidade de código

- [x] Configurar Husky + lint-staged para bloquear commits com lint ou tipagem quebrados.

### Documentação interativa da UI

- [x] Criar Storybook para os componentes base da interface.

### Staging

- [x] Habilitar staging automático via Vercel Preview para cada branch.
- [x] Validar variáveis de ambiente e fluxo de deploy por branch.
