# Roadmap de Migração: LocalStorage -> Supabase

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
- [ ] **Assistente IA:** Migrar leitura de dados do `localStorage` para os hooks do Supabase (`useEmployees`, etc).
- [ ] **Relatórios:** Atualizar geração de PDF para usar dados reais.
- [ ] **Automações:** Implementar persistência no banco.
- [ ] **Configurações:** Salvar preferências no banco.

## 🧹 Limpeza e Otimização
- [ ] Remover arquivo `src/data/mockData.ts`.
- [ ] Remover todas as chamadas a `localStorage`.
- [ ] Revisar regras de segurança (RLS) no Supabase para produção.