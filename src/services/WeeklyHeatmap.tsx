import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { timeEntryService, TimeEntry } from '@/services/timeEntryService';

interface WeeklyHeatmapProps {
    entries: TimeEntry[];
    days: Date[]; // Array de datas que formam as colunas (ex: últimos 5 dias)
}

export function WeeklyHeatmap({ entries, days }: WeeklyHeatmapProps) {

    const gridData = useMemo(() => {
        // 1. Agrupa os registros por funcionário e depois por dia
        const byEmployee = entries.reduce((acc, entry) => {
            const empId = entry.employee_id;
            if (!empId) return acc;
            if (!acc[empId]) {
                acc[empId] = {
                    name: entry.employees?.name || 'Desconhecido',
                    entriesByDay: {} as Record<string, TimeEntry[]>
                };
            }

            const dateStr = new Date(entry.timestamp).toISOString().split('T')[0];
            if (!acc[empId].entriesByDay[dateStr]) {
                acc[empId].entriesByDay[dateStr] = [];
            }
            acc[empId].entriesByDay[dateStr].push(entry);

            return acc;
        }, {} as Record<string, { name: string; entriesByDay: Record<string, TimeEntry[]> }>);

        // 2. Monta a estrutura de linhas e colunas para a tabela
        return Object.values(byEmployee).map(emp => {
            const row = days.map(date => {
                const dateStr = date.toISOString().split('T')[0];
                const dayEntries = emp.entriesByDay[dateStr] || [];
                const hoursStr = timeEntryService.calculateDailyHours(dayEntries);
                const anomalies = timeEntryService.findAnomalies(dayEntries);

                let status: 'ok' | 'warning' | 'error' | 'empty' = 'ok';
                if (dayEntries.length === 0) status = 'empty';
                else if (anomalies.length > 0) status = 'error';
                else if (hoursStr === '-') status = 'error'; // Bateu ponto, mas não fechou o par
                else status = 'ok';

                return { date: dateStr, hours: hoursStr, status };
            });

            return { name: emp.name, row };
        });
    }, [entries, days]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ok': return 'bg-green-500/20 text-green-700 dark:text-green-400';
            case 'warning': return 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400';
            case 'error': return 'bg-red-500/20 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800';
            default: return 'bg-muted/30 text-muted-foreground';
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Grade Semanal (Horas Trabalhadas)</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                        <tr>
                            <th className="px-4 py-3 font-medium rounded-tl-md">Colaborador</th>
                            {days.map(d => (
                                <th key={d.toISOString()} className="px-4 py-3 font-medium text-center">
                                    {d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' })}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {gridData.map((emp, i) => (
                            <tr key={i} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                                <td className="px-4 py-3 font-medium whitespace-nowrap">{emp.name}</td>
                                {emp.row.map((cell, j) => (
                                    <td key={j} className="px-4 py-2 text-center">
                                        <div className={`px-2 py-1 rounded text-xs font-medium inline-block min-w-[60px] ${getStatusColor(cell.status)}`}>
                                            {cell.hours !== '-' ? cell.hours : '--'}
                                        </div>
                                    </td>
                                ))}
                            </tr>
                        ))}
                        {gridData.length === 0 && (
                            <tr>
                                <td colSpan={days.length + 1} className="px-4 py-8 text-center text-muted-foreground">
                                    Nenhum registro encontrado para o período selecionado.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </CardContent>
        </Card>
    );
}