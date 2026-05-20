<!-- markdownlint-disable MD025 MD033 -->
# 📘 Documentação Técnica e Funcional - Plataforma RH - Rede DMI

> 🛡️ **Propriedade Intelectual:** Este software, sua arquitetura e documentação técnica são de propriedade exclusiva da **Inove Dev**. É terminantemente proibido espelhar, modificar, realizar engenharia reversa ou distribuir qualquer parte deste sistema sem autorização prévia e formal dos proprietários.

## Introdução

A plataforma **RH - Rede DMI** é uma solução completa de Gestão de Capital Humano (HCM) projetada para otimizar as rotinas do departamento pessoal e estratégico. Desenvolvida com foco em eficiência operacional, conformidade legal (LGPD) e segurança, o sistema centraliza informações e processos em um ambiente seguro e escalável.

Este documento serve como um guia abrangente, detalhando a arquitetura, funcionalidades, aspectos de segurança, modelo de implantação SaaS e o roadmap de desenvolvimento da plataforma.

## 1. Tecnologias Utilizadas

O sistema é construído sobre um stack tecnológico moderno e robusto, garantindo performance, escalabilidade e facilidade de manutenção:

-   **Frontend:**
    -   **React:** Biblioteca JavaScript para construção de interfaces de usuário.
    -   **TypeScript:** Superset do JavaScript que adiciona tipagem estática, melhorando a robustez e manutenibilidade do código.
    -   **Vite:** Ferramenta de build de frontend rápida e otimizada.
    -   **TailwindCSS:** Framework CSS utilitário para estilização rápida e responsiva.
    -   **Shadcn/ui:** Coleção de componentes UI reutilizáveis e acessíveis.
-   **Backend/Database:**
    -   **Supabase:** Plataforma de código aberto que oferece um backend como serviço (BaaS), incluindo:
        -   **PostgreSQL:** Banco de dados relacional robusto.
        -   **Auth:** Sistema de autenticação e autorização.
        -   **Realtime:** Funcionalidades de tempo real.
        -   **Storage:** Armazenamento de arquivos (buckets).
        -   **Edge Functions:** Funções serverless.
-   **Serviços Externos:**
    -   **EmailJS:** Serviço para envio de e-mails diretamente do frontend.
    -   **Vercel:** Plataforma para deploy e hospedagem do frontend.
-   **Testes:**
    -   **Vitest:** Framework de testes rápido para JavaScript/TypeScript.
    -   **React Testing Library:** Utilitários para testar componentes React.
    -   **Playwright:** Framework para testes End-to-End (E2E).
-   **Outras Bibliotecas Notáveis:**
    -   `@tanstack/react-query`: Gerenciamento de estado assíncrono.
    -   `exceljs`: Geração e manipulação de planilhas Excel.
    -   `jspdf`, `jspdf-autotable`: Geração de PDFs.
    -   `date-fns`: Manipulação de datas.
    -   `zod`: Validação de esquemas.

## 2. Arquitetura do Sistema

A arquitetura do RH - Rede DMI é baseada em um modelo de cliente-servidor, com o frontend sendo uma Single Page Application (SPA) e o backend gerenciado pelo Supabase.

### 2.1. Frontend (React/Vite)

O frontend é desenvolvido em React com TypeScript, utilizando Vite para um ambiente de desenvolvimento rápido e builds otimizados. A interface é construída com TailwindCSS e Shadcn/ui, garantindo um design consistente e responsivo. A lógica de negócio é encapsulada em uma camada de serviços (`src/services/`), isolando as chamadas ao Supabase e facilitando a testabilidade.

### 2.2. Backend e Banco de Dados (Supabase)

O Supabase atua como o coração do backend, fornecendo:

-   **PostgreSQL:** O banco de dados armazena todos os dados da aplicação. O esquema (`20260423172634_remote_schema.sql`) inclui tabelas para `employees`, `audit_logs`, `time_entries`, `performance_reviews`, entre outros.
-   **Row Level Security (RLS):** Políticas de RLS são aplicadas em todas as tabelas sensíveis para garantir que os usuários só possam acessar os dados aos quais têm permissão. Para o modelo SaaS multi-instância, as políticas são configuradas para permitir acesso total a usuários autenticados (`using (true)`), pois cada cliente possui sua própria instância isolada do Supabase.
-   **Views Seguras:** A view `employees_public` foi criada para expor apenas dados não sensíveis de funcionários, prevenindo a exposição de informações como `base_salary` e `fixed_discounts` para o frontend em contextos onde não são necessários.
-   **Funções e Triggers:**
    -   `handle_audit_log()`: Trigger para registrar automaticamente todas as alterações (INSERT, UPDATE, DELETE) em tabelas monitoradas na tabela `audit_logs`, com sanitização de dados sensíveis como senhas.
    -   `prevent_self_deletion()`: Trigger que impede um administrador de excluir sua própria conta, evitando cenários de lockout.
    -   `handle_new_user()`: Função que cria um perfil (`profiles`) para cada novo usuário autenticado.
    -   `get_employee_by_pin()`: Função para buscar funcionários por PIN (senha), utilizada no terminal de ponto.
-   **Storage:** Buckets (`resumes`, `avatars`, `documents`, `time-off-attachments`) são utilizados para armazenar arquivos, com políticas de acesso configuradas via RLS do Storage.
-   **Autenticação:** O Supabase gerencia a autenticação de usuários, utilizando JWTs para sessões.

### 2.3. Serviços Externos

-   **EmailJS:** Utilizado para o envio de e-mails transacionais, como holerites digitais, diretamente do cliente, configurado com `Service ID`, `Template ID` e `Public Key`.
-   **Vercel:** A plataforma de deploy do frontend, onde as variáveis de ambiente do Supabase e EmailJS são configuradas como segredos.

## 3. Funcionalidades Principais

A plataforma RH - Rede DMI oferece um conjunto abrangente de funcionalidades para a gestão de recursos humanos:

### 3.1. Visão Executiva e Dashboard

Central de comando com KPIs em tempo real, incluindo métricas de headcount, análise de turnover, distribuição demográfica e alertas operacionais (férias a vencer, aniversariantes).

### 3.2. Gestão de Colaboradores (Dossiê Digital)

Unifica informações cadastrais, contratuais e financeiras.
-   **Cadastro e Integração (Onboarding):** Formulários detalhados e importação em massa de planilhas.
-   **Gestão Eletrônica de Documentos (GED):** Arquivamento seguro de documentos em nuvem.
-   **Movimentação e Desligamento:** Alteração de status e gestão de senhas (PIN) para ponto eletrônico.

### 3.3. Folha de Pagamento e Holerites Digitais

Automatiza o fechamento financeiro e a distribuição de contracheques.
-   **Configuração Financeira:** Suporte a proventos fixos e variáveis, e cálculo tributário automático.
-   **Emissão e Assinatura Eletrônica:** Geração de PDF, envio por e-mail, assinatura digital com captura de IP/User Agent e carimbo de tempo.
-   **Integração Bancária e Contábil:** Exportação de arquivos CNAB ou CSV.

### 3.4. Controle de Frequência e Ponto Eletrônico

Solução moderna para registro de jornada.
-   **Terminal do Colaborador (PWA):** Registro rápido via PIN, com geolocalização opcional.
-   **Gestão de Frequência (Visão RH):** Espelho de ponto, mapa interativo de batidas e cálculo de saldo de horas.

### 3.5. Férias e Afastamentos

Gerenciamento do cronograma de descanso anual.
-   **Painel de Solicitações:** Centraliza pedidos de férias e atestados.
-   **Fluxo de Aprovação:** Gestores aprovam/rejeitam solicitações.
-   **Automação de Status:** Atualização automática do status do colaborador.

### 3.6. Recrutamento e Seleção (ATS)

Sistema de rastreamento de candidatos integrado.
-   **Gestão de Vagas:** Criação e publicação de vagas.
-   **Banco de Talentos:** Repositório de candidatos e currículos.
-   **Pipeline Visual (Kanban):** Gestão fluida do processo seletivo.

### 3.7. Avaliação de Desempenho

Módulo para acompanhamento da performance.
-   **Ciclos de Avaliação:** Registro de notas, metas e feedback.
-   **Feedback Oficial:** Arquivamento do histórico de feedbacks.

### 3.8. Comunicação Interna e Ouvidoria

Canais oficiais e seguros para engajamento e transparência.
-   **Mural Digital Corporativo:** Ferramenta de broadcast com notificações por prioridade.
-   **Canal de Ouvidoria:** Portal web independente para manifestações anônimas/identificadas, com gestão de tickets.

### 3.9. Assistente Virtual de IA

Utiliza NLP para traduzir comandos em português para ações no banco de dados, facilitando consultas, agendamentos, abertura de vagas e movimentação de pessoal.

### 3.10. Automações de Rotina

Motor de automação para tarefas personalizadas, com templates e desenvolvimento assistido por IA (geração de scripts Python).

### 3.11. Configurações do Sistema

Módulo para administradores gerenciarem variáveis globais, incluindo perfil pessoal, dados institucionais (white-label), preferências operacionais e personalização de tema.

## 4. Segurança

A segurança da informação e a privacidade dos dados são pilares fundamentais do RH - Rede DMI.

### 4.1. Vulnerabilidades Identificadas e Mitigadas (Pentest)

Um relatório de Pentest detalhado (`PENTEST_REPORT.md` e `SECURITY.md`) identificou e corrigiu diversas vulnerabilidades:

-   **Exposição de Dados Financeiros (IDOR / Excessive Data Exposure):** A API retornava campos sensíveis (`base_salary`, `fixed_discounts`).
    -   **Correção:** Implementação da View segura `employees_public` no banco de dados, removendo colunas sensíveis para consultas gerais. O frontend foi refatorado para consumir esta View.
-   **Auto-Exclusão de Administrador (Disponibilidade):** Um administrador conseguia excluir sua própria conta.
    -   **Correção:** Criação do Trigger `prevent_self_deletion` no PostgreSQL que impede a exclusão se o ID do alvo for igual ao ID do usuário logado.
-   **Dependências Vulneráveis (Supply Chain):** A biblioteca `xlsx` possuía vulnerabilidades.
    -   **Correção:** Substituição pela `exceljs`. Além disso, a vulnerabilidade de alta severidade no `picomatch` foi resolvida via `overrides` no `package.json` e atualização do Vite.
-   **Falta de Rate Limiting no Login (Brute Force):** O endpoint de autenticação permitia tentativas ilimitadas.
    -   **Correção:** Ativação da configuração de Rate Limiting nativa do Supabase para proteção contra força bruta.
-   **Validação de Tipos na API:** Testes de injeção de tipos foram tratados corretamente pelo PostgreSQL, retornando `400 Bad Request`.
-   **Injeção de Fórmulas (CSV Injection):** A biblioteca `exceljs` tratou dados maliciosos como texto literal.

### 4.2. RLS e Views Seguras

As políticas de Row Level Security (RLS) são aplicadas em todas as tabelas para restringir o acesso aos dados. A `employees_public` view garante que dados sensíveis não sejam expostos em contextos públicos ou para usuários sem permissão.

### 4.3. Trilha de Auditoria Universal (Audit Logs)

A tabela `audit_logs` e o trigger `handle_audit_log` registram todas as alterações significativas no banco de dados, incluindo quem fez a alteração, quando e quais dados foram modificados (com sanitização de campos sensíveis).

### 4.4. Controles de Acesso

Sessões são gerenciadas via JWTs. Proteções contra força-bruta (Rate Limiting) e a prevenção de auto-exclusão de administradores estão implementadas.

## 5. Modelo SaaS Multi-Instância

O sistema é projetado para um modelo SaaS multi-instância, onde cada cliente possui sua própria infraestrutura isolada (Vercel + Supabase).

### 5.1. Setup de Novo Cliente (15 Minutos)

O processo de integração de um novo cliente é otimizado para ser concluído em aproximadamente 15 minutos (`DEPLOY.md`):

1.  **Setup do Supabase:** Criação de um novo projeto, configuração de API Keys, execução do script SQL completo (`20260423172634_remote_schema.sql`) para criar tabelas, RLS, Storage Buckets, Triggers, Views Seguras, e inserção do primeiro administrador.
2.  **Setup do EmailJS:** Configuração de Email Service e Template para holerites.
3.  **Deploy no Vercel:** Importação do repositório, configuração de variáveis de ambiente (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_EMAILJS_SERVICE_ID`, `VITE_EMAILJS_TEMPLATE_ID`, `VITE_EMAILJS_PUBLIC_KEY`).
4.  **White-label e Primeiro Acesso:** Personalização da identidade visual da empresa (nome, CNPJ, cores, logo) através do painel de configurações.

### 5.2. Gerenciamento de Migrações

A CLI do Supabase é utilizada para gerenciar migrações de banco de dados (`MIGRATIONS.md`), garantindo que todas as instâncias de clientes estejam sempre atualizadas com o esquema mais recente.

## 6. Roadmap e Melhorias Futuras

O `TODO.md` detalha o roadmap de melhorias contínuas da plataforma:

### 6.1. Alta Prioridade

-   **Testes Automatizados:** Configuração de Vitest + React Testing Library e Playwright para testes unitários, de integração e E2E, visando 80% de cobertura das regras de negócio.
-   **Sistema de Auditoria (Audit Logs):** Implementação completa da tela de visualização de logs.
-   **Separação da Lógica de Negócio (Service Layer):** Refatoração de serviços como `employeeService.ts`, `timeEntryService.ts` e `reportService.ts`.

### 6.2. Média Prioridade

-   **Otimização de Performance:** Lazy Loading, Code Splitting e virtualização de tabelas.
-   **Rate Limiting & Proteção:** Revisão de RLS e implementação de debounce/throttle.
-   **Integração Contábil/ERP:** Exportação de arquivos padrão (CNAB/CSV).

### 6.3. Média-Baixa Prioridade (Backlog)

-   **Dashboard Avançado (Analytics):** Gráficos de evolução de custos, análise de Turnover/Crescimento.

### 6.4. Futuro (Novas Propostas e Evolução)

-   **Segurança Avançada e Acessos:** Autenticação Multifator (MFA/2FA) via TOTP, gerenciamento de sessões ativas.
-   **Experiência Offline e PWA:** Sincronização Offline no Terminal de Ponto usando IndexedDB.
-   **Expansão da Inteligência Artificial:** Parsing de currículos, modelo preditivo de turnover.
-   **Testes E2E (End-to-End):** Configuração de Playwright e integração com CI/CD.

### 6.5. Fase 2: V2 e Escalamento

-   **Escalabilidade de UI:** Paginação Server-side para tabelas grandes.
-   **Precisão no Analytics e Modelo de Dados:** Adição de `termination_date` na tabela `employees` para cálculo de Turnover.
-   **Autoatendimento (Self-Service) de Atualização Cadastral:** Fluxo para funcionários atualizarem dados básicos com aprovação do RH.
-   **Sugestões do RH:** Melhorias em relatórios de ponto, contracheques.

### 6.6. Fase 4: Personalização Avançada (SaaS Premium)

-   **Campos Personalizados Flexíveis (Custom Fields):** Adição de `custom_fields` (jsonb) na tabela `employees` e configuração dinâmica via `settings`.
-   **Página de Carreiras Pública Personalizável (ATS):** Customização da página de vagas com branding da empresa.

## Conclusão

A plataforma RH - Rede DMI é uma solução robusta e segura, em constante evolução para atender às demandas do mercado de gestão de recursos humanos. Com uma arquitetura bem definida e um roadmap claro, o sistema está preparado para escalar e oferecer valor significativo aos seus clientes.

---

**Última Atualização:** 2026-05-20

```