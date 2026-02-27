# 🗺️ Roadmap de Melhorias Técnicas

## 🔴 Alta Prioridade (Implementar Agora)

### 1. 🧪 Implementar Testes Automatizados
> **Problema:** Não há testes, gerando risco de bugs em produção e refatorações perigosas.
- [ ] Configurar **Jest + React Testing Library**.
- [ ] Criar testes unitários para cálculo de folha (regras críticas).
- [ ] Criar testes de integração para fluxo de Autenticação.
- [ ] Criar testes para transições de status de Ponto.
- [ ] **Meta:** Atingir 80% de cobertura nas regras de negócio.

### 2. 🔐 Autenticação com 2FA (MFA)
> **Problema:** Login apenas com email/senha deixa contas de Admin vulneráveis.
- [ ] Habilitar suporte a MFA no Supabase Auth.
- [ ] Implementar fluxo de UI para leitura de QR Code (TOTP - Google Authenticator).
- [ ] Criar tela de verificação de código no login.

### 3. 👁️ Sistema de Auditoria (Audit Logs)
> **Problema:** Impossível rastrear quem alterou salários ou demitiu funcionários (Compliance/LGPD).
- [ ] Criar tabela `audit_logs` no Supabase.
- [ ] Implementar trigger ou middleware para registrar: `user_id`, `action`, `resource`, `timestamp`, `old_value`, `new_value`.
- [ ] Criar tela de visualização de logs para o Super Admin.

### 4. 🏗️ Separar Lógica de Negócio (Service Layer)
> **Problema:** Hooks (`useEmployees`, etc) misturam acesso a dados com regras de negócio.
- [ ] Criar pasta `src/services/`.
- [ ] Refatorar `employeeService.ts` (cálculos, validações).
- [ ] Refatorar `timeEntryService.ts` (lógica de ponto e saldo).
- [ ] Refatorar `reportService.ts` (geração de PDF/Excel).

---

## 🟠 Média Prioridade (Próximos 1-2 Sprints)

### 5. ⚡ Otimização de Performance
> **Problema:** SPA carrega todo o bundle inicial, podendo ficar lenta.
- [ ] Implementar **Lazy Loading** de rotas (`React.lazy` + `Suspense`).
- [ ] Configurar Code Splitting automático no Vite.
- [ ] Analisar bundle com `vite-plugin-visualizer`.
- [ ] Implementar virtualização (TanStack Virtual) nas tabelas de Ponto e Funcionários.

### 6. 🛡️ Rate Limiting & Proteção
> **Problema:** Risco de abuso da API e DoS.
- [ ] Revisar políticas de RLS (Row Level Security) no Supabase.
- [ ] Implementar *debounce* e *throttle* em inputs de busca e botões de ação.
- [ ] Avaliar necessidade de Edge Functions para proteção extra.

### 7. ♿ Acessibilidade (WCAG 2.1)
> **Problema:** Componentes podem não ser navegáveis por teclado ou leitores de tela.
- [ ] Realizar auditoria com **axe DevTools**.
- [ ] Adicionar `aria-labels` em formulários e botões de ícone.
- [ ] Garantir navegação completa via teclado (Tab, Enter, Esc).
- [ ] Verificar e corrigir contrastes de cores (modo claro/escuro).

### 8. 🔗 Integração Contábil/ERP
> **Problema:** Retrabalho manual para exportar folha para contabilidade.
- [ ] Estudar APIs de ERPs (Bling, Omie ou Celeris).
- [ ] Criar exportação de arquivo padrão (CNAB ou CSV estruturado) para importação bancária.

---

## 🟡 Média-Baixa Prioridade (Backlog)

### 9. 📊 Dashboard Avançado (Analytics)
> **Problema:** KPIs atuais são estáticos e não mostram tendências.
- [ ] Implementar gráficos de linha para evolução de custos.
- [ ] Criar análise de Turnover (previsão e histórico).
- [ ] Adicionar filtros de data e comparativos (Mês Atual vs Mês Anterior).

### 10. 🔔 Notificações Push (PWA)
> **Problema:** Usuários perdem avisos se não estiverem com o app aberto.
- [ ] Configurar Service Workers para **Web Push API**.
- [ ] Implementar notificações para:
    - Aprovação de Férias.
    - Lembrete de Ponto não batido.
    - Novos Comunicados.
