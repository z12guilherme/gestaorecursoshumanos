import { useState, useRef, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bot, Send, Sparkles, Users, TrendingUp, FileText, Lightbulb, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAIChat } from '@/hooks/useAIChat';

const suggestedQuestions = [
  { icon: Users, text: 'Cadastre o funcionário "Marcos Guilherme", cargo "Desenvolvedor Pleno", no departamento "Tecnologia"' },
  { icon: TrendingUp, text: 'Quem são os colaboradores com maior risco de turnover?' },
  { icon: FileText, text: 'Gere um resumo do desempenho geral da equipe' },
  { icon: Lightbulb, text: 'Quais as vagas abertas no momento?' },
];

export default function AIAssistant() {
  const { messages, sending, sendMessage, clearHistory } = useAIChat();
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const [input, setInput] = useState('');

  useEffect(() => {
    // Garante que a conversa role para a última mensagem
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages, sending]);

  const handleSend = async () => {
    if (!input.trim()) return;
    sendMessage(input);
    setInput('');
  };

  const handleSuggestedQuestion = (question: string) => {
    setInput(question);
  };

  // Mensagem de boas-vindas padrão se o histórico estiver vazio
  const displayMessages = messages.length > 0 ? messages.filter(m => m.id !== 'initial-menu') : [
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
              
              {sending && (
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
                    disabled={sending || !input.trim()} 
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
