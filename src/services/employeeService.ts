import { BaseRepository } from "@/lib/repository/BaseRepository";

/**
 * Interface de colaborador compatível com o schema do banco.
 */
export interface EmployeeRecord {
  id: string;
  name: string;
  email?: string;
  role?: string;
  department?: string;
  status?: string;
  admission_date?: string;
  termination_date?: string;
  termination_reason?: string;
  deleted_at?: string | null;
  [key: string]: unknown;
}

/**
 * Repository específico para colaboradores.
 * Encapsula regras de negócio sobre a tabela `employees`,
 * garantindo que componentes React não acessem o Supabase diretamente.
 *
 * Padrão: Repository Pattern — toda query à tabela passa por aqui.
 */
class EmployeeRepository extends BaseRepository<EmployeeRecord> {
  constructor() {
    super("employees");
  }

  /**
   * Busca todos os colaboradores ativos (não deletados, não desligados).
   * Usa a View pública para evitar vazamento de dados sensíveis (PIN/salário).
   */
  async getAllActive(): Promise<EmployeeRecord[]> {
    const result = await this.find({
      orderBy: "name",
      includeDeleted: false,
    });
    if (result.error) throw result.error;
    return (result.data || []).filter((e) => e.status !== "Desligado" && e.status !== "terminated");
  }

  /**
   * Realiza o desligamento de um colaborador aplicando soft delete e
   * registrando a data/motivo de desligamento.
   */
  async terminateEmployee(id: string, terminationDate: Date, reason: string): Promise<void> {
    if (!id || !reason) {
      throw new Error("ID e motivo do desligamento são obrigatórios.");
    }

    const result = await this.update(id, {
      status: "Desligado",
      termination_date: terminationDate.toISOString().split("T")[0],
      termination_reason: reason,
      deleted_at: new Date().toISOString(), // Soft delete ao desligar
    } as Partial<EmployeeRecord>);

    if (result.error) throw result.error;
  }
}

/**
 * Instância singleton do EmployeeRepository.
 * Use esta instância em todos os services e hooks que precisem
 * de acesso à tabela `employees`.
 */
export const employeeRepository = new EmployeeRepository();

/**
 * @deprecated Use `employeeRepository` diretamente.
 * Mantido por compatibilidade com código legado.
 */
export const employeeService = {
  getAllActive: () => employeeRepository.getAllActive(),
  terminateEmployee: (id: string, date: Date, reason: string) =>
    employeeRepository.terminateEmployee(id, date, reason),
};
