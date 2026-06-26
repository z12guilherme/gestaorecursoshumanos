import { supabase } from "@/lib/supabase";
import { USE_MOCK, mockDatabase } from "@/lib/mockDatabase";

export class BaseRepository<T extends { id: string }> {
  protected tableName: string;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  async find(options?: {
    page?: number;
    pageSize?: number;
    orderBy?: string;
    ascending?: boolean;
    includeDeleted?: boolean;
  }): Promise<{ data: T[]; error: any; count: number | null }> {
    try {
      if (USE_MOCK) {
        let data = mockDatabase.get(this.tableName) as T[];

        // Simular ordenação
        if (options?.orderBy) {
          data.sort((a: any, b: any) => {
            const valA = a[options.orderBy!];
            const valB = b[options.orderBy!];
            if (valA < valB) return options.ascending !== false ? -1 : 1;
            if (valA > valB) return options.ascending !== false ? 1 : -1;
            return 0;
          });
        }

        // Simular paginação
        const count = data.length;
        if (options?.page !== undefined && options?.pageSize !== undefined) {
          const from = (options.page - 1) * options.pageSize;
          const to = from + options.pageSize;
          data = data.slice(from, to);
        }

        return { data, error: null, count };
      }

      let query = supabase.from(this.tableName).select("*", { count: "exact" });

      // Opcional: Soft Delete logic (se a tabela tiver deleted_at)
      if (!options?.includeDeleted) {
        // Comentado para não quebrar tabelas que ainda não têm deleted_at no DB real
        // query = query.is('deleted_at', null);
      }

      if (options?.orderBy) {
        query = query.order(options.orderBy, { ascending: options.ascending !== false });
      }

      if (options?.page !== undefined && options?.pageSize !== undefined) {
        const from = (options.page - 1) * options.pageSize;
        const to = from + options.pageSize - 1;
        query = query.range(from, to);
      }

      const { data, error, count } = await query;

      if (error) throw error;
      return { data: data as T[], error: null, count };
    } catch (err: any) {
      console.error(`Erro ao buscar dados na tabela ${this.tableName}:`, err);
      return { data: [], error: err, count: 0 };
    }
  }

  async findById(id: string): Promise<{ data: T | null; error: any }> {
    try {
      if (USE_MOCK) {
        const data = mockDatabase.get(this.tableName).find((item: any) => item.id === id);
        return { data: data || null, error: null };
      }

      const { data, error } = await supabase.from(this.tableName).select("*").eq("id", id).single();

      if (error) throw error;
      return { data: data as T, error: null };
    } catch (err: any) {
      console.error(`Erro ao buscar item (ID: ${id}) na tabela ${this.tableName}:`, err);
      return { data: null, error: err };
    }
  }

  async create(item: Omit<T, "id">): Promise<{ data: T | null; error: any }> {
    try {
      if (USE_MOCK) {
        const newItem = {
          ...item,
          id: Date.now().toString(),
          created_at: new Date().toISOString(),
        };
        mockDatabase.add(this.tableName, newItem);
        return { data: newItem as unknown as T, error: null };
      }

      const { data, error } = await supabase.from(this.tableName).insert([item]).select().single();

      if (error) throw error;
      return { data: data as T, error: null };
    } catch (err: any) {
      console.error(`Erro ao criar item na tabela ${this.tableName}:`, err);
      return { data: null, error: err };
    }
  }

  async update(id: string, updates: Partial<T>): Promise<{ data: T | null; error: any }> {
    try {
      if (USE_MOCK) {
        const updated = mockDatabase.update(this.tableName, id, updates);
        return { data: updated as T, error: null };
      }

      const { data, error } = await supabase
        .from(this.tableName)
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return { data: data as T, error: null };
    } catch (err: any) {
      console.error(`Erro ao atualizar item (ID: ${id}) na tabela ${this.tableName}:`, err);
      return { data: null, error: err };
    }
  }

  async delete(id: string, hardDelete: boolean = false): Promise<{ error: any }> {
    try {
      if (USE_MOCK) {
        mockDatabase.remove(this.tableName, id);
        return { error: null };
      }

      if (hardDelete) {
        const { error } = await supabase.from(this.tableName).delete().eq("id", id);
        if (error) throw error;
      } else {
        // Soft Delete simulation (precisa de uma coluna deleted_at na base, usaremos apenas status por padrão para evitar erros,
        // mas pode ser modificado quando o SQL for rodado)
        // Para compatibilidade, tentamos alterar o status primeiro se não forçar hard
        const { error } = await supabase
          .from(this.tableName)
          .update({ status: "terminated" } as any) // Fallback temporário
          .eq("id", id);

        if (error) {
          // Se falhar o update de status, tenta hard delete
          await supabase.from(this.tableName).delete().eq("id", id);
        }
      }

      return { error: null };
    } catch (err: any) {
      console.error(`Erro ao deletar item (ID: ${id}) na tabela ${this.tableName}:`, err);
      return { error: err };
    }
  }
}
