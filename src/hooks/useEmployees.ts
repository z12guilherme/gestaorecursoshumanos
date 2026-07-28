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

export interface EmployeeFilters {
  search?: string;
  department?: string;
  status?: string;
}

const employeeRepository = new BaseRepository<Employee>("employees");

export function useEmployees(page: number = 1, pageSize: number = 1000, filters?: EmployeeFilters) {
  const queryClient = useQueryClient();

  const searchOption = filters?.search?.trim()
    ? {
        fields: ["name", "email", "role"],
        term: filters.search.trim(),
      }
    : undefined;

  const filterOptions: Record<string, any> = {};
  if (filters?.department && filters.department !== "all") {
    filterOptions.department = filters.department;
  }
  if (filters?.status && filters.status !== "all") {
    filterOptions.status = filters.status;
  }

  const {
    data: queryData,
    isLoading: loading,
    error: queryError,
    refetch,
  } = useQuery<{ data: Employee[]; count: number | null }>({
    queryKey: ["employees", page, pageSize, filters],
    queryFn: async () => {
      const result = await employeeRepository.find({
        page,
        pageSize,
        orderBy: "name",
        filters: Object.keys(filterOptions).length > 0 ? filterOptions : undefined,
        search: searchOption,
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
      await queryClient.invalidateQueries({ queryKey: ["employee-stats"] });
    }
    return result;
  };

  const updateEmployee = async (id: string, updates: Partial<Employee>) => {
    const result = await employeeRepository.update(id, updates);
    if (!result.error) {
      await queryClient.invalidateQueries({ queryKey: ["employees"] });
      await queryClient.invalidateQueries({ queryKey: ["employee-stats"] });
    }
    return result;
  };

  const deleteEmployee = async (id: string) => {
    const result = await employeeRepository.delete(id); // Use soft delete from BaseRepository
    if (!result.error) {
      await queryClient.invalidateQueries({ queryKey: ["employees"] });
      await queryClient.invalidateQueries({ queryKey: ["employee-stats"] });
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

export function useEmployeeStats() {
  const {
    data: stats,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["employee-stats"],
    queryFn: async () => {
      if (USE_MOCK) {
        const all = mockDatabase.get("employees").filter((e: any) => !e.deleted_at);
        return {
          total: all.length,
          active: all.filter((e: any) => e.status === "active" || e.status === "Ativo").length,
          vacation: all.filter((e: any) => e.status === "vacation" || e.status === "Férias").length,
          leave: all.filter((e: any) => e.status === "leave" || e.status === "Afastado").length,
          terminated: all.filter((e: any) => e.status === "terminated" || e.status === "Desligado")
            .length,
        };
      }

      const { data, error } = await supabase
        .from("employees")
        .select("status")
        .is("deleted_at", null);
      if (error) throw error;
      const list = data || [];
      return {
        total: list.length,
        active: list.filter((e: any) => e.status === "active" || e.status === "Ativo").length,
        vacation: list.filter((e: any) => e.status === "vacation" || e.status === "Férias").length,
        leave: list.filter((e: any) => e.status === "leave" || e.status === "Afastado").length,
        terminated: list.filter((e: any) => e.status === "terminated" || e.status === "Desligado")
          .length,
      };
    },
  });

  return {
    stats: stats || { total: 0, active: 0, vacation: 0, leave: 0, terminated: 0 },
    loading: isLoading,
    refetch,
  };
}
