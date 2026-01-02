import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bot, Send, Sparkles, Users, TrendingUp, FileText, Lightbulb, Calendar, UserX } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Employee, TimeOffRequest } from '@/types/hr';
import { employees as mockEmployees, timeOffRequests as mockRequests } from '@/data/mockData';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const suggestedQuestions = [
  { icon: Users, text: 'Quais colaboradores têm risco de turnover?' },
  { icon: TrendingUp, text: 'Quem está apto para promoção?' },
  { icon: Calendar, text: 'Agende 15 dias de férias para Carlos Santos' },
  { icon: UserX, text: 'Desligar o colaborador Pedro Costa' },
];

export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Olá! Sou o assistente de IA do RH. Posso ajudar com análises de dados, relatórios, sugestões de desenvolvimento e muito mais. Como posso ajudar você hoje?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    type: 'vacation';
    data: { days: number; employeeName: string };
  } | null>(null);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: getAIResponse(input),
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1500);
  };

  const getAIResponse = (question: string): string => {
    const lowerQuestion = question.toLowerCase();
    
    const employees: Employee[] = JSON.parse(localStorage.getItem('hr_employees') || 'null') || mockEmployees;
    const candidates = JSON.parse(localStorage.getItem('hr_candidates') || '[]');
    const jobs = JSON.parse(localStorage.getItem('hr_jobs') || '[]');
    const timeOffRequests: TimeOffRequest[] = JSON.parse(localStorage.getItem('hr_timeoff_requests') || 'null') || mockRequests;

    // --- Tratamento de Confirmação Pendente ---
    if (pendingAction) {
      if (['sim', 's', 'yes', 'confirmar', 'ok', 'pode'].some(w => lowerQuestion.includes(w))) {
        const { days, employeeName } = pendingAction.data;
        const employee = employees.find(e => e.name.toLowerCase() === employeeName.toLowerCase());

        if (!employee) {
          setPendingAction(null);
          return "Erro: Colaborador não encontrado ao tentar confirmar a ação.";
        }

        // Executa a ação confirmada
        const today = new Date();
        const startDate = new Date();
        startDate.setDate(today.getDate() + 1);
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + days);

        const newRequest: TimeOffRequest = {
          id: Date.now().toString(),
          employeeId: employee.id,
          employeeName: employee.name,
          type: 'vacation',
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          status: 'approved',
          reason: 'Solicitado via Assistente IA (Recesso/Exceção)',
        };

        const updatedRequests = [...timeOffRequests, newRequest];
        localStorage.setItem('hr_timeoff_requests', JSON.stringify(updatedRequests));

        const updatedEmployees = employees.map(e => e.id === employee.id ? { ...e, status: 'vacation' } : e);
        localStorage.setItem('hr_employees', JSON.stringify(updatedEmployees));
        window.dispatchEvent(new Event('storage'));

        setPendingAction(null);
        return `✅ **Confirmado.** Férias de ${days} dias agendadas para **${employee.name}**. \n\nO status do setor foi considerado como recesso temporário devido à ausência de colaboradores ativos.`;

      } else if (['não', 'nao', 'n', 'no', 'cancelar'].some(w => lowerQuestion.includes(w))) {
        setPendingAction(null);
        return "❌ Solicitação cancelada. O colaborador permanece ativo e nenhuma alteração foi feita.";
      } else {
        return "⚠️ **Aguardando confirmação.** \n\nO setor ficará sem funcionários ativos. Responda **SIM** para confirmar o recesso ou **NÃO** para cancelar.";
      }
    }

    // --- Ação: Agendar Férias ---
    const vacationRegex = /(?:dê|agende|conceda)\s+(\d+)\s+dias\s+de\s+férias\s+(?:para|a|ao)\s+(.+)/i;
    const vacationMatch = question.match(vacationRegex);

    if (vacationMatch) {
      const days = parseInt(vacationMatch[1], 10);
      const employeeName = vacationMatch[2].trim();

      const employee = employees.find(e => e.name.toLowerCase() === employeeName.toLowerCase());

      if (!employee) {
        const employeeNames = employees.map(e => e.name).slice(0, 3).join(', ');
        return `Não encontrei o colaborador "${employeeName}". Por favor, verifique o nome.\n\nColaboradores disponíveis: ${employeeNames}...`;
      }

      if (employee.status !== 'active') {
        return `O colaborador **${employee.name}** não está ativo no momento (Status atual: ${employee.status}).`;
      }

      // Verificação de Restrições do Departamento
      const deptEmployees = employees.filter(e => e.department === employee.department);
      const activeDeptEmployees = deptEmployees.filter(e => e.status === 'active');
      const remainingActive = activeDeptEmployees.length - 1;

      // Restrição 1: Setor vazio (Recesso)
      if (remainingActive <= 0) {
        setPendingAction({ type: 'vacation', data: { days, employeeName } });
        return `⚠️ **Alerta Crítico de Capacidade**
        
O departamento **${employee.department}** possui ${deptEmployees.length} colaboradores. Ao conceder férias para **${employee.name}**, o setor ficará **sem funcionários ativos**.

Isso implica que o setor entrará em recesso?

Responda **SIM** para confirmar ou **NÃO** para cancelar.`;
      }

      // Restrição 2: Alerta de equipe mínima (mas permite execução)
      let warningMessage = "";
      if (remainingActive < 2) {
        warningMessage = `\n\n⚠️ **Nota de Atenção:** O departamento **${employee.department}** operará com equipe reduzida (${remainingActive} funcionário(s)).`;
      }

      const today = new Date();
      const startDate = new Date();
      startDate.setDate(today.getDate() + 1); // Começa amanhã
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + days);

      const newRequest: TimeOffRequest = {
        id: Date.now().toString(),
        employeeId: employee.id,
        employeeName: employee.name,
        type: 'vacation',
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        status: 'approved',
        reason: 'Solicitado via Assistente IA',
      };

      const updatedRequests = [...timeOffRequests, newRequest];
      localStorage.setItem('hr_timeoff_requests', JSON.stringify(updatedRequests));

      const updatedEmployees = employees.map(e => e.id === employee.id ? { ...e, status: 'vacation' } : e);
      localStorage.setItem('hr_employees', JSON.stringify(updatedEmployees));
      window.dispatchEvent(new Event('storage'));

      return `✅ Férias de ${days} dias agendadas para **${employee.name}** com sucesso!${warningMessage}\n\nO status do colaborador foi atualizado para "Em Férias".`;
    }

    // --- Ação: Encerrar Férias ---
    const endVacationRegex = /(?:(?:tire|remova|encerre)\s+(?:as\s+)?férias\s+de\s+(.+))|(?:(.+?)\s+(?:já\s+)?voltou\s+de\s+férias)/i;
    const endVacationMatch = question.match(endVacationRegex);

    if (endVacationMatch) {
      const employeeName = (endVacationMatch[1] || endVacationMatch[2] || '').trim().replace(/[.,!?]$/, '');

      const employee = employees.find(e => e.name.toLowerCase() === employeeName.toLowerCase());

      if (!employee) {
        return `Não encontrei o colaborador "${employeeName}". Por favor, verifique o nome.`;
      }

      if (employee.status !== 'vacation') {
        return `O colaborador **${employee.name}** não está de férias no momento.`;
      }

      const updatedEmployees = employees.map(e => e.id === employee.id ? { ...e, status: 'active' } : e);
      localStorage.setItem('hr_employees', JSON.stringify(updatedEmployees));
      window.dispatchEvent(new Event('storage'));

      return `✅ As férias de **${employee.name}** foram encerradas e o status atualizado para "Ativo".`;
    }

    // --- Ação: Desligar Funcionário ---
    // Ex: "Desligar o funcionário Pedro Costa"
    const terminateEmployeeRegex = /(?:desligar|demita|encerrar o contrato d(?:o|a))\s+(?:o\s+)?(?:funcionário|colaborador|colaboradora)\s+(.+)/i;
    const terminateEmployeeMatch = question.match(terminateEmployeeRegex);

    if (terminateEmployeeMatch) {
      const employeeName = terminateEmployeeMatch[1].trim().replace(/[.,!?]$/, '');
      const employee = employees.find(e => e.name.toLowerCase() === employeeName.toLowerCase());

      if (!employee) {
        return `Não encontrei o colaborador "${employeeName}". Por favor, verifique o nome.`;
      }

      if (employee.status === 'terminated') {
        return `O colaborador **${employee.name}** já está com o status "Desligado".`;
      }

      const updatedEmployees = employees.map(e => e.id === employee.id ? { ...e, status: 'terminated' } : e);
      localStorage.setItem('hr_employees', JSON.stringify(updatedEmployees));
      window.dispatchEvent(new Event('storage'));

      return `✅ O status do colaborador **${employee.name}** foi alterado para "Desligado".`;
    }

    // --- Ação: Cadastrar Funcionário ---
    // Ex: "Cadastre o funcionário João Silva, cargo Desenvolvedor, departamento TI"
    const addEmployeeRegex = /(?:adicione|cadastre|registre|contrate)\s+(?:o\s+)?(?:funcionário|colaborador)\s+([^,]+)(?:,\s*(?:cargo\s*)?([^,]+))?(?:,\s*(?:departamento\s*|setor\s*)?([^,]+))?/i;
    const addEmployeeMatch = question.match(addEmployeeRegex);

    if (addEmployeeMatch) {
      const name = addEmployeeMatch[1].trim();
      const position = addEmployeeMatch[2]?.trim() || 'Não informado';
      const department = addEmployeeMatch[3]?.trim() || 'Geral';

      const newEmployee: Employee = {
        id: Date.now().toString(),
        name,
        email: `${name.toLowerCase().replace(/\s+/g, '.')}@empresa.com`,
        position,
        department,
        status: 'active',
        contractType: 'CLT',
        hireDate: new Date().toISOString().split('T')[0],
      } as Employee;

      const updatedEmployees = [...employees, newEmployee];
      localStorage.setItem('hr_employees', JSON.stringify(updatedEmployees));
      window.dispatchEvent(new Event('storage'));

      return `✅ Colaborador **${name}** cadastrado com sucesso!\n\n📋 **Detalhes:**\n- Cargo: ${position}\n- Departamento: ${department}\n- Email: ${newEmployee.email}`;
    }

    // Lógica de Respostas Dinâmicas
    if (lowerQuestion.includes('quantos') || lowerQuestion.includes('total')) {
      if (lowerQuestion.includes('funcionário') || lowerQuestion.includes('colaborador')) {
        const active = employees.filter((e: any) => e.status === 'active').length;
        return `Atualmente, a empresa conta com **${employees.length} colaboradores** registrados. Desses, **${active}** estão ativos e ${employees.length - active} estão afastados ou em férias.`;
      }
      if (lowerQuestion.includes('candidato')) {
        return `Temos um total de **${candidates.length} candidatos** participando de processos seletivos no momento.`;
      }
      if (lowerQuestion.includes('vaga')) {
        const openJobs = jobs.filter((j: any) => j.status === 'open');
        return `Existem **${openJobs.length} vagas em aberto** no painel de recrutamento.`;
      }
    }

    if (lowerQuestion.includes('turnover') || lowerQuestion.includes('risco') || lowerQuestion.includes('sair')) {
      // Simula uma análise pegando alguns funcionários aleatórios como exemplo
      const riskyEmployees = employees.slice(0, 2).map((e: any) => e.name);
      
      return `Baseado na análise preditiva de engajamento e tempo sem férias, identifiquei riscos potenciais:

${riskyEmployees.map((name: string) => `• **${name}** - Baixo engajamento recente`).join('\n')}
• **Juliana Lima** (Estagiária) - Contrato próximo do vencimento

**Recomendações:**
- Agendar reuniões 1:1 para entender expectativas
- Revisar pacote de benefícios
- Avaliar possibilidade de efetivação`;
    }
    
    if (lowerQuestion.includes('promoção') || lowerQuestion.includes('apto') || lowerQuestion.includes('carreira')) {
      return `Analisando as avaliações de desempenho e tempo de casa, os seguintes colaboradores estão aptos para promoção:

1. **Carlos Santos** (Dev Senior) - Score 4.5/5, 3 anos de casa, liderança natural
2. **Maria Oliveira** (Analista Financeiro) - Score 4.2/5, 4 anos de casa, metas superadas

**Próximos passos sugeridos:**
- Validar budget com o financeiro
- Preparar PDI para próximo cargo
- Comunicar gestores diretos`;
    }
    
    if (lowerQuestion.includes('relatório') || lowerQuestion.includes('desempenho') || lowerQuestion.includes('resumo')) {
      return `### Resumo Executivo de RH

**Métricas Gerais:**
- **Colaboradores:** ${employees.length} (Ativos: ${employees.filter((e: any) => e.status === 'active').length})
- **Recrutamento:** ${jobs.filter((j: any) => j.status === 'open').length} vagas abertas com ${candidates.length} candidatos.
- **Turnover:** 3.2% (Abaixo da média do mercado)

**Destaques positivos:**
- Entregas dentro do prazo aumentaram 15%
- Satisfação interna: 87%

**Pontos de atenção:**
- 3 posições abertas sem preenchimento há 60+ dias
- Banco de horas acumulado alto em 5 colaboradores

Posso gerar um relatório PDF detalhado se necessário.`;
    }
    
    return `Entendi sua pergunta sobre "${question}". Como sou uma IA integrada ao seu sistema, tenho acesso aos dados em tempo real e posso executar ações.

Tente me perguntar coisas como:
- "Quantos funcionários temos?"
- "Tire as férias de Carlos Santos"
- "Quem tem risco de turnover?"
- "Gere um resumo geral"

Estou analisando ${employees.length} colaboradores e ${candidates.length} candidatos agora mesmo.`;
  };

  const handleSuggestedQuestion = (question: string) => {
    setInput(question);
  };

  return (
    <AppLayout title="Assistente IA" subtitle="Análises inteligentes e suporte à decisão">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-12rem)]">
        {/* Chat Area */}
        <Card className="lg:col-span-3 flex flex-col">
          <CardHeader className="border-b border-border">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base">HR Assistant</CardTitle>
                <p className="text-sm text-muted-foreground">Powered by Perplexity AI</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col p-0">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    'flex gap-3',
                    message.role === 'user' && 'justify-end'
                  )}
                >
                  {message.role === 'assistant' && (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={cn(
                      'rounded-lg px-4 py-3 max-w-[80%]',
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-foreground'
                    )}
                  >
                    <p className="text-sm whitespace-pre-line">{message.content}</p>
                  </div>
                  {message.role === 'user' && (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-secondary text-foreground text-xs">
                        AS
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-secondary rounded-lg px-4 py-3">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                      <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.1s]" />
                      <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.2s]" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-border">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Digite sua pergunta..."
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  className="flex-1"
                />
                <Button onClick={handleSend} disabled={isLoading}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Suggestions */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-500" />
                Perguntas Sugeridas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {suggestedQuestions.map((question, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="w-full justify-start h-auto py-3 px-3 text-left"
                  onClick={() => handleSuggestedQuestion(question.text)}
                >
                  <question.icon className="h-4 w-4 mr-2 shrink-0 text-primary" />
                  <span className="text-sm">{question.text}</span>
                </Button>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Capacidades</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>• Análise preditiva de turnover</p>
              <p>• Identificação de talentos</p>
              <p>• Geração de relatórios</p>
              <p>• Sugestões de PDI</p>
              <p>• Análise de clima</p>
              <p>• Textos de vagas</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
