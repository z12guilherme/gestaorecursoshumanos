# Roadmap de Migração: LocalStorage -> Supabase

> **🎉 Status do Projeto: CONCLUÍDO**

Status do progresso de migração dos módulos para o backend real.

## ✅ Concluído
- [x] **Configuração Inicial:** Supabase Client e AuthContext.
- [x] **Autenticação:** Login e Logout funcionais.
- [x] **Colaboradores:** Listagem, CRUD e gerenciamento de senhas.
- [x] **Recrutamento:** Vagas, Candidatos e Kanban (com Drag & Drop).
- [x] **Avaliação de Desempenho:** Ciclos, Metas e Competências.
- [x] **Férias & Ausências:** Solicitações, Aprovação e Calendário.
- [x] **Ponto Eletrônico:** Registro (ClockIn) e Relatório (Timesheet).
- [x] **Comunicação:** Mural de Avisos e Notificações.

## 🚧 Em Progresso / Pendente
- [x] **Assistente IA:** Migrar leitura de dados do `localStorage` para os hooks do Supabase (`useEmployees`, etc).
- [x] **Relatórios:** Atualizar geração de PDF para usar dados reais.
- [x] **Automações:**
  - [x] Implementar persistência no banco para scripts gerados.
  - [x] Integrar a geração de script com uma API de IA real (substituir simulação).
- [x] **Configurações:** Salvar preferências no banco (UI e lógica implementados).

## 🧹 Limpeza e Otimização
- [x] Remover arquivo `src/data/mockData.ts`.
- [x] Remover todas as chamadas a `localStorage`.
- [x] Revisar regras de segurança (RLS) no Supabase para produção.

##  Sugestões do RH (Backlog)
- [x] Colocar barra de rolagem nas telas de acesso dos dados aos funcionários
- [x] Colocar relatórios geral por funcionário
- [x] Melhorar aba de relatórios
- [x] Colocar quem registrou ou não o ponto eletrônico na aba Controle de ponto
- [x] Colocar escala de trabalho do funcionário
- [x] Colocar comunicação com o RH através da aba de ponto
- [x] Colocar média de avaliação por colaborador em avaliação e desempenho
- [x] Anexar atestado a solicitação de férias e ausências
- [x] Incluir intervalo de horário de almoço no controle de ponto
- [x] Colocar para anexar documentos ao funcionário e uma forma dele acessar esses documentos, como contra-cheque
- [x] Deixar registro do mural de avisos
- [x] Colocar o funcionário para acessar o contra cheque através do controle de ponto
- [x] Coloca geolocalização de onde o funcionário acessou o ponto
- [x] Colocar observação de ponto
- [x] Colocar informações da empresa na aba de ponto
- [x] Separar funcionários por unidade

## 🚀 Novas Solicitações (Prioridade)
- [x] **Correção de Bug:** Ajustar rota da categoria "Férias e Ausências" (link incorreto).
- [x] **Gestão de Salários e Pagamentos (Folha):**
  - [x] Adicionar campos de Salário e Descontos no cadastro de funcionários.
  - [x] Criar nova categoria/aba de "Salários e Pagamentos".
  - [x] Implementar cálculo de folha (Salário + Adicionais - Descontos).
  - [x] Adicionar campos para adicionais: Insalubridade, Adicional Noturno, Hora Extra.
  - [x] Cadastrar carga horária (quantidade de horas) por funcionário.
  - [x] **Relatórios:** Gerar relatório de folha mensal detalhado.
- [ ] **Infraestrutura e Design:**
  - [ ] Configurar domínio `registro.br`
  - [ ] Inserir logomarca do sistema no Web e PWA (Solicitar a Bruno).