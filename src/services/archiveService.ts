import { supabase } from '../lib/supabase';
import { subMonths, format } from 'date-fns';

export const archiveService = {
    /**
     * Conta quantos registros existem na tabela que são mais antigos que os meses especificados.
     */
    async getColdDataCount(table: string, monthsOld: number = 6): Promise<number> {
        const cutoffDate = subMonths(new Date(), monthsOld).toISOString();

        const { count, error } = await supabase
            .from(table)
            .select('*', { count: 'exact', head: true })
            .lt('created_at', cutoffDate);

        if (error) throw new Error(`Erro ao contar dados frios em ${table}: ${error.message}`);
        return count || 0;
    },

    /**
     * Busca os registros antigos, os exclui do banco e retorna os dados para exportação.
     */
    async archiveAndDeleteColdData(table: string, monthsOld: number = 6): Promise<any[]> {
        const cutoffDate = subMonths(new Date(), monthsOld).toISOString();

        // 1. Busca os registros para manter o backup
        const { data: recordsToArchive, error: fetchError } = await supabase
            .from(table)
            .select('*')
            .lt('created_at', cutoffDate);

        if (fetchError) throw new Error(`Erro ao buscar registros para backup: ${fetchError.message}`);

        if (!recordsToArchive || recordsToArchive.length === 0) {
            return [];
        }

        // 2. Exclui os registros permanentemente do banco
        const { error: deleteError } = await supabase
            .from(table)
            .delete()
            .lt('created_at', cutoffDate);

        if (deleteError) throw new Error(`Erro ao excluir registros antigos: ${deleteError.message}`);

        return recordsToArchive;
    },

    /**
     * Gera um arquivo CSV com os dados e aciona o download automático.
     */
    downloadAsCSV(data: any[], filenamePrefix: string) {
        if (!data || data.length === 0) return;

        const headers = Object.keys(data[0]).join(',');

        const rows = data.map(row =>
            Object.values(row).map(val => {
                // Formata objetos JSON (comuns em logs de auditoria) para string
                const valStr = typeof val === 'object' && val !== null ? JSON.stringify(val) : String(val ?? '');
                // Escapa aspas duplas para não quebrar a estrutura do CSV
                return `"${valStr.replace(/"/g, '""')}"`;
            }).join(',')
        );

        const csvContent = [headers, ...rows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `${filenamePrefix}_${format(new Date(), 'yyyy-MM-dd')}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};