import { supabase } from "@/lib/supabase";

export const JOB_STATUS_OPEN = "Aberta";

export interface JobPosting {
    id: string;
    title: string;
    department: string | null;
    location: string | null;
    description: string | null;
    requirements: string[] | null;
    status: string;
    created_at: string;
}

export type JobPostingSummary = Omit<JobPosting, "description" | "requirements">;

export const publicJobService = {
    /**
     * Busca todas as vagas que estão com status 'Aberta'.
     * Ideal para ser consumido pela página pública de carreiras.
     */
    async getOpenJobs(): Promise<JobPostingSummary[]> {
        const { data, error } = await supabase
            .from("jobs")
            .select("id, title, department, location, status, created_at")
            .eq("status", JOB_STATUS_OPEN)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Erro ao buscar vagas abertas:", error);
            throw error;
        }

        return (data || []) as JobPostingSummary[];
    },

    /**
     * Busca os detalhes completos de uma vaga específica pelo seu ID.
     * @param jobId O ID da vaga.
     */
    async getJobById(jobId: string): Promise<JobPosting | null> {
        const { data, error } = await supabase.from("jobs").select("*").eq("id", jobId).single();

        if (error) {
            // O Supabase lança PGRST116 quando o .single() não encontra resultados na tabela
            if (error.code === "PGRST116") {
                return null;
            }
            console.error(`Erro ao buscar detalhes da vaga ${jobId}:`, error);
            throw error;
        }

        return data as JobPosting;
    },
};