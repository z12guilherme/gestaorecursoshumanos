# 🗺️ Roadmap de Melhorias Técnicas

## 🔴 Alta Prioridade (Implementar Agora)

### 1. 🧪 Implementar Testes Automatizados
> **Problema:** Não há testes, gerando risco de bugs em produção e refatorações perigosas.
- [x] Configurar **Vitest + React Testing Library** (Substituto moderno do Jest para Vite).
- [x] Criar testes unitários para cálculo de folha/analytics (Exemplo criado em `analyticsService.test.ts`).
- [x] Criar testes de integração para fluxo de Autenticação (`src/pages/Login.test.tsx`).
- [x] Criar testes para transições de status de Ponto (`src/services/timeEntryService.test.ts`).
- [x] **Meta:*  * Atingir 80% de cobertura nas regras de negócio.


### 2. 👁️ Sistema de Auditoria (Audit Logs)
> **Problema:** Impossível rastrear quem alterou salários ou demitiu funcionários (Compliance/LGPD).
- [x] Criar tabela `audit_logs` no Supabase (SQL adicionado ao DATABASE_RESTORE.md).
- [x] Implementar trigger para registrar alterações automaticamente.
- [x] Criar tela de visualização de logs (`src/pages/AuditLogs.tsx`).

### 3. 🏗️ Separar Lógica de Negócio (Service Layer)
> **Problema:** Hooks (`useEmployees`, etc) misturam acesso a dados com regras de negócio.
- [x] Criar pasta `src/services/` (Iniciado com `analyticsService`).
- [x] Refatorar `employeeService.ts` (cálculos, validações).
- [x] Refatorar `timeEntryService.ts` (lógica de ponto e saldo).
- [x] Refatorar `reportService.ts` (geração de PDF/Excel).

---

## 🟠 Média Prioridade (Próximos 1-2 Sprints)

### 4. ⚡ Otimização de Performance
> **Problema:** SPA carrega todo o bundle inicial, podendo ficar lenta.
- [x] Implementar **Lazy Loading** de rotas (`React.lazy` + `Suspense`).
- [x] Configurar Code Splitting automático no Vite (Chunks manuais para libs pesadas).
- [x] Analisar bundle com `vite-plugin-visualizer` (Configurado no build).
- [x] Implementar virtualização (TanStack Virtual) nas tabelas de Ponto e Funcionários. (Feito em Ponto)

### 5. 🛡️ Rate Limiting & Proteção
> **Problema:** Risco de abuso da API e DoS.
- [x] Revisar políticas de RLS (Row Level Security) no Supabase.
- [x] Implementar *debounce* e *throttle* em inputs de busca e botões de ação. (Implementado Debounce)
- [x] Avaliar necessidade de Edge Functions para proteção extra.


### 6. 🔗 Integração Contábil/ERP
> **Problema:** Retrabalho manual para exportar folha para contabilidade.
- [x] Estudar APIs de ERPs (Documentado em `docs/ERP_RESEARCH.md`).
- [x] Criar exportação de arquivo padrão (CNAB ou CSV estruturado) para importação bancária. (`src/services/payrollExportService.ts`)

---

## 🟡 Média-Baixa Prioridade (Backlog)

### 7. 📊 Dashboard Avançado (Analytics)
- [x] Implementar gráficos de linha para evolução de custos. (`DashboardAnalytics.tsx`)
- [x] Criar análise de Turnover/Crescimento (previsão e histórico). (`DashboardAnalytics.tsx`)
- [x] Adicionar filtros de data e comparativos (Mês Atual vs Mês Anterior).

- [ ] Crachá dinâmico para os funcionários
