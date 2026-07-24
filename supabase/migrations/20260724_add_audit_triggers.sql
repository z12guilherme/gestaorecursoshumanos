-- ============================================================
-- Migration: Adicionar triggers de auditoria nas tabelas principais
-- Data: 2026-07-24
-- Motivo: Somente a tabela 'employees' possuía o trigger de auditoria.
--         Este script aplica o handle_audit_log() nas demais tabelas
--         relevantes para rastreamento completo de alterações.
-- ============================================================

-- Colaboradores (já existia, garantindo idempotência)
DROP TRIGGER IF EXISTS audit_employees_changes ON public.employees;
CREATE TRIGGER audit_employees_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.employees
  FOR EACH ROW EXECUTE FUNCTION public.handle_audit_log();

-- Férias & Ausências
DROP TRIGGER IF EXISTS audit_time_off_requests_changes ON public.time_off_requests;
CREATE TRIGGER audit_time_off_requests_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.time_off_requests
  FOR EACH ROW EXECUTE FUNCTION public.handle_audit_log();

-- Controle de Ponto
DROP TRIGGER IF EXISTS audit_time_entries_changes ON public.time_entries;
CREATE TRIGGER audit_time_entries_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.time_entries
  FOR EACH ROW EXECUTE FUNCTION public.handle_audit_log();

-- Avaliações de Desempenho
DROP TRIGGER IF EXISTS audit_performance_reviews_changes ON public.performance_reviews;
CREATE TRIGGER audit_performance_reviews_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.performance_reviews
  FOR EACH ROW EXECUTE FUNCTION public.handle_audit_log();

-- Chamados / Tickets
DROP TRIGGER IF EXISTS audit_tickets_changes ON public.tickets;
CREATE TRIGGER audit_tickets_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.tickets
  FOR EACH ROW EXECUTE FUNCTION public.handle_audit_log();

-- Recrutamento - Vagas
DROP TRIGGER IF EXISTS audit_jobs_changes ON public.jobs;
CREATE TRIGGER audit_jobs_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.jobs
  FOR EACH ROW EXECUTE FUNCTION public.handle_audit_log();

-- Recrutamento - Candidatos
DROP TRIGGER IF EXISTS audit_candidates_changes ON public.candidates;
CREATE TRIGGER audit_candidates_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.candidates
  FOR EACH ROW EXECUTE FUNCTION public.handle_audit_log();

-- Comunicação - Anúncios
DROP TRIGGER IF EXISTS audit_announcements_changes ON public.announcements;
CREATE TRIGGER audit_announcements_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.announcements
  FOR EACH ROW EXECUTE FUNCTION public.handle_audit_log();

-- Ouvidoria - Sugestões
DROP TRIGGER IF EXISTS audit_suggestions_changes ON public.suggestions;
CREATE TRIGGER audit_suggestions_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.suggestions
  FOR EACH ROW EXECUTE FUNCTION public.handle_audit_log();

-- Configurações do Sistema
DROP TRIGGER IF EXISTS audit_settings_changes ON public.settings;
CREATE TRIGGER audit_settings_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.settings
  FOR EACH ROW EXECUTE FUNCTION public.handle_audit_log();

-- Perfis de Usuário
DROP TRIGGER IF EXISTS audit_profiles_changes ON public.profiles;
CREATE TRIGGER audit_profiles_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_audit_log();

-- Documentos de Colaboradores
DROP TRIGGER IF EXISTS audit_employee_documents_changes ON public.employee_documents;
CREATE TRIGGER audit_employee_documents_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.employee_documents
  FOR EACH ROW EXECUTE FUNCTION public.handle_audit_log();

-- Configurações de Folha de Pagamento
DROP TRIGGER IF EXISTS audit_payroll_configurations_changes ON public.payroll_configurations;
CREATE TRIGGER audit_payroll_configurations_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.payroll_configurations
  FOR EACH ROW EXECUTE FUNCTION public.handle_audit_log();
