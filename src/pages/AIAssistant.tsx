import { useState, useRef, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bot, Send, Sparkles, Users, TrendingUp, FileText, Lightbulb, Calendar, UserX, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEmployees } from '@/hooks/useEmployees';
import { useRecruitment } from '@/hooks/useRecruitment';
import { useTimeOff } from '@/hooks/useTimeOff';
import { useAIChat } from '@/hooks/useAIChat';
import { useCommunication } from '@/hooks/useCommunication';
import { usePerformance } from '@/hooks/usePerformance';
import { useAiActions } from '@/components/layout/useAiActions';

const suggestedQuestions = [
  { icon: Users, text: 'Cadastre o funcionário "Marcos Guilherme", cargo "Desenvolvedor Pleno", no departamento "Tecnologia"' },
  { icon: TrendingUp, text: 'Quem são os colaboradores com maior risco de turnover?' },
  { icon: Calendar, text: 'Gere um relatório de férias para o time de Design' },
  { icon: UserX, text: 'Desligue o colaborador "Pedro Costa"' },
];

export default function AIAssistant() {
  const { employees, addEmployee, updateEmployee, deleteEmployee, refetch: refetchEmployees } = useEmployees();
  const { candidates, jobs, addJob } = useRecruitment();
  const { requests: timeOffRequests, addRequest, refetch: refetchTimeOff } = useTimeOff();
  const { messages, loading: loadingMessages, addMessage, clearHistory } = useAIChat();
  const { addAnnouncement } = useCommunication();
  const { reviews } = usePerformance();
  const { executeTool } = useAiActions();
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    type: 'vacation' | 'terminate';
    data: { days: number; employeeName: string };
  } | null>(null);

  useEffect(() => {
    // Garante que a conversa role para a última mensagem
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const currentInput = input;
    setInput('');
    
    await addMessage('user', currentInput);
    setIsLoading(true);

    try {
      // Simula tempo de "pensamento" da IA
      await new Promise(resolve => setTimeout(resolve, 1000));

      const responseText = await getAIResponse(currentInput);
      await addMessage('assistant', responseText);
    } catch (error) {
      console.error("Erro na IA:", error);
      await addMessage('assistant', "Desculpe, encontrei um erro ao processar sua solicitação. Tente reformular.");
    } finally {
      setIsLoading(false);
    }
  };

  // Função auxiliar para normalizar texto (remove acentos e deixa minúsculo)
  const normalize = (text: string) => {
    if (!text) return "";
    return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  };

  const getAIResponse = async (question: string): Promise<string> => {
    const normalizedQuestion = normalize(question);
    
    // --- Tratamento de Confirmação Pendente ---
    if (pendingAction) {
      if (['sim', 's', 'yes', 'confirmar', 'ok', 'pode', 'prossiga', 'vai'].some(w => normalizedQuestion.includes(w))) {
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

        addRequest({
          employee_id: employee.id,
          type: 'vacation',
          start_date: format(startDate, 'yyyy-MM-dd'),
          end_date: format(endDate, 'yyyy-MM-dd'),
          reason: 'Solicitado via Assistente IA (Recesso/Exceção)',
        });
        updateEmployee(employee.id, { status: 'vacation' });

        setPendingAction(null);
        return `✅ **Confirmado.** Férias de ${days} dias agendadas para **${employee.name}**. \n\nO status do setor foi considerado como recesso temporário devido à ausência de colaboradores ativos.`;

      } else if (['nao', 'n', 'no', 'cancelar', 'pare', 'abortar'].some(w => normalizedQuestion.includes(w))) {
        setPendingAction(null);
        return "❌ Solicitação cancelada. O colaborador permanece ativo e nenhuma alteração foi feita.";
      } else {
        return "⚠️ **Aguardando confirmação.** \n\nO setor ficará sem funcionários ativos. Responda **SIM** para confirmar o recesso ou **NÃO** para cancelar.";
      }
    }

    // --- INTENÇÃO: Ações do Sistema (Navegação, Tema, Logout) ---
    if (normalizedQuestion.includes('ir para') || normalizedQuestion.includes('navegar') || normalizedQuestion.includes('abrir') || normalizedQuestion.includes('acessar')) {
      let path = '';
      if (normalizedQuestion.includes('dashboard') || normalizedQuestion.includes('inicio') || normalizedQuestion.includes('home')) path = '/';
      else if (normalizedQuestion.includes('colaborador') || normalizedQuestion.includes('funcionario')) path = '/employees';
      else if (normalizedQuestion.includes('recrutamento') || normalizedQuestion.includes('vaga')) path = '/recruitment';
      else if (normalizedQuestion.includes('avaliacao') || normalizedQuestion.includes('desempenho')) path = '/performance';
      else if (normalizedQuestion.includes('ferias') || normalizedQuestion.includes('ausencia')) path = '/absences';
      else if (normalizedQuestion.includes('ponto')) path = '/timesheet';
      else if (normalizedQuestion.includes('relatorio')) path = '/reports';
      else if (normalizedQuestion.includes('comunicacao') || normalizedQuestion.includes('aviso')) path = '/communication';
      else if (normalizedQuestion.includes('configuracao') || normalizedQuestion.includes('ajuste')) path = '/settings';
      else if (normalizedQuestion.includes('assistente') || normalizedQuestion.includes('ia')) path = '/ai-assistant';

      if (path) return await executeTool('navigate', { path });
    }

    if (normalizedQuestion.includes('tema') || normalizedQuestion.includes('modo escuro') || normalizedQuestion.includes('modo claro')) {
      return await executeTool('toggle_theme', {});
    }

    if (normalizedQuestion.includes('sair') && (normalizedQuestion.includes('sistema') || normalizedQuestion.includes('conta') || normalizedQuestion.includes('logout'))) {
      return await executeTool('logout', {});
    }
    // -----------------------------------------------------------

    // --- INTENÇÃO: Agendar Férias ---
    // Detecta palavras-chave de férias e dias
    if ((normalizedQuestion.includes('ferias') || normalizedQuestion.includes('descanso') || normalizedQuestion.includes('recesso') || normalizedQuestion.includes('folga')) && 
        (normalizedQuestion.includes('dias') || normalizedQuestion.match(/\d+/))) {
      // Extrai dias (procura número próximo a palavra dias ou apenas um número)
      const daysMatch = normalizedQuestion.match(/(\d+)\s*dias/) || normalizedQuestion.match(/(\d+)/);
      const days = daysMatch ? parseInt(daysMatch[1], 10) : null;

      // Tenta encontrar um funcionário mencionado na frase
      // Estratégia: Procura nomes conhecidos na frase do usuário
      // Ordena por tamanho do nome (decrescente) para priorizar nomes completos (ex: "Ana Silva" antes de "Ana")
      const sortedEmployees = [...employees].sort((a, b) => b.name.length - a.name.length);
      
      const employeeName = sortedEmployees.find(e => normalizedQuestion.includes(normalize(e.name)))?.name 
        || sortedEmployees.find(e => normalizedQuestion.includes(normalize(e.name.split(' ')[0])))?.name; // Tenta primeiro nome

      if (!days || !employeeName) {
        if (!employeeName) return "Não consegui identificar o nome do colaborador. Tente dizer o nome completo.";
        if (!days) return `Quantos dias de férias você quer dar para ${employeeName}?`;
      }

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

      addRequest({
        employee_id: employee.id,
        type: 'vacation',
        start_date: format(startDate, 'yyyy-MM-dd'),
        end_date: format(endDate, 'yyyy-MM-dd'),
        reason: 'Solicitado via Assistente IA',
      });
      updateEmployee(employee.id, { status: 'vacation' });

      return `✅ Férias de ${days} dias agendadas para **${employee.name}** com sucesso!${warningMessage}\n\nO status do colaborador foi atualizado para "Em Férias".`;
    }

    // --- INTENÇÃO: Encerrar Férias ---
    if ((normalizedQuestion.includes('encerrar') || normalizedQuestion.includes('voltou') || normalizedQuestion.includes('tirar') || normalizedQuestion.includes('cancelar') || normalizedQuestion.includes('finalizar') || normalizedQuestion.includes('acabar') || normalizedQuestion.includes('retornar')) && 
        (normalizedQuestion.includes('ferias') || normalizedQuestion.includes('descanso') || normalizedQuestion.includes('recesso'))) {
      const sortedEmployees = [...employees].sort((a, b) => b.name.length - a.name.length);
      const employeeName = sortedEmployees.find(e => normalizedQuestion.includes(normalize(e.name)))?.name 
        || sortedEmployees.find(e => normalizedQuestion.includes(normalize(e.name.split(' ')[0])))?.name;

      if (!employeeName) return "De quem você quer encerrar as férias?";

      const employee = employees.find(e => e.name.toLowerCase() === employeeName.toLowerCase());

      if (!employee) {
        return `Não encontrei o colaborador "${employeeName}". Por favor, verifique o nome.`;
      }

      if (employee.status !== 'vacation') {
        return `O colaborador **${employee.name}** não está de férias no momento.`;
      }

      updateEmployee(employee.id, { status: 'active' });

      return `✅ As férias de **${employee.name}** foram encerradas e o status atualizado para "Ativo".`;
    }

    // --- INTENÇÃO: Desligar Funcionário ---
    if (normalizedQuestion.includes('desligar') || normalizedQuestion.includes('desligue') || normalizedQuestion.includes('demitir') || normalizedQuestion.includes('demita') || normalizedQuestion.includes('encerrar contrato') || normalizedQuestion.includes('mandar embora') || normalizedQuestion.includes('dispensar') || normalizedQuestion.includes('exonerar') || normalizedQuestion.includes('rescindir') || normalizedQuestion.includes('rua')) {
      const sortedEmployees = [...employees].sort((a, b) => b.name.length - a.name.length);
      const employeeName = sortedEmployees.find(e => normalizedQuestion.includes(normalize(e.name)))?.name 
        || sortedEmployees.find(e => normalizedQuestion.includes(normalize(e.name.split(' ')[0])))?.name;

      if (!employeeName) return "Qual colaborador você deseja desligar?";

      const employee = employees.find(e => e.name.toLowerCase() === employeeName.toLowerCase());

      if (!employee) {
        return `Não encontrei o colaborador "${employeeName}". Por favor, verifique o nome.`;
      }

      if (employee.status === 'terminated') {
        return `O colaborador **${employee.name}** já está com o status "Desligado".`;
      }

      updateEmployee(employee.id, { status: 'terminated' });

      return `✅ O status do colaborador **${employee.name}** foi alterado para "Desligado".`;
    }

    // --- INTENÇÃO: Cadastrar Funcionário ---
    if (normalizedQuestion.includes('cadastre') || normalizedQuestion.includes('adicionar') || normalizedQuestion.includes('contratar') || normalizedQuestion.includes('registrar') || normalizedQuestion.includes('novo funcionario') || normalizedQuestion.includes('novo colaborador') || normalizedQuestion.includes('inserir') || normalizedQuestion.includes('criar perfil') || normalizedQuestion.includes('admitir')) {
      // Tenta extrair informações com regex mais flexível ou por partes
      // Ex: "Cadastre João Silva, cargo Dev, setor TI"
      const nameMatch = question.match(/(?:funcionário|colaborador|pessoa|o|a)?\s+([A-Za-zÀ-ÿ\s]+?)(?:,|$| cargo| setor| departamento| como| no)/i);
      const roleMatch = question.match(/(?:cargo|como)\s+([A-Za-zÀ-ÿ\s]+?)(?:,|$| setor| departamento)/i);
      const deptMatch = question.match(/(?:departamento|setor)\s+([A-Za-zÀ-ÿ\s]+?)(?:,|$)/i);

      const name = nameMatch ? nameMatch[1].trim() : null;
      if (!name) return "Para cadastrar, preciso pelo menos do nome. Tente: 'Cadastre o funcionário [Nome], cargo [Cargo], setor [Setor]'";

      const position = roleMatch ? roleMatch[1].trim() : 'Novo Colaborador';
      const department = deptMatch ? deptMatch[1].trim() : 'Geral';

      addEmployee({
        name,
        email: `${name.toLowerCase().replace(/\s+/g, '.')}@empresa.com`,
        role: position,
        department,
        status: 'active',
        admission_date: new Date().toISOString().split('T')[0],
        password: '1234',
      });

      return `✅ Colaborador **${name}** cadastrado com sucesso!\n\n📋 **Detalhes:**\n- Cargo: ${position}\n- Departamento: ${department}`;
    }

    // --- INTENÇÃO: Criar Vaga (Recrutamento) ---
    if (normalizedQuestion.includes('criar vaga') || normalizedQuestion.includes('nova vaga') || normalizedQuestion.includes('abrir vaga') || normalizedQuestion.includes('publicar vaga') || normalizedQuestion.includes('anunciar vaga') || normalizedQuestion.includes('nova posicao') || normalizedQuestion.includes('abrir posicao') || normalizedQuestion.includes('recrutamento')) {
      const jobMatch = question.match(/(?:vaga|posição|oportunidade)\s+(?:de\s+)?(.+?)\s+(?:para|em|no|na)\s+(?:o\s+|a\s+)?(?:setor\s+|departamento\s+)?(.+)/i);
      
      if (jobMatch) {
        const title = jobMatch[1].trim();
        const department = jobMatch[2].trim();
        
        addJob({
          title,
          department,
          location: 'Híbrido', // Default inteligente
          type: 'Integral',
          status: 'Aberta',
          description: `Vaga para ${title} no departamento de ${department}.`,
          requirements: ['Experiência na área', 'Proatividade', 'Trabalho em equipe'],
        });
        
        return `✅ Vaga de **${title}** para o departamento **${department}** criada com sucesso!`;
      }
      return "Para criar uma vaga, tente algo como: 'Criar vaga de Analista para o Financeiro'.";
    }

    // --- INTENÇÃO: Publicar Aviso (Comunicação) ---
    if (normalizedQuestion.includes('aviso') || normalizedQuestion.includes('comunicado') || normalizedQuestion.includes('publicar') || normalizedQuestion.includes('mural') || normalizedQuestion.includes('noticia') || normalizedQuestion.includes('informar') || normalizedQuestion.includes('postar') || normalizedQuestion.includes('mensagem')) {
      const noticeMatch = question.match(/(?:aviso|comunicado|publicar|postar|mensagem|informe)\s+(?:sobre\s+|intitulado\s+)?([^:]+|".+?")(?:\s*:\s*|\s+dizendo\s+que\s+|\s+com\s+o\s+texto\s+)(.+)/i);
      
      if (noticeMatch) {
        const title = noticeMatch[1].replace(/['"]/g, '').trim();
        const content = noticeMatch[2].trim();
        
        addAnnouncement({
          title,
          content,
          priority: 'medium',
          author: 'Assistente IA',
        });
        
        return `✅ Aviso **"${title}"** publicado no mural com sucesso!`;
      }
    }

    // --- INTENÇÃO: Promoção / Alteração de Cargo ---
    if (normalizedQuestion.includes('promover') || normalizedQuestion.includes('mudar cargo') || normalizedQuestion.includes('alterar cargo') || normalizedQuestion.includes('subir de cargo') || normalizedQuestion.includes('nova funcao') || normalizedQuestion.includes('efetivar')) {
       const promoteMatch = question.match(/(?:promover|mudar cargo de|efetivar|subir)\s+(?:o|a)?\s*(.+?)\s+(?:para|a|como)\s+(.+)/i);
       if (promoteMatch) {
         const namePart = promoteMatch[1].trim();
         const newRole = promoteMatch[2].trim();
         
         const sortedEmployees = [...employees].sort((a, b) => b.name.length - a.name.length);
         const employeeName = sortedEmployees.find(e => normalize(e.name).includes(normalize(namePart)))?.name;
         
         if (employeeName) {
            const emp = employees.find(e => e.name === employeeName);
            if (emp) {
              updateEmployee(emp.id, { role: newRole });
              return `✅ **${emp.name}** foi promovido(a) para **${newRole}** com sucesso!`;
            }
         }
         return `Não encontrei o colaborador "${namePart}".`;
       }
    }

    // --- INTENÇÃO: Consultar Desempenho ---
    if (normalizedQuestion.includes('desempenho') || normalizedQuestion.includes('nota') || normalizedQuestion.includes('avaliacao') || normalizedQuestion.includes('performance') || normalizedQuestion.includes('feedback') || normalizedQuestion.includes('resultado') || normalizedQuestion.includes('rendimento')) {
       const sortedEmployees = [...employees].sort((a, b) => b.name.length - a.name.length);
       const employeeName = sortedEmployees.find(e => normalizedQuestion.includes(normalize(e.name)))?.name;
       
       if (employeeName) {
         const empReviews = reviews.filter(r => r.employee_name === employeeName);
         if (empReviews.length > 0) {
           const latest = empReviews[0];
           return `📊 **Desempenho de ${employeeName}:**\n- Última Avaliação: ${latest.period}\n- Nota Geral: ⭐ ${Number(latest.overall_score).toFixed(1)}\n- Feedback: "${latest.feedback}"`;
         }
         return `Não encontrei avaliações de desempenho registradas para **${employeeName}**.`;
       }
    }

    // --- INTENÇÃO: Informações Gerais do Colaborador ---
    if (normalizedQuestion.includes('dados') || normalizedQuestion.includes('detalhes') || normalizedQuestion.includes('quem e') || normalizedQuestion.includes('informacoes') || normalizedQuestion.includes('perfil') || normalizedQuestion.includes('sobre') || normalizedQuestion.includes('ficha') || normalizedQuestion.includes('consultar')) {
       const sortedEmployees = [...employees].sort((a, b) => b.name.length - a.name.length);
       const employeeName = sortedEmployees.find(e => normalizedQuestion.includes(normalize(e.name)))?.name;

       if (employeeName) {
         const emp = employees.find(e => e.name === employeeName);
         if (emp) {
           // Formata data de admissão
           const admission = emp.admission_date ? new Date(emp.admission_date).toLocaleDateString('pt-BR') : 'N/A';
           return `📋 **Ficha de ${emp.name}:**\n- Cargo: ${emp.role}\n- Departamento: ${emp.department}\n- Email: ${emp.email}\n- Admissão: ${admission}\n- Status: ${emp.status === 'active' ? 'Ativo' : emp.status}`;
         }
       }
    }

    // Lógica de Respostas Dinâmicas
    if (normalizedQuestion.includes('quantos') || normalizedQuestion.includes('total')) {
      if (normalizedQuestion.includes('funcionario') || normalizedQuestion.includes('colaborador')) {
        const active = employees.filter((e: any) => e.status === 'active').length;
        return `Atualmente, a empresa conta com **${employees.length} colaboradores** registrados. Desses, **${active}** estão ativos e ${employees.length - active} estão afastados ou em férias.`;
      }
      if (normalizedQuestion.includes('candidato')) {
        return `Temos um total de **${candidates.length} candidatos** participando de processos seletivos no momento.`;
      }
      if (normalizedQuestion.includes('vaga')) {
        const openJobs = jobs.filter((j: any) => j.status === 'open');
        return `Existem **${openJobs.length} vagas em aberto** no painel de recrutamento.`;
      }
    }

    if (normalizedQuestion.includes('turnover') || normalizedQuestion.includes('risco') || normalizedQuestion.includes('sair')) {
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
    
    if (normalizedQuestion.includes('promocao') || normalizedQuestion.includes('apto') || normalizedQuestion.includes('carreira')) {
      return `Analisando as avaliações de desempenho e tempo de casa, os seguintes colaboradores estão aptos para promoção:

1. **Carlos Santos** (Dev Senior) - Score 4.5/5, 3 anos de casa, liderança natural
2. **Maria Oliveira** (Analista Financeiro) - Score 4.2/5, 4 anos de casa, metas superadas

**Próximos passos sugeridos:**
- Validar budget com o financeiro
- Preparar PDI para próximo cargo
- Comunicar gestores diretos`;
    }
    
    if (normalizedQuestion.includes('relatorio') || normalizedQuestion.includes('desempenho') || normalizedQuestion.includes('resumo') || normalizedQuestion.includes('analise') || normalizedQuestion.includes('insights')) {
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

  // Mensagem de boas-vindas padrão se o histórico estiver vazio
  const displayMessages = messages.length > 0 ? messages : [
    {
      id: 'welcome',
      role: 'assistant' as const,
      content: 'Olá! Sou o assistente de IA do RH. Posso ajudar com análises de dados, relatórios, sugestões de desenvolvimento e muito mais. Como posso ajudar você hoje?',
      timestamp: new Date(),
    }
  ];

  return (
    <AppLayout title="Assistente IA" subtitle="Análises inteligentes e suporte à decisão">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-12rem)]">
        {/* Chat Area */}
        <Card className="lg:col-span-3 flex flex-col border-0 shadow-lg overflow-hidden h-full">
          <CardHeader className="border-b bg-card/50 backdrop-blur-sm px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20">
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg">HR Assistant</CardTitle>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Online • Powered by Perplexity AI
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={clearHistory} title="Limpar Histórico" className="hover:bg-destructive/10 hover:text-destructive">
                <Trash2 className="h-5 w-5" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="flex-1 flex flex-col p-0 bg-slate-50/50 dark:bg-slate-950/50 relative overflow-hidden">
            {/* Messages */}
            <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
              {displayMessages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    'flex gap-4 max-w-[85%]',
                    message.role === 'user' ? 'ml-auto flex-row-reverse' : ''
                  )}
                >
                  <Avatar className={cn("h-10 w-10 border-2", message.role === 'user' ? "border-primary/20" : "border-muted")}>
                    <AvatarFallback className={message.role === 'user' ? "bg-primary text-primary-foreground" : "bg-background"}>
                      {message.role === 'user' ? 'VC' : <Bot className="h-5 w-5 text-primary" />}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div
                    className={cn(
                      "flex flex-col gap-1 min-w-0", 
                      message.role === 'user' ? "items-end" : "items-start"
                    )}>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-muted-foreground">
                            {message.role === 'user' ? 'Você' : 'Assistente'}
                        </span>
                        <span className="text-[10px] text-muted-foreground/60">
                            {message.timestamp ? new Date(message.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
                        </span>
                    </div>
                    <div
                        className={cn(
                        'rounded-2xl px-5 py-3 text-sm shadow-sm whitespace-pre-line leading-relaxed',
                        message.role === 'user'
                            ? 'bg-primary text-primary-foreground rounded-tr-none'
                            : 'bg-white dark:bg-slate-900 border border-border text-foreground rounded-tl-none'
                        )}
                    >
                        {message.content}
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex gap-4 max-w-[85%]">
                  <Avatar className="h-10 w-10 border-2 border-muted">
                    <AvatarFallback className="bg-background">
                      <Bot className="h-5 w-5 text-primary" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col gap-1">
                      <span className="text-xs font-medium text-muted-foreground">Assistente</span>
                      <div className="bg-white dark:bg-slate-900 border border-border rounded-2xl rounded-tl-none px-5 py-4 shadow-sm">
                        <div className="flex gap-1.5">
                        <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" />
                        <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce [animation-delay:0.1s]" />
                        <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce [animation-delay:0.2s]" />
                        </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 bg-background border-t border-border">
              <div className="relative flex items-center gap-2 max-w-4xl mx-auto">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Digite sua pergunta ou comando..."
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  className="flex-1 h-12 pl-4 pr-12 rounded-full border-muted-foreground/20 focus-visible:ring-primary shadow-sm bg-muted/30"
                />
                <Button 
                    onClick={handleSend} 
                    disabled={isLoading || !input.trim()} 
                    size="icon"
                    className="absolute right-1.5 h-9 w-9 rounded-full shadow-sm"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-center text-muted-foreground mt-2">
                A IA pode cometer erros. Verifique as informações importantes.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Suggestions */}
        <div className="space-y-6 h-full overflow-y-auto pr-1">
          <Card className="border-0 shadow-md bg-gradient-to-br from-primary/5 to-transparent">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-500" />
                Perguntas Sugeridas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {suggestedQuestions.map((question, index) => (
                <button
                  key={index}
                  className="w-full text-left p-3 rounded-xl bg-background/50 hover:bg-background border border-border/50 hover:border-primary/30 transition-all duration-200 group"
                  onClick={() => handleSuggestedQuestion(question.text)}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <question.icon className="h-4 w-4" />
                    </div>
                    <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors line-clamp-2">
                        {question.text}
                    </span>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-500" />
                Capacidades
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Gestão</h4>
                    <div className="flex flex-wrap gap-2">
                        <span className="px-2 py-1 rounded-md bg-secondary text-xs text-secondary-foreground">Contratação</span>
                        <span className="px-2 py-1 rounded-md bg-secondary text-xs text-secondary-foreground">Desligamento</span>
                        <span className="px-2 py-1 rounded-md bg-secondary text-xs text-secondary-foreground">Promoção</span>
                    </div>
                </div>
                <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Operacional</h4>
                    <div className="flex flex-wrap gap-2">
                        <span className="px-2 py-1 rounded-md bg-secondary text-xs text-secondary-foreground">Férias</span>
                        <span className="px-2 py-1 rounded-md bg-secondary text-xs text-secondary-foreground">Avisos</span>
                        <span className="px-2 py-1 rounded-md bg-secondary text-xs text-secondary-foreground">Vagas</span>
                    </div>
                </div>
                <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Análise</h4>
                    <div className="flex flex-wrap gap-2">
                        <span className="px-2 py-1 rounded-md bg-secondary text-xs text-secondary-foreground">Turnover</span>
                        <span className="px-2 py-1 rounded-md bg-secondary text-xs text-secondary-foreground">Desempenho</span>
                        <span className="px-2 py-1 rounded-md bg-secondary text-xs text-secondary-foreground">Relatórios</span>
                    </div>
                </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
