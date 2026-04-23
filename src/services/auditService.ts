import { supabase } from "@/lib/supabase";

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
    const dateLimit = new Date();
    dateLimit.setDate(dateLimit.getDate() - daysRetained);

    const { error } = await supabase
      .from("audit_logs")
      .delete()
      .lt("changed_at", dateLimit.toISOString());

    if (error) throw error;
  },

  async deleteLogsBeforeDate(date: string) {
    const { error } = await supabase
      .from("audit_logs")
      .delete()
      .lte("changed_at", `${date}T23:59:59.999Z`);

    if (error) throw error;
  }
};