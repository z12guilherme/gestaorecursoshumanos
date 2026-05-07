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
- [x] Crachá dinâmico para os funcionários

---

## 🔵 Futuro (Novas Propostas e Evolução)

### 8. 🛡️ Segurança Avançada e Acessos (Em Andamento 🚀)
- [x] Implementar **Autenticação Multifator (MFA/2FA) via TOTP** (Google/Microsoft Authenticator).
- [x] Criar fluxo de Setup de MFA (Geração de QR Code) na tela de configurações.
- [x] Validar código TOTP no fluxo de Login (Step-up AAL2).
- [ ] Criar gerenciamento de sessões ativas (permitir que o usuário encerre sessões abertas em outros dispositivos).

### 9. 📱 Experiência Offline e PWA (Em Andamento 🚀)
- [x] Configurar Service Workers robustos para caching offline (Vite PWA).
- [x] Implementar **Sincronização Offline no Terminal de Ponto** (salvar batida localmente no IndexedDB e sincronizar com o Supabase quando houver rede).

### 10. 🤖 Expansão da Inteligência Artificial (Em Andamento 🚀)
- [x] Adicionar funcionalidade de *Parsing* de Currículos no módulo ATS (extrair dados de PDF automaticamente com IA).
- [x] Implementar modelo preditivo de IA para alertar sobre alto risco de turnover com base em dados de faltas, avaliações e horas extras.

### 11. 🧪 Testes E2E (End-to-End)
- [x] Configurar **Playwright** no projeto.
- [x] Criar testes automatizados para fluxos críticos: Assinatura de Holerite, Bater Ponto e Fluxo de Admissão.
- [x] Integrar rodada de testes E2E na pipeline de CI/CD (ex: GitHub Actions).

---

## 🚀 Fase 2: V2 e Escalonamento

### 1. Escalabilidade de UI (Paginação Server-side)
> **Problema:** Tabelas de crescimento contínuo (Auditoria, Ponto) baixam todos os dados de uma vez, causando alto consumo de memória e lentidão.
- [x] Refatorar `auditService.ts` para usar paginação (`.range()`) e contagem (`count: 'exact'`).
- [x] Atualizar tela de Auditoria (`AuditLogs.tsx`) com controles de "Página Anterior" e "Próxima".
- [x] Refatorar consultas grandes de `time_entries` para paginação no servidor.

### 2. Precisão no Analytics e Modelo de Dados
> **Problema:** O cálculo de Turnover depende de uma data exata de desligamento, que não existe na base atual.
- [x] Executar Migration SQL para adicionar `termination_date` na tabela `employees`.
- [x] Refatorar `analyticsService.ts` para usar a nova coluna nos cálculos históricos.

### 3. Autoatendimento (Self-Service) de Atualização Cadastral
> **Problema:** O RH perde muito tempo operacional digitando atualizações de dados básicos enviados pelos funcionários.
- [x] Executar Migration SQL para criar a tabela `employee_update_requests`.
- [x] Criar serviço `employeeUpdateService.ts` para gerenciar a fila de solicitações.
- [x] Integrar a Inbox do RH (Aprovação/Rejeição) à tela de Chamados/Tickets existente.
- [x] Integrar o formulário de atualização na tela do Colaborador, exigindo validação por Senha (PIN).

### 4. Sugestão do RH
- [x] Melhorar detalhes do Relatório de Ponto e separar por departamento / setor
- [x] Contra Cheque sair referente ao mês anterior. Ex: Se for puxado o contra cheque em Maio, ser referente ao mês de Abril.
- [x] Diminuir tamanho da assinatura do funcionário no contra cheque, pois está ocultando dados.

---

## 🏢 Fase 3: Modelo SaaS (Multi-Instância / Espelhamento)
> **Objetivo:** Empacotar o sistema para ser facilmente replicado para cada novo cliente em infraestrutura própria (Vercel + Supabase do cliente), mantendo o código centralizado no seu GitHub.
- [x] **Script de Setup Automático:** Consolidar todo o `DATABASE_RESTORE.md` (Tabelas, RLS, Storage Buckets, Triggers, Views Seguras) em um único script SQL (Migration) para subir o banco do cliente em 1 clique.
- [x] **Seed Inicial:** Criar uma função no script para inserir automaticamente o primeiro usuário Administrador (RH) e as configurações em branco na tabela `settings`.
- [x] **White-label (Personalização):** Garantir que logotipos, cores e nomes da empresa sejam 100% puxados da tabela `settings` para facilitar o "re-branding" de cada cliente logo no primeiro acesso.
- [x] **Guia de Integração Rápida:** Criar um checklist interno (ex: `DEPLOY.md`) com o passo a passo exato de variáveis de ambiente do Vercel, chaves do EmailJS e do Supabase para fazer o setup de um cliente novo em 15 minutos.

## 💎 Fase 4: Personalização Avançada (SaaS Premium)
> **Objetivo:** Adicionar funcionalidades que permitam aos clientes (RHs) adaptarem o sistema perfeitamente às suas necessidades específicas, agregando alto valor de venda ao produto.

### 1. 📝 Campos Personalizados Flexíveis (Custom Fields)
> **Problema:** Empresas diferentes precisam de dados diferentes no cadastro do colaborador (ex: Ramal, Restrição Alimentar, Placa do Carro, Tamanho do Uniforme).
- [x] **Banco de Dados:** Adicionar uma coluna `custom_fields` (tipo `jsonb`) na tabela `employees`.
- [x] **Banco de Dados:** Adicionar uma coluna `employee_custom_fields_config` (tipo `jsonb`) na tabela `settings` para guardar a definição dos campos (nome, tipo, se é obrigatório).
- [x] **Configurações:** Criar aba "Campos Personalizados" para o Admin definir quais campos extras o sistema deve exibir.
- [x] **Frontend:** Atualizar os formulários de Admissão e o Dossiê Digital para renderizar e salvar dinamicamente os campos configurados.

### 2. 💼 Página de Carreiras Pública Personalizável (ATS)
> **Problema:** A página de vagas é padronizada. O cliente precisa de uma "Landing Page" de vagas com o branding e a cultura da própria empresa para atrair mais talentos.
- [x] **Banco de Dados:** Adicionar colunas `career_page_banner`, `career_page_description` e `social_links` (tipo `jsonb`) na tabela `settings`.
- [x] **Configurações (Painel):** Criar aba "Portal de Vagas" nas Configurações para o RH fazer upload de imagem, texto sobre a cultura da empresa e links sociais.
- [x] **Portal Público:** Atualizar a tela pública de vagas para consumir as customizações, transformando-a em uma verdadeira vitrine da empresa.
