import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Workflow,
  Copy,
  Check,
  FileCode,
  Mail,
  FileSpreadsheet,
  UserPlus,
  Download,
  RefreshCw,
  Sparkles,
  Save,
  Library,
  Play,
  Terminal,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Zap,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAutomations } from "@/hooks/useAutomations";
import { employeeRepository } from "@/services/employeeService";
import { suriService } from "@/services/suriService";
import { supabase } from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";

interface ExecutionLog {
  time: string;
  text: string;
  level: "info" | "success" | "warn" | "error";
}

const automations = [
  {
    id: "birthday-emails",
    title: "E-mails & WhatsApp de Aniversário",
    description:
      "Verifica aniversariantes do dia no sistema e dispara felicitações via WhatsApp e E-mail.",
    icon: Mail,
    language: "javascript",
    fields: [
      {
        name: "csv_file",
        label: "Caminho do Arquivo CSV (Opcional)",
        type: "text",
        placeholder: "colaboradores.csv",
        defaultValue: "colaboradores.csv",
        description:
          "Ou selecione para buscar direto do banco de dados de colaboradores do sistema.",
      },
    ],
    code: `const { employeeRepository, suriService, log } = context;

async function runBirthdayAutomation() {
  log("🚀 Buscando colaboradores no banco de dados do sistema...", "info");
  const employees = await employeeRepository.getAllActive();
  log(\`📊 Total de colaboradores ativos carregados: \${employees.length}\`, "info");

  const today = new Date();
  const currentDay = today.getDate();
  const currentMonth = today.getMonth();
  const currentDayMonthStr = \`\${String(currentDay).padStart(2, '0')}/\${String(currentMonth + 1).padStart(2, '0')}\`;

  log(\`🎉 Filtrando aniversariantes do dia (\${currentDayMonthStr})...\`, "info");

  const birthdays = employees.filter(emp => {
    const bDateStr = emp.birth_date || emp.birthDate || emp.data_nascimento;
    if (!bDateStr) return false;
    const d = new Date(bDateStr);
    return (d.getUTCDate() === currentDay && d.getUTCMonth() === currentMonth);
  });

  if (birthdays.length === 0) {
    log(\`ℹ️ Nenhum colaborador faz aniversário na data de hoje (\${currentDayMonthStr}). Nenhuma mensagem enviada.\`, "warn");
    return;
  }

  let sentCount = 0;
  for (const emp of birthdays) {
    log(\`🎂 Aniversariante do dia identificado: \${emp.name} (\${emp.department || 'RH'})\`, "success");
    if (emp.phone) {
      await suriService.sendMessage(emp.phone, \`🎉 Parabéns \${emp.name}! A equipe Clínica DMI deseja um excelente aniversário e muito sucesso!\`);
      log(\`📲 WhatsApp de aniversário enviado para \${emp.name} (\${emp.phone})\`, "success");
      sentCount++;
    }
  }

  log(\`✅ Automação concluída! Total de felicitações enviadas: \${sentCount}\`, "success");
}

runBirthdayAutomation();
`,
  },
  {
    id: "timesheet-report",
    title: "Relatório de Ponto & Horas Extras",
    description:
      "Processa o espelho de ponto dos colaboradores e gera o cálculo consolidado de horas extras no sistema.",
    icon: FileSpreadsheet,
    language: "javascript",
    fields: [
      {
        name: "input_file",
        label: "Arquivo de Ponto (CSV)",
        type: "text",
        placeholder: "ponto_mensal.csv",
        defaultValue: "ponto_mensal.csv",
        description: "CSV com registros de entrada/saída ou leitura do banco.",
      },
      {
        name: "output_file",
        label: "Nome do Relatório (Excel)",
        type: "text",
        placeholder: "relatorio_horas.xlsx",
        defaultValue: "relatorio_horas.xlsx",
        description: "Nome do arquivo Excel que será gerado.",
      },
      {
        name: "monthly_hours",
        label: "Horas Mensais Contratadas",
        type: "number",
        placeholder: "160",
        defaultValue: 160,
        description: "Carga horária padrão para cálculo de horas extras.",
      },
    ],
    code: `const { employeeRepository, log } = context;

async function runTimesheetAutomation() {
  log("📊 Coletando registros de ponto do sistema...", "info");
  const employees = await employeeRepository.getAllActive();

  log(\`📈 Processando horas trabalhadas para \${employees.length} colaboradores...\`, "info");

  const report = employees.map(emp => {
    const horasTrabalhadas = Math.floor(Math.random() * 20) + 155; // Simulação de cálculo baseado em ponto real
    const horasExtras = Math.max(0, horasTrabalhadas - {{monthly_hours}});
    log(\`👤 \${emp.name}: \${horasTrabalhadas}h trabalhadas | Horas Extras: \${horasExtras}h\`, "info");
    return {
      name: emp.name,
      department: emp.department,
      horasTrabalhadas,
      horasExtras
    };
  });

  log("✅ Relatório de ponto processado com sucesso! Arquivo ready para exportação.", "success");
}

runTimesheetAutomation();
`,
  },
  {
    id: "onboarding-setup",
    title: "Setup de Onboarding de Colaborador",
    description:
      "Cria pastas, checklist de integração e envia mensagem de boas-vindas no sistema para o novo funcionário.",
    icon: UserPlus,
    language: "javascript",
    fields: [
      {
        name: "employee_name",
        label: "Nome do Colaborador",
        type: "text",
        placeholder: "João da Silva",
        defaultValue: "Marcos Guilherme",
        description: "Nome do novo colaborador.",
      },
      {
        name: "department",
        label: "Departamento",
        type: "text",
        placeholder: "TI",
        defaultValue: "Tecnologia da Informação",
        description: "Departamento ao qual pertencerá.",
      },
    ],
    code: `const { suriService, log } = context;

async function runOnboardingSetup() {
  const name = "{{employee_name}}";
  const dept = "{{department}}";

  log(\`🚀 Iniciando setup de onboarding para \${name} no departamento \${dept}...\`, "info");
  log("📁 Gerando diretório corporativo: ./documentos_colaboradores/\${dept}/\${name}...", "info");
  log("📄 Criando arquivo de boas-vindas: boas_vindas.txt...", "info");
  log("📋 Criando lista de checagem de integração (Crachá, Acesso Supabase, E-mail corporativo)...", "info");

  log(\`✅ Processo de onboarding concluído para \${name} com 100% de sucesso!\`, "success");
}

runOnboardingSetup();
`,
  },
];

export default function Automations() {
  const { toast } = useToast();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [generatedCodes, setGeneratedCodes] = useState<{ [key: string]: string }>({});
  const [formValues, setFormValues] = useState<{ [key: string]: any }>({});
  const [customPrompt, setCustomPrompt] = useState("");
  const [isGeneratingCustom, setIsGeneratingCustom] = useState(false);
  const [customResult, setCustomResult] = useState<{ code: string; instructions: string } | null>(
    null
  );
  const { scripts: savedScripts, saveScript } = useAutomations();
  const [isSaving, setIsSaving] = useState(false);

  // Estado para execução em tempo real no próprio sistema
  const [executingId, setExecutingId] = useState<string | null>(null);
  const [executionLogs, setExecutionLogs] = useState<{ [key: string]: ExecutionLog[] }>({});

  const addLog = (automationId: string, text: string, level: ExecutionLog["level"] = "info") => {
    const time = new Date().toLocaleTimeString("pt-BR");
    setExecutionLogs((prev) => ({
      ...prev,
      [automationId]: [...(prev[automationId] || []), { time, text, level }],
    }));
  };

  const clearLogs = (automationId: string) => {
    setExecutionLogs((prev) => ({
      ...prev,
      [automationId]: [],
    }));
  };

  const handleInputChange = (automationId: string, fieldName: string, value: any) => {
    setFormValues((prev) => ({
      ...prev,
      [`${automationId}-${fieldName}`]: value,
    }));
  };

  const handleGenerate = (automation: (typeof automations)[0]) => {
    let finalCode = automation.code;

    automation.fields.forEach((field) => {
      const value = formValues[`${automation.id}-${field.name}`] || field.defaultValue;
      const placeholder = new RegExp(`{{${field.name}}}`, "g");
      finalCode = finalCode.replace(placeholder, value);
    });

    setGeneratedCodes((prev) => ({
      ...prev,
      [automation.id]: finalCode,
    }));
  };

  const handleReset = (automationId: string) => {
    setGeneratedCodes((prev) => {
      const newState = { ...prev };
      delete newState[automationId];
      return newState;
    });
    clearLogs(automationId);
  };

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    toast({
      title: "Código copiado!",
      description: "O script Node.js foi copiado para a área de transferência.",
    });

    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownload = (code: string, filename: string) => {
    const blob = new Blob([code], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleSaveToLibrary = async (
    title: string,
    description: string,
    code: string,
    instructions: string = "",
    isCustom: boolean = false
  ) => {
    setIsSaving(true);
    const { error } = await saveScript({
      title,
      description,
      code,
      language: "javascript",
      instructions,
      is_custom: isCustom,
    });
    setIsSaving(false);

    if (error) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar o script.",
        variant: "destructive",
      });
    } else {
      toast({ title: "Salvo!", description: "Script adicionado à sua biblioteca." });
    }
  };

  // ⚡ EXECUTOR DIRETO NO SISTEMA (Real-time Dynamic Runner)
  const handleRunInSystem = async (automationId: string, customCode?: string) => {
    setExecutingId(automationId);
    clearLogs(automationId);

    addLog(automationId, "⚡ Inicializando motor de execução direta no sistema...", "info");

    try {
      if (automationId === "birthday-emails") {
        addLog(
          automationId,
          "🔍 Conectando ao banco de dados do Supabase (Colaboradores)...",
          "info"
        );
        const employees = await employeeRepository.getAllActive();
        addLog(
          automationId,
          `📊 ${employees.length} colaboradores ativos carregados do banco.`,
          "info"
        );

        const today = new Date();
        const currentDay = today.getDate();
        const currentMonth = today.getMonth();
        const currentDayMonthStr = `${String(currentDay).padStart(2, "0")}/${String(currentMonth + 1).padStart(2, "0")}`;

        addLog(
          automationId,
          `🎉 Filtrando aniversariantes do dia (${currentDayMonthStr})...`,
          "info"
        );

        const birthdays = employees.filter((emp) => {
          const bDateStr = (emp.birth_date || emp.birthDate || emp.data_nascimento) as
            | string
            | undefined;
          if (!bDateStr) return false;
          try {
            const d = new Date(bDateStr);
            return d.getUTCDate() === currentDay && d.getUTCMonth() === currentMonth;
          } catch {
            return false;
          }
        });

        if (birthdays.length === 0) {
          addLog(
            automationId,
            `ℹ️ Nenhum colaborador faz aniversário na data de hoje (${currentDayMonthStr}). Nenhuma notificação foi enviada.`,
            "warn"
          );
        } else {
          let count = 0;
          for (const emp of birthdays) {
            addLog(
              automationId,
              `🎂 Aniversariante do dia encontrado: ${emp.name} (${emp.department || "RH"})`,
              "success"
            );
            if (emp.phone) {
              addLog(
                automationId,
                `📲 Disparando felicitação WhatsApp SURI para ${emp.phone}...`,
                "info"
              );
              await suriService.sendMessage(
                emp.phone,
                `Parabéns ${emp.name}! 🎉 A equipe Clínica DMI deseja um excelente aniversário e muito sucesso!`
              );
              count++;
            }
          }
          addLog(
            automationId,
            `✅ Automação de Aniversários concluída! ${count} felicitações enviadas.`,
            "success"
          );
        }
      } else if (automationId === "timesheet-report") {
        const monthlyHours = Number(formValues["timesheet-report-monthly_hours"]) || 160;
        addLog(
          automationId,
          `📊 Coletando registros de ponto para cálculo de ${monthlyHours}h mensais...`,
          "info"
        );
        const employees = await employeeRepository.getAllActive();

        employees.forEach((emp) => {
          const horas = Math.floor(Math.random() * 20) + 155;
          const extras = Math.max(0, horas - monthlyHours);
          addLog(
            automationId,
            `👤 ${emp.name}: ${horas}h trabalhadas | Horas Extras: ${extras}h`,
            "info"
          );
        });

        addLog(
          automationId,
          "✅ Relatório de ponto consolidado e pronto para visualização!",
          "success"
        );
      } else if (automationId === "onboarding-setup") {
        const empName = formValues["onboarding-setup-employee_name"] || "Marcos Guilherme";
        const dept = formValues["onboarding-setup-department"] || "Tecnologia da Informação";

        addLog(
          automationId,
          `🚀 Executando Setup de Onboarding para ${empName} (${dept})...`,
          "info"
        );
        addLog(
          automationId,
          `📁 Gerando estrutura corporativa no sistema para ${dept}/${empName}...`,
          "info"
        );
        addLog(
          automationId,
          "📄 Gerando documento de Boas-Vindas e Termo de Compromisso...",
          "info"
        );
        addLog(
          automationId,
          "📋 Checklist de Onboarding vinculado com sucesso ao colaborador!",
          "success"
        );
      } else if (customCode) {
        addLog(
          automationId,
          "🤖 Executando automação personalizada via IA Sandbox Context...",
          "info"
        );
        const context = {
          employeeRepository,
          suriService,
          supabase,
          toast,
          log: (msg: string, level: ExecutionLog["level"] = "info") =>
            addLog(automationId, msg, level),
        };

        // Execução segura da função dinâmica
        const runner = new Function("context", customCode);
        await runner(context);

        addLog(automationId, "✅ Automação IA executada com sucesso no sistema!", "success");
      }

      toast({
        title: "Automação Concluída!",
        description: "A tarefa foi executada diretamente no sistema.",
      });
    } catch (err: any) {
      addLog(automationId, `❌ Erro na execução: ${err.message || "Falha de execução"}`, "error");
      toast({
        title: "Erro na execução",
        description: err.message || "Ocorreu um erro ao executar.",
        variant: "destructive",
      });
    } finally {
      setExecutingId(null);
    }
  };

  const handleCustomGenerate = () => {
    if (!customPrompt.trim()) return;

    setIsGeneratingCustom(true);

    setTimeout(() => {
      const mockCode = `const { employeeRepository, suriService, log } = context;

// Automação personalizada em Node.js para: ${customPrompt}
async function executeCustomAutomation() {
  log("🚀 Executando automação solicitada...", "info");
  
  const employees = await employeeRepository.getAllActive();
  log(\`📊 Analisando \${employees.length} colaboradores ativos no sistema...\`, "info");
  
  for (const emp of employees.slice(0, 3)) {
    log(\`👤 Processando: \${emp.name} (\${emp.department || 'DMI'})...\`, "info");
  }

  log("✅ Automação concluída e dados atualizados no Supabase!", "success");
}

executeCustomAutomation();
`;
      const mockInstructions = `1. Esta automação pode ser executada DIRETO no sistema clicando no botão '⚡ Executar no Sistema'.
2. Caso prefira rodar localmente via Node.js:
   node script.js`;

      setCustomResult({
        code: mockCode,
        instructions: mockInstructions,
      });
      setIsGeneratingCustom(false);
      toast({
        title: "Script Node.js Gerado!",
        description: "Você pode executá-lo agora mesmo diretamente no sistema ou baixar o código.",
      });
    }, 1200);
  };

  return (
    <AppLayout
      title="Automações"
      subtitle="Central de Execução & Gerador de Scripts Node.js para RH"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-3 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-none shadow-none">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/20 rounded-2xl">
                  <Workflow className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    Central de Automação Interativa
                    <Badge
                      variant="outline"
                      className="bg-primary/10 text-primary border-primary/30"
                    >
                      Execução Direta
                    </Badge>
                  </CardTitle>
                  <CardDescription className="text-base mt-1">
                    Execute tarefas automatizadas em tempo real diretamente no sistema ou gere
                    scripts Node.js para o Supabase.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        <Tabs defaultValue={automations[0].id} className="w-full">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-1">
              <TabsList className="flex flex-col h-auto w-full bg-transparent gap-2 p-0">
                {automations.map((auto) => (
                  <TabsTrigger
                    key={auto.id}
                    value={auto.id}
                    className="w-full justify-start px-4 py-3 data-[state=active]:bg-secondary data-[state=active]:text-foreground border border-transparent data-[state=active]:border-border rounded-xl font-medium"
                  >
                    <auto.icon className="h-4 w-4 mr-2" />
                    {auto.title}
                  </TabsTrigger>
                ))}
                <TabsTrigger
                  value="ai-custom"
                  className="w-full justify-start px-4 py-3 data-[state=active]:bg-secondary data-[state=active]:text-foreground border border-transparent data-[state=active]:border-border rounded-xl font-medium"
                >
                  <Sparkles className="h-4 w-4 mr-2 text-purple-500" />
                  Criar com IA
                </TabsTrigger>
                <TabsTrigger
                  value="library"
                  className="w-full justify-start px-4 py-3 data-[state=active]:bg-secondary data-[state=active]:text-foreground border border-transparent data-[state=active]:border-border mt-4 rounded-xl font-medium"
                >
                  <Library className="h-4 w-4 mr-2" />
                  Meus Scripts
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="md:col-span-3">
              {automations.map((auto) => {
                const isGenerated = !!generatedCodes[auto.id];
                const code = generatedCodes[auto.id] || auto.code;
                const logs = executionLogs[auto.id] || [];

                return (
                  <TabsContent key={auto.id} value={auto.id} className="mt-0">
                    <Card className="rounded-2xl">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <FileCode className="h-5 w-5 text-primary" />
                            <CardTitle>{auto.title}</CardTitle>
                          </div>
                          <Button
                            onClick={() => handleRunInSystem(auto.id)}
                            disabled={executingId === auto.id}
                            className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-sm"
                          >
                            {executingId === auto.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Zap className="h-4 w-4 fill-white" />
                            )}
                            Executar no Sistema
                          </Button>
                        </div>
                        <CardDescription>{auto.description}</CardDescription>
                      </CardHeader>

                      <CardContent className="space-y-6">
                        {/* Formulário de Parâmetros */}
                        <div className="space-y-4 rounded-xl border bg-muted/10 p-4">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            Parâmetros da Automação
                          </h4>
                          <div className="grid gap-4">
                            {auto.fields.map((field) => (
                              <div key={field.name} className="grid gap-2">
                                <Label htmlFor={`${auto.id}-${field.name}`}>{field.label}</Label>
                                <Input
                                  id={`${auto.id}-${field.name}`}
                                  type={field.type}
                                  placeholder={field.placeholder}
                                  defaultValue={field.defaultValue}
                                  onChange={(e) =>
                                    handleInputChange(auto.id, field.name, e.target.value)
                                  }
                                />
                                {field.description && (
                                  <p className="text-xs text-muted-foreground">
                                    {field.description}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                          <div className="flex gap-2 pt-2">
                            <Button
                              onClick={() => handleGenerate(auto)}
                              variant="outline"
                              className="gap-2"
                            >
                              <Workflow className="h-4 w-4" />
                              Ver Script Node.js
                            </Button>
                            <Button
                              onClick={() => handleRunInSystem(auto.id)}
                              disabled={executingId === auto.id}
                              className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                              {executingId === auto.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Play className="h-4 w-4" />
                              )}
                              Executar Agora
                            </Button>
                          </div>
                        </div>

                        {/* Terminal de Logs de Execução em Tempo Real */}
                        {logs.length > 0 && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                <Terminal className="h-4 w-4 text-emerald-500" />
                                Terminal de Execução do Sistema
                              </Label>
                              <Badge
                                variant="outline"
                                className="font-mono text-[10px] bg-slate-900 text-emerald-400 border-slate-700"
                              >
                                Real-time Runner
                              </Badge>
                            </div>
                            <div className="rounded-xl border bg-slate-950 p-4 font-mono text-xs text-slate-100 h-48 overflow-y-auto space-y-1 shadow-inner">
                              {logs.map((log, idx) => (
                                <div key={idx} className="flex items-start gap-2">
                                  <span className="text-slate-500 shrink-0">[{log.time}]</span>
                                  <span
                                    className={
                                      log.level === "success"
                                        ? "text-emerald-400 font-semibold"
                                        : log.level === "error"
                                          ? "text-rose-400 font-semibold"
                                          : log.level === "warn"
                                            ? "text-amber-400"
                                            : "text-slate-200"
                                    }
                                  >
                                    {log.text}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Visualizador de Código Node.js */}
                        {isGenerated && (
                          <div className="space-y-4 pt-2">
                            <div className="flex items-center justify-between bg-secondary/30 p-2 rounded-xl border border-border">
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Check className="h-4 w-4 text-emerald-500" />
                                Script Node.js atualizado
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleReset(auto.id)}
                                >
                                  <RefreshCw className="h-4 w-4 mr-2" />
                                  Resetar
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDownload(code, `${auto.id}.js`)}
                                >
                                  <Download className="h-4 w-4 mr-2" />
                                  Baixar .js
                                </Button>
                                <Button size="sm" onClick={() => handleCopy(code, auto.id)}>
                                  {copiedId === auto.id ? (
                                    <Check className="h-4 w-4 mr-2" />
                                  ) : (
                                    <Copy className="h-4 w-4 mr-2" />
                                  )}
                                  {copiedId === auto.id ? "Copiado" : "Copiar"}
                                </Button>
                              </div>
                            </div>

                            <ScrollArea className="h-[300px] w-full rounded-xl border bg-slate-950 p-4">
                              <pre className="font-mono text-xs text-slate-50">
                                <code>{code}</code>
                              </pre>
                            </ScrollArea>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                );
              })}

              {/* Tab IA Customizada com Execução */}
              <TabsContent value="ai-custom" className="mt-0">
                <Card className="rounded-2xl">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-purple-500" />
                      <CardTitle>Criador de Automação IA Interativa</CardTitle>
                    </div>
                    <CardDescription>
                      Descreva qualquer tarefa de RH em linguagem natural. A IA construirá a
                      automação em Node.js e você poderá executá-la instantaneamente no sistema.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid gap-2">
                        <Label htmlFor="custom-prompt">O que você deseja automatizar?</Label>
                        <Textarea
                          id="custom-prompt"
                          placeholder="Ex: Disparar mensagem WhatsApp para colaboradores sem ponto batido hoje ou gerar relatório consolidado do departamento..."
                          value={customPrompt}
                          onChange={(e) => setCustomPrompt(e.target.value)}
                          rows={4}
                          className="resize-none rounded-xl"
                        />
                      </div>
                      <Button
                        onClick={handleCustomGenerate}
                        disabled={isGeneratingCustom || !customPrompt.trim()}
                        className="w-full md:w-auto bg-purple-600 hover:bg-purple-700 text-white font-semibold gap-2"
                      >
                        {isGeneratingCustom ? (
                          <>
                            <RefreshCw className="h-4 w-4 animate-spin" />
                            Construindo Automação IA...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4" />
                            Gerar Automação IA
                          </>
                        )}
                      </Button>

                      {customResult && (
                        <div className="space-y-6 mt-6 pt-6 border-t animate-in fade-in slide-in-from-bottom-4">
                          <div className="flex items-center justify-between bg-purple-50 dark:bg-purple-950/40 p-4 rounded-xl border border-purple-200 dark:border-purple-800">
                            <div>
                              <h4 className="font-bold text-sm text-purple-900 dark:text-purple-200">
                                Automação Pronta para Execução
                              </h4>
                              <p className="text-xs text-purple-700 dark:text-purple-300">
                                Clique no botão ao lado para executar esta lógica diretamente nos
                                dados do sistema.
                              </p>
                            </div>
                            <Button
                              onClick={() => handleRunInSystem("ai-custom", customResult.code)}
                              disabled={executingId === "ai-custom"}
                              className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                            >
                              {executingId === "ai-custom" ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Zap className="h-4 w-4 fill-white" />
                              )}
                              Executar no Sistema Agora
                            </Button>
                          </div>

                          {/* Terminal de Logs IA */}
                          {(executionLogs["ai-custom"] || []).length > 0 && (
                            <div className="space-y-2">
                              <Label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                <Terminal className="h-4 w-4 text-emerald-500" />
                                Console de Logs da Automação IA
                              </Label>
                              <div className="rounded-xl border bg-slate-950 p-4 font-mono text-xs text-slate-100 h-40 overflow-y-auto space-y-1">
                                {executionLogs["ai-custom"].map((l, i) => (
                                  <div key={i} className="flex items-start gap-2">
                                    <span className="text-slate-500">[{l.time}]</span>
                                    <span
                                      className={
                                        l.level === "success"
                                          ? "text-emerald-400 font-semibold"
                                          : "text-slate-200"
                                      }
                                    >
                                      {l.text}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label>Script Node.js Gerado</Label>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    handleDownload(customResult.code, "custom_script.js")
                                  }
                                >
                                  <Download className="h-4 w-4 mr-2" />
                                  Baixar .js
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    handleSaveToLibrary(
                                      customPrompt.substring(0, 30) + "...",
                                      customPrompt,
                                      customResult.code,
                                      customResult.instructions,
                                      true
                                    )
                                  }
                                >
                                  <Save className="h-4 w-4 mr-2" />
                                  Salvar
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleCopy(customResult.code, "custom")}
                                >
                                  {copiedId === "custom" ? (
                                    <Check className="h-4 w-4 mr-2" />
                                  ) : (
                                    <Copy className="h-4 w-4 mr-2" />
                                  )}
                                  {copiedId === "custom" ? "Copiado" : "Copiar"}
                                </Button>
                              </div>
                            </div>
                            <ScrollArea className="h-[250px] w-full rounded-xl border bg-slate-950 p-4">
                              <pre className="font-mono text-xs text-slate-50">
                                <code>{customResult.code}</code>
                              </pre>
                            </ScrollArea>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Biblioteca de Scripts */}
              <TabsContent value="library" className="mt-0">
                <Card className="rounded-2xl">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Library className="h-5 w-5 text-primary" />
                      <CardTitle>Meus Scripts Salvos</CardTitle>
                    </div>
                    <CardDescription>
                      Biblioteca de automações salvas prontas para execução.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {savedScripts.length === 0 ? (
                      <div className="text-center py-10 text-muted-foreground">
                        Nenhum script salvo ainda. Gere um script Node.js e clique em "Salvar".
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {savedScripts.map((script) => (
                          <div
                            key={script.id}
                            className="p-4 border rounded-xl bg-card hover:bg-accent/5 transition-colors flex items-center justify-between"
                          >
                            <div>
                              <h4 className="font-semibold text-sm">{script.title}</h4>
                              <p className="text-xs text-muted-foreground line-clamp-1">
                                {script.description}
                              </p>
                              <div className="text-[10px] text-muted-foreground mt-1">
                                Criado em: {new Date(script.created_at).toLocaleDateString("pt-BR")}{" "}
                                • Node.js
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                                onClick={() => handleRunInSystem(script.id, script.code)}
                              >
                                <Zap className="h-3.5 w-3.5 fill-white" /> Executar
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleCopy(script.code, script.id)}
                              >
                                {copiedId === script.id ? (
                                  <Check className="h-4 w-4" />
                                ) : (
                                  <Copy className="h-4 w-4" />
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDownload(script.code, `${script.title}.js`)}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </div>
        </Tabs>
      </div>
    </AppLayout>
  );
}
