import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Calendar, Check, X, Clock, Plus, Palmtree, Thermometer, User } from 'lucide-react';
import { timeOffRequests as initialRequests } from '@/data/mockData';
import { TimeOffRequest } from '@/types/hr';
import { format, parseISO, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

const typeConfig = {
  vacation: { label: 'Férias', icon: Palmtree, color: 'text-blue-600', bgColor: 'bg-blue-100 dark:bg-blue-900/30' },
  sick: { label: 'Atestado', icon: Thermometer, color: 'text-red-600', bgColor: 'bg-red-100 dark:bg-red-900/30' },
  personal: { label: 'Pessoal', icon: User, color: 'text-purple-600', bgColor: 'bg-purple-100 dark:bg-purple-900/30' },
  maternity: { label: 'Licença Maternidade', icon: User, color: 'text-pink-600', bgColor: 'bg-pink-100 dark:bg-pink-900/30' },
  paternity: { label: 'Licença Paternidade', icon: User, color: 'text-cyan-600', bgColor: 'bg-cyan-100 dark:bg-cyan-900/30' },
};

const statusConfig = {
  pending: { label: 'Pendente', className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  approved: { label: 'Aprovado', className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  rejected: { label: 'Rejeitado', className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
};

export default function TimeOff() {
  const [requests, setRequests] = useState<TimeOffRequest[]>(initialRequests);
  const { toast } = useToast();

  const handleApprove = (id: string) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'approved' } : r));
    toast({
      title: 'Solicitação aprovada',
      description: 'A solicitação foi aprovada com sucesso.',
    });
  };

  const handleReject = (id: string) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'rejected' } : r));
    toast({
      title: 'Solicitação rejeitada',
      description: 'A solicitação foi rejeitada.',
      variant: 'destructive',
    });
  };

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const processedRequests = requests.filter(r => r.status !== 'pending');

  return (
    <AppLayout title="Férias & Ponto" subtitle="Gerencie solicitações e controle de ponto">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-600">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{pendingRequests.length}</p>
                <p className="text-xs text-muted-foreground">Pendentes</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600">
                <Palmtree className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">8</p>
                <p className="text-xs text-muted-foreground">Em férias</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600">
                <Thermometer className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">3</p>
                <p className="text-xs text-muted-foreground">Atestados hoje</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">12</p>
                <p className="text-xs text-muted-foreground">Férias vencendo</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Requests */}
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Solicitações Pendentes</CardTitle>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nova Solicitação
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingRequests.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhuma solicitação pendente
              </p>
            ) : (
              pendingRequests.map((request) => {
                const type = typeConfig[request.type];
                const days = differenceInDays(parseISO(request.endDate), parseISO(request.startDate)) + 1;
                
                return (
                  <div key={request.id} className="flex items-center justify-between p-4 rounded-lg border border-border">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {request.employeeName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-foreground">{request.employeeName}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className={`flex items-center gap-1 ${type.color}`}>
                            <type.icon className="h-4 w-4" />
                            <span className="text-sm">{type.label}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">•</span>
                          <span className="text-sm text-muted-foreground">{days} dia(s)</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {format(parseISO(request.startDate), "dd 'de' MMM", { locale: ptBR })} - {format(parseISO(request.endDate), "dd 'de' MMM", { locale: ptBR })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                        onClick={() => handleReject(request.id)}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Rejeitar
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => handleApprove(request.id)}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Aprovar
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Processed Requests */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Histórico de Solicitações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {processedRequests.map((request) => {
              const type = typeConfig[request.type];
              const status = statusConfig[request.status];
              
              return (
                <div key={request.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary text-sm">
                        {request.employeeName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium text-foreground">{request.employeeName}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{type.label}</span>
                        <span>•</span>
                        <span>
                          {format(parseISO(request.startDate), "dd/MM", { locale: ptBR })} - {format(parseISO(request.endDate), "dd/MM", { locale: ptBR })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Badge className={status.className}>{status.label}</Badge>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
