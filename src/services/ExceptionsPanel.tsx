import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Exception {
    employeeId: string;
    name: string;
    department: string;
    issue: string;
    date: string;
}

export function ExceptionsPanel({ anomalies }: { anomalies: Exception[] }) {
    if (!anomalies || anomalies.length === 0) return null;

    return (
        <Card className="border-destructive/50 bg-destructive/5">
            <CardHeader className="pb-2">
                <CardTitle className="text-destructive flex items-center gap-2 text-lg">
                    <AlertTriangle className="h-5 w-5" />
                    Atenção: Exceções e Divergências ({anomalies.length})
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {anomalies.map((anomaly, idx) => (
                        <div key={`${anomaly.employeeId}-${idx}`} className="bg-background p-3 rounded-md border shadow-sm flex flex-col gap-1">
                            <span className="font-semibold text-sm">{anomaly.name}</span>
                            <span className="text-xs text-muted-foreground">{anomaly.department} - {anomaly.date}</span>
                            <span className="text-xs font-medium text-destructive mt-1">{anomaly.issue}</span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}