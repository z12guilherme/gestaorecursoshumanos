import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { mockDatabase, USE_MOCK } from "@/lib/mockDatabase";

export type NotificationType =
  | "time_off"
  | "new_employee"
  | "new_candidate"
  | "birthday"
  | "performance";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  timestamp: string; // ISO string
  read: boolean;
  link?: string;
}

function formatRelativeTime(isoString: string): string {
  const now = new Date();
  const date = new Date(isoString);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Agora mesmo";
  if (diffMins < 60) return `Há ${diffMins} min`;
  if (diffHours < 24) return `Há ${diffHours} hora${diffHours > 1 ? "s" : ""}`;
  if (diffDays === 1) return "Ontem";
  if (diffDays < 7) return `Há ${diffDays} dias`;
  return date.toLocaleDateString("pt-BR");
}

async function fetchAllData() {
  if (USE_MOCK) {
    const employees = mockDatabase.get("employees") || [];
    const timeOff = mockDatabase.get("time_off") || [];
    const candidates = mockDatabase.get("candidates") || [];
    const performanceReviews = mockDatabase.get("performance_reviews") || [];
    return { employees, timeOff, candidates, performanceReviews };
  }

  const [empRes, timeOffRes, candRes, perfRes] = await Promise.all([
    supabase
      .from("employees")
      .select("id, name, created_at, birth_date, department")
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("time_off_requests")
      .select(
        "id, employee_id, type, start_date, status, created_at, employees:employees!employee_id(name)"
      )
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("candidates")
      .select("id, name, position, applied_at, status")
      .order("applied_at", { ascending: false })
      .limit(20),
    supabase
      .from("performance_reviews")
      .select("id, employee_id, overall_score, created_at, employees:employees!employee_id(name)")
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  return {
    employees: empRes.data || [],
    timeOff: timeOffRes.data || [],
    candidates: candRes.data || [],
    performanceReviews: perfRes.data || [],
  };
}

export function useNotifications() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["notifications-data"],
    queryFn: fetchAllData,
    refetchInterval: 5 * 60 * 1000, // revalida a cada 5 minutos
    staleTime: 2 * 60 * 1000,
  });

  const notifications: AppNotification[] = useMemo(() => {
    if (!data) return [];

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const result: AppNotification[] = [];

    // 1. Solicitações de férias/ausência pendentes
    const timeOffItems = data.timeOff || [];
    timeOffItems.forEach((req: any) => {
      const employeeName =
        req.employees?.name || req.employee?.name || req.employee_name || "Colaborador";
      const typeLabel =
        req.type === "vacation" || req.type === "Férias"
          ? "férias"
          : req.type?.toLowerCase() || "ausência";
      result.push({
        id: `time_off_${req.id}`,
        type: "time_off",
        title: "Solicitação pendente de aprovação",
        description: `${employeeName} solicitou ${typeLabel} aguardando aprovação.`,
        timestamp: req.created_at,
        read: false,
        link: "/time-off",
      });
    });

    // 2. Novos colaboradores (últimos 7 dias)
    const employees = data.employees || [];
    employees
      .filter((e: any) => {
        const created = new Date(e.created_at || e.admission_date);
        return created >= sevenDaysAgo;
      })
      .slice(0, 5)
      .forEach((emp: any) => {
        result.push({
          id: `new_emp_${emp.id}`,
          type: "new_employee",
          title: "Novo colaborador cadastrado",
          description: `${emp.name} foi adicionado ao sistema${emp.department ? ` no departamento de ${emp.department}` : ""}.`,
          timestamp: emp.created_at || emp.admission_date,
          read: false,
          link: "/employees",
        });
      });

    // 3. Novos candidatos (últimos 7 dias)
    const candidates = data.candidates || [];
    candidates
      .filter((c: any) => {
        const applied = new Date(c.applied_at || c.appliedAt);
        return applied >= sevenDaysAgo;
      })
      .slice(0, 5)
      .forEach((cand: any) => {
        result.push({
          id: `candidate_${cand.id}`,
          type: "new_candidate",
          title: "Novo candidato inscrito",
          description: `${cand.name} se candidatou para ${cand.position || "uma vaga"}.`,
          timestamp: cand.applied_at || cand.appliedAt,
          read: false,
          link: "/recruitment",
        });
      });

    // 4. Avaliações de desempenho recentes (últimos 7 dias)
    const reviews = data.performanceReviews || [];
    reviews
      .filter((r: any) => {
        const created = new Date(r.created_at);
        return created >= sevenDaysAgo;
      })
      .slice(0, 3)
      .forEach((review: any) => {
        const empName =
          review.employees?.name || review.employee?.name || review.employee_name || "Colaborador";
        const score = review.overall_score;
        result.push({
          id: `review_${review.id}`,
          type: "performance",
          title: "Nova avaliação de desempenho",
          description: `${empName} recebeu nota ${score?.toFixed(1) ?? "–"} na avaliação de desempenho.`,
          timestamp: review.created_at,
          read: false,
          link: "/performance",
        });
      });

    // 5. Aniversários de hoje
    const todayMonth = now.getMonth() + 1;
    const todayDay = now.getDate();
    employees
      .filter((e: any) => {
        if (!e.birth_date) return false;
        const bDate = new Date(e.birth_date);
        return bDate.getMonth() + 1 === todayMonth && bDate.getDate() === todayDay;
      })
      .forEach((emp: any) => {
        result.push({
          id: `birthday_${emp.id}`,
          type: "birthday",
          title: "🎂 Aniversário hoje!",
          description: `${emp.name} está fazendo aniversário hoje. Envie suas felicitações!`,
          timestamp: now.toISOString(),
          read: false,
          link: "/employees",
        });
      });

    // Ordena por mais recente primeiro
    result.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return result;
  }, [data]);

  return {
    notifications,
    unreadCount: notifications.filter((n) => !n.read).length,
    isLoading,
    refetch,
    formatRelativeTime,
  };
}
