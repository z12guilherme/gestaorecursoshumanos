import { supabase } from "@/lib/supabase";
import { mockDatabase, USE_MOCK } from "@/lib/mockDatabase";

export interface AuditLog {
  id: string;
  table_name: string;
  record_id: string;
  action: "INSERT" | "UPDATE" | "DELETE";
  old_data: any;
  new_data: any;
  changed_by: string;
  changed_at: string;
}

export interface AuditLogStats {
  inserts: number;
  updates: number;
  deletes: number;
  total: number;
}

export interface AuditLogFilters {
  page?: number;
  pageSize?: number;
  startDate?: string;
  endDate?: string;
  action?: string;
  tableName?: string;
}

export const auditService = {
  /**
   * Busca os logs de auditoria com paginação e filtros.
   *
   * @param page       Página atual (1-indexada). Default: 1
   * @param pageSize   Registros por página. Default: 50
   * @param startDate  Filtro de data início (YYYY-MM-DD)
   * @param endDate    Filtro de data fim (YYYY-MM-DD)
   * @param action     Filtro por tipo de ação (INSERT | UPDATE | DELETE)
   * @param tableName  Filtro por nome da tabela
   */
  async getLogs(
    page: number = 1,
    pageSize: number = 50,
    startDate?: string,
    endDate?: string,
    action?: string,
    tableName?: string
  ) {
    // 🔀 Desvio Offline (Mock)
    if (USE_MOCK) {
      let data = mockDatabase.get("audit_logs") as AuditLog[];
      if (startDate) data = data.filter((l) => l.changed_at >= `${startDate}T00:00:00.000Z`);
      if (endDate) data = data.filter((l) => l.changed_at <= `${endDate}T23:59:59.999Z`);
      if (action) data = data.filter((l) => l.action === action);
      if (tableName) data = data.filter((l) => l.table_name === tableName);
      data.sort((a, b) => new Date(b.changed_at).getTime() - new Date(a.changed_at).getTime());
      const count = data.length;
      const from = (page - 1) * pageSize;
      return { data: data.slice(from, from + pageSize), count };
    }

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from("audit_logs")
      .select("*", { count: "exact" })
      .order("changed_at", { ascending: false })
      .range(from, to);

    if (startDate) {
      query = query.gte("changed_at", `${startDate}T00:00:00.000Z`);
    }
    if (endDate) {
      query = query.lte("changed_at", `${endDate}T23:59:59.999Z`);
    }
    if (action) {
      query = query.eq("action", action);
    }
    if (tableName) {
      query = query.eq("table_name", tableName);
    }

    const { data, error, count } = await query;

    if (error) throw error;
    return {
      data: data as AuditLog[],
      count: count || 0,
    };
  },

  async getLogStats(startDate?: string, endDate?: string): Promise<AuditLogStats> {
    // 🔀 Desvio Offline (Mock)
    if (USE_MOCK) {
      let data = mockDatabase.get("audit_logs") as AuditLog[];
      if (startDate) data = data.filter((l) => l.changed_at >= `${startDate}T00:00:00.000Z`);
      if (endDate) data = data.filter((l) => l.changed_at <= `${endDate}T23:59:59.999Z`);
      const inserts = data.filter((l) => l.action === "INSERT").length;
      const updates = data.filter((l) => l.action === "UPDATE").length;
      const deletes = data.filter((l) => l.action === "DELETE").length;
      return { inserts, updates, deletes, total: data.length };
    }

    let query = supabase.from("audit_logs").select("action", { count: "exact" });
    if (startDate) query = query.gte("changed_at", `${startDate}T00:00:00.000Z`);
    if (endDate) query = query.lte("changed_at", `${endDate}T23:59:59.999Z`);

    const { data, error } = await query;
    if (error) throw error;

    const all = (data || []) as { action: string }[];
    return {
      inserts: all.filter((l) => l.action === "INSERT").length,
      updates: all.filter((l) => l.action === "UPDATE").length,
      deletes: all.filter((l) => l.action === "DELETE").length,
      total: all.length,
    };
  },

  async getDistinctTables(): Promise<string[]> {
    if (USE_MOCK) {
      const data = mockDatabase.get("audit_logs") as AuditLog[];
      return [...new Set(data.map((l) => l.table_name))].sort();
    }

    const { data, error } = await supabase
      .from("audit_logs")
      .select("table_name")
      .order("table_name");

    if (error) throw error;
    return [...new Set((data || []).map((r: any) => r.table_name as string))];
  },

  async deleteOldLogs(daysRetained: number = 15) {
    if (USE_MOCK) {
      mockDatabase.set("audit_logs", []);
      return;
    }

    const dateLimit = new Date();
    dateLimit.setDate(dateLimit.getDate() - daysRetained);

    const { error } = await supabase
      .from("audit_logs")
      .delete()
      .lt("changed_at", dateLimit.toISOString());

    if (error) throw error;
  },

  async deleteLogsBeforeDate(date: string) {
    if (USE_MOCK) {
      const data = (mockDatabase.get("audit_logs") as AuditLog[]).filter(
        (l) => l.changed_at > `${date}T23:59:59.999Z`
      );
      mockDatabase.set("audit_logs", data);
      return;
    }

    const { error } = await supabase
      .from("audit_logs")
      .delete()
      .lte("changed_at", `${date}T23:59:59.999Z`);

    if (error) throw error;
  },
};
