import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bot, Send, Sparkles, Users, TrendingUp, FileText, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const suggestedQuestions = [
  { icon: Users, text: 'Quais colaboradores têm risco de turnover?' },
  { icon: TrendingUp, text: 'Quem está apto para promoção?' },
  { icon: FileText, text: 'Gere um relatório de desempenho do time de TI' },
  { icon: Lightbulb, text: 'Sugira melhorias para o clima organizacional' },
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
    
    if (lowerQuestion.includes('turnover') || lowerQuestion.includes('risco')) {
      return `Baseado na análise dos dados de RH, identifiquei 3 colaboradores com potencial risco de turnover:

1. **Pedro Costa** (Designer) - Sem aumento há 18 meses, baixo engajamento nas últimas avaliações
2. **Roberto Ferreira** (Gerente de Projetos) - Afastado por motivos pessoais, histórico de insatisfação
3. **Juliana Lima** (Estagiária) - Contrato próximo do vencimento, sem perspectiva de efetivação

**Recomendações:**
- Agendar reunião 1:1 com Pedro para entender expectativas
- Acompanhar retorno de Roberto com suporte adequado
- Avaliar possibilidade de efetivação de Juliana`;
    }
    
    if (lowerQuestion.includes('promoção') || lowerQuestion.includes('apto')) {
      return `Analisando as avaliações de desempenho e tempo de casa, os seguintes colaboradores estão aptos para promoção:

1. **Carlos Santos** (Dev Senior) - Score 4.5/5, 3 anos de casa, liderança natural
2. **Maria Oliveira** (Analista Financeiro) - Score 4.2/5, 4 anos de casa, metas superadas

**Próximos passos sugeridos:**
- Avaliar budget para promoções
- Preparar PDI para próximo cargo
- Comunicar gestores diretos`;
    }
    
    if (lowerQuestion.includes('relatório') || lowerQuestion.includes('desempenho')) {
      return `Aqui está um resumo do desempenho do time de Tecnologia:

**Métricas Gerais:**
- Total de colaboradores: 45
- Média de avaliação: 4.1/5
- Metas atingidas: 82%
- Turnover: 3.2%

**Destaques positivos:**
- Entregas dentro do prazo aumentaram 15%
- Satisfação interna: 87%

**Pontos de atenção:**
- 3 posições abertas sem preenchimento há 60+ dias
- Banco de horas acumulado alto em 5 colaboradores

Posso gerar um relatório PDF detalhado se necessário.`;
    }
    
    return `Entendi sua pergunta sobre "${question}". Para fornecer uma análise completa, preciso acessar os dados do sistema. 

Algumas informações que posso ajudar:
- Análise de turnover e retenção
- Identificação de talentos para promoção
- Relatórios de desempenho
- Sugestões de desenvolvimento
- Análise de clima organizacional

Por favor, seja mais específico sobre o que gostaria de saber.`;
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
