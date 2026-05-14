import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { MonitorSmartphone, LogOut, Laptop, Smartphone, Globe } from 'lucide-react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Session {
    session_id: string;
    created_at: string;
    last_sign_in_at: string;
    ip_address: string;
    user_agent: string;
}

function getDeviceInfo(ua: string) {
    if (!ua) return { name: "Dispositivo Desconhecido", Icon: Globe };

    let browser = "Navegador Desconhecido";
    if (ua.includes("Edg/")) browser = "Edge";
    else if (ua.includes("Chrome/")) browser = "Chrome";
    else if (ua.includes("Firefox/")) browser = "Firefox";
    else if (ua.includes("Safari/") && !ua.includes("Chrome")) browser = "Safari";

    let os = "Sistema Desconhecido";
    let Icon = Globe;
    if (ua.includes("Windows")) { os = "Windows"; Icon = Laptop; }
    else if (ua.includes("Macintosh") || ua.includes("Mac OS")) { os = "macOS"; Icon = Laptop; }
    else if (ua.includes("Linux")) { os = "Linux"; Icon = Laptop; }
    else if (ua.includes("Android")) { os = "Android"; Icon = Smartphone; }
    else if (ua.includes("iPhone") || ua.includes("iPad")) { os = "iOS"; Icon = Smartphone; }

    return { name: `${os} • ${browser}`, Icon };
}

export function ActiveSessionsManager() {
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [sessions, setSessions] = useState<Session[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        fetchSessions();
    }, []);

    const fetchSessions = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase.rpc('get_my_active_sessions');
            if (!error && data) {
                setSessions(data);
            }
        } catch (error) {
            console.error("Erro ao buscar sessões ativas:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignOutOthers = async () => {
        setIsLoggingOut(true);
        try {
            const { error } = await supabase.auth.signOut({ scope: 'others' });

            if (error) throw error;

            toast({
                title: "Sessões remotas encerradas",
                description: "Todos os outros dispositivos e navegadores foram desconectados com sucesso.",
            });

            fetchSessions(); // Recarrega a lista para sumir com as antigas
        } catch (error: any) {
            toast({
                title: "Erro ao gerenciar sessões",
                description: error.message || "Não foi possível desconectar os outros dispositivos.",
                variant: "destructive",
            });
        } finally {
            setIsLoggingOut(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <MonitorSmartphone className="h-5 w-5" />
                    Gerenciamento de Sessões
                </CardTitle>
                <CardDescription>
                    Encerre imediatamente o acesso à sua conta em outros computadores ou celulares.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4 mb-6">
                    <h3 className="text-sm font-medium text-slate-800 dark:text-slate-200">Dispositivos conectados recentemente</h3>

                    {isLoading ? (
                        <p className="text-sm text-muted-foreground animate-pulse">Carregando dispositivos...</p>
                    ) : sessions.length > 0 ? (
                        <div className="space-y-3">
                            {sessions.map((session, index) => {
                                const { name, Icon } = getDeviceInfo(session.user_agent);
                                const isCurrentSession = index === 0; // O primeiro costuma ser o mais recente (atual)

                                return (
                                    <div key={session.session_id} className={`flex items-center justify-between p-3 rounded-lg border ${isCurrentSession ? 'bg-primary/5 border-primary/20' : 'bg-secondary/20'}`}>
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-background rounded-md border shadow-sm">
                                                <Icon className="h-5 w-5 text-slate-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium flex items-center gap-2">
                                                    {name}
                                                    {isCurrentSession && <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full font-semibold">Atual</span>}
                                                </p>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                                                    <span>{session.ip_address}</span>
                                                    <span>•</span>
                                                    <span>{format(new Date(session.last_sign_in_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">Nenhuma sessão extra encontrada ou recurso não configurado no banco.</p>
                    )}
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between p-4 border rounded-lg bg-muted/50">
                    <div className="text-left mb-4 sm:mb-0">
                        <p className="font-medium text-sm">Encerrar acesso remoto</p>
                        <p className="text-sm text-muted-foreground mt-1">
                            Esqueceu sua conta logada em outro lugar? Encerre todas as outras sessões.
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        className="w-full sm:w-auto text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                        onClick={handleSignOutOthers}
                        disabled={isLoggingOut || sessions.length <= 1}
                    >
                        <LogOut className="mr-2 h-4 w-4" />
                        {isLoggingOut ? 'Desconectando...' : 'Desconectar outros'}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}