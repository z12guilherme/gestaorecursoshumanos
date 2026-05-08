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

export const auditService = {
  async getLogs(page: number = 1, pageSize: number = 50, startDate?: string, endDate?: string) {
    // 🔀 Desvio Offline (Mock)
    if (USE_MOCK) {
      let data = mockDatabase.get('audit_logs');
      if (startDate) data = data.filter((l: any) => l.changed_at >= `${startDate}T00:00:00.000Z`);
      if (endDate) data = data.filter((l: any) => l.changed_at <= `${endDate}T23:59:59.999Z`);
      data.sort((a: any, b: any) => new Date(b.changed_at).getTime() - new Date(a.changed_at).getTime());
      const from = (page - 1) * pageSize;
      return { data: data.slice(from, from + pageSize), count: data.length };
    }

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from("audit_logs")
      .select("*", { count: 'exact' })
      .order("changed_at", { ascending: false })
      .range(from, to);

    if (startDate) {
      query = query.gte("changed_at", `${startDate}T00:00:00.000Z`);
    }
    if (endDate) {
      query = query.lte("changed_at", `${endDate}T23:59:59.999Z`);
    }

    const { data, error, count } = await query;

    if (error) throw error;
    return {
      data: data as AuditLog[],
      count: count || 0,
    };
  },

  async deleteOldLogs(daysRetained: number = 15) {
    if (USE_MOCK) { mockDatabase.set('audit_logs', []); return; }

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
      const data = mockDatabase.get('audit_logs').filter((l: any) => l.changed_at > `${date}T23:59:59.999Z`);
      mockDatabase.set('audit_logs', data);
      return;
    }

    const { error } = await supabase
      .from("audit_logs")
      .delete()
      .lte("changed_at", `${date}T23:59:59.999Z`);

    if (error) throw error;
  }
};