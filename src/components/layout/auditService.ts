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
  async getLogs() {
    const { data, error } = await supabase
      .from("audit_logs")
      .select("*")
      .order("changed_at", { ascending: false });

    if (error) throw error;
    return data as AuditLog[];
  },
};