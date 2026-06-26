import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { mockDatabase, USE_MOCK } from "@/lib/mockDatabase";
import { BaseRepository } from "@/lib/repository/BaseRepository";

export interface Employee {
  id: string;
  name: string;
  email: string;
  role: string; // No banco chamamos de role (Cargo)
  department: string;
  status: string;
  admission_date: string; // No banco chamamos de admission_date
  password?: string; // Senha para o ponto eletrônico
  created_at?: string;
  // Campos adicionais de cadastro
  phone?: string;
  contract_type?: string;
  birth_date?: string;
  manager?: string;
  work_schedule?: string;
  unit?: string;
  // Campos financeiros (Folha de Pagamento)
  base_salary?: number;
  fixed_discounts?: number;
  has_insalubrity?: boolean;
  has_night_shift?: boolean;
  contracted_hours?: number;
}

const employeeRepository = new BaseRepository<Employee>("employees");

export function useEmployees(page: number = 1, pageSize: number = 1000) {
  const queryClient = useQueryClient();

  const {
    data: queryData,
    isLoading: loading,
    error: queryError,
    refetch,
  } = useQuery<{ data: Employee[]; count: number | null }>({
    queryKey: ["employees", page, pageSize],
    queryFn: async () => {
      const result = await employeeRepository.find({
        page,
        pageSize,
        orderBy: "name",
      });
      if (result.error) throw result.error;
      return { data: result.data, count: result.count };
    },
  });

  const employees = queryData?.data || [];
  const totalCount = queryData?.count || 0;
  const error = queryError ? (queryError as any).message || String(queryError) : null;

  const fetchPublicEmployees = async () => {
    try {
      if (USE_MOCK) {
        const data = mockDatabase.get("employees").map((e: any) => ({
          id: e.id,
          name: e.name,
          department: e.department,
          role: e.role,
          status: e.status,
        }));
        data.sort((a: Employee, b: Employee) => a.name.localeCompare(b.name));
        return data;
      }

      const { data, error } = await supabase.from("employees_public").select("*").order("name");

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error("Erro ao buscar colaboradores públicos:", err);
      return [];
    }
  };

  const addEmployee = async (employee: Omit<Employee, "id" | "created_at">) => {
    const result = await employeeRepository.create(employee);
    if (!result.error) {
      await queryClient.invalidateQueries({ queryKey: ["employees"] });
    }
    return result;
  };

  const updateEmployee = async (id: string, updates: Partial<Employee>) => {
    const result = await employeeRepository.update(id, updates);
    if (!result.error) {
      await queryClient.invalidateQueries({ queryKey: ["employees"] });
    }
    return result;
  };

  const deleteEmployee = async (id: string) => {
    const result = await employeeRepository.delete(id); // Use soft delete from BaseRepository
    if (!result.error) {
      await queryClient.invalidateQueries({ queryKey: ["employees"] });
    }
    return result;
  };

  // Função para validar login do funcionário no Ponto Eletrônico
  const validateEmployeeLogin = async (employeeId: string, passwordInput: string) => {
    try {
      if (USE_MOCK) {
        const emps = mockDatabase.get("employees");
        const found = emps.find((e: any) => e.id === employeeId && e.password === passwordInput);
        return !!found;
      }

      const { data, error } = await supabase
        .from("employees")
        .select("id")
        .eq("id", employeeId)
        .eq("password", passwordInput)
        .single();

      if (error || !data) return false;
      return true;
    } catch {
      return false;
    }
  };

  const getEmployeeDetails = async (id: string) => {
    return await employeeRepository.findById(id);
  };

  return {
    employees,
    totalCount,
    loading,
    error,
    refetch,
    fetchPublicEmployees,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    validateEmployeeLogin,
    getEmployeeDetails,
  };
}
