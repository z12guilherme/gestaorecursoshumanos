import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { timeEntryService, TimeEntry } from '@/services/timeEntryService';

interface LiveStatusBoardProps {
    entries: TimeEntry[]; // O ideal é passar apenas os registros de HOJE para este componente
}

export function LiveStatusBoard({ entries }: LiveStatusBoardProps) {
    const statusGroups = useMemo(() => {
        // Agrupa as entradas por funcionário
        const byEmployee = entries.reduce((acc, entry) => {
            if (!entry.employee_id) return acc;
            if (!acc[entry.employee_id]) {
                acc[entry.employee_id] = {
                    name: entry.employees?.name || 'Desconhecido',
                    department: entry.employees?.department || '-',
                    entries: []
                };
            }
            acc[entry.employee_id].entries.push(entry);
            return acc;
        }, {} as Record<string, { name: string; department: string; entries: TimeEntry[] }>);

        const groups = {
            working: [] as { name: string; department: string }[],
            lunch: [] as { name: string; department: string }[],
            finished: [] as { name: string; department: string }[]
        };

        // Classifica cada funcionário com base no último status calculado pelo service
        Object.values(byEmployee).forEach(emp => {
            const status = timeEntryService.getLastStatus(emp.entries);
            if (status !== 'not_started' && groups[status]) {
                groups[status].push({ name: emp.name, department: emp.department });
            }
        });

        return groups;
    }, [entries]);

    const columns = [
        { title: '🟢 Trabalhando', key: 'working' as const, bg: 'bg-green-100 dark:bg-green-900/20' },
        { title: '🟠 Em Almoço', key: 'lunch' as const, bg: 'bg-orange-100 dark:bg-orange-900/20' },
        { title: '⚪ Encerrado', key: 'finished' as const, bg: 'bg-slate-100 dark:bg-slate-800/50' },
    ];

    return (
        <div className="grid gap-4 md:grid-cols-3">
            {columns.map(col => (
                <Card key={col.key} className={`${col.bg} border-0 shadow-sm`}>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-semibold">{col.title} ({statusGroups[col.key].length})</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-2">
                        {statusGroups[col.key].map((emp, idx) => (
                            <div key={idx} className="bg-background/80 p-2 rounded text-sm shadow-sm flex flex-col">
                                <span className="font-medium">{emp.name}</span>
                                <span className="text-xs text-muted-foreground">{emp.department}</span>
                            </div>
                        ))}
                        {statusGroups[col.key].length === 0 && (
                            <span className="text-xs text-muted-foreground italic">Nenhum colaborador</span>
                        )}
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}