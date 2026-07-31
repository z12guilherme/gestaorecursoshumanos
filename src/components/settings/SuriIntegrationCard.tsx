import { useState, useEffect } from "react";
import { suriService, SuriConfig } from "@/services/suriService";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Send,
  RefreshCw,
  Globe,
  Key,
  ShieldCheck,
  Zap,
} from "lucide-react";

export function SuriIntegrationCard() {
  const { toast } = useToast();
  const [config, setConfig] = useState<SuriConfig>(suriService.getConfig());
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const [testPhone, setTestPhone] = useState("");
  const [testMessage, setTestMessage] = useState(
    "Olá! Esta é uma mensagem de teste da integração SURI WhatsApp."
  );
  const [sendingTestMessage, setSendingTestMessage] = useState(false);

  useEffect(() => {
    setConfig(suriService.getConfig());
  }, []);

  const handleSave = () => {
    const updated = suriService.saveConfig(config);
    setConfig(updated);
    toast({
      title: "Integração SURI Salva",
      description: "As configurações do SURI WhatsApp foram atualizadas com sucesso.",
    });
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await suriService.testConnection(config);
      setTestResult(res);
      if (res.success) {
        toast({
          title: "Conexão SURI OK",
          description: res.message,
        });
      } else {
        toast({
          title: "Erro no teste",
          description: res.message,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      setTestResult({
        success: false,
        message: error?.message || "Falha inesperada ao testar conexão.",
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSendTestMessage = async () => {
    if (!testPhone.trim()) {
      toast({
        title: "Número obrigatório",
        description: "Digite um número com DDD para enviar a mensagem de teste.",
        variant: "destructive",
      });
      return;
    }

    setSendingTestMessage(true);
    try {
      const result = await suriService.sendMessage(testPhone, testMessage);
      if (result.success) {
        toast({
          title: "Mensagem enviada!",
          description: `Mensagem enviada com sucesso via SURI WhatsApp para ${testPhone}.`,
        });
      } else {
        toast({
          title: "Erro no envio",
          description: result.error || "Não foi possível entregar a mensagem.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Erro ao disparar",
        description: error.message || "Erro no envio.",
        variant: "destructive",
      });
    } finally {
      setSendingTestMessage(false);
    }
  };

  const webhooksList = [
    "new-contact",
    "change-queue",
    "finish-attendance",
    "message-received",
    "message-sent",
  ];

  return (
    <div className="space-y-6">
      {/* Principal SURI Card */}
      <Card className="border-emerald-500/20 shadow-sm">
        <CardHeader className="bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                <MessageSquare className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  WhatsApp SURI AI{" "}
                  <Badge
                    variant="outline"
                    className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-[10px]"
                  >
                    Ativo
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Integração oficial via Chatbotmaker para notificar candidatos e funcionários via
                  WhatsApp.
                </CardDescription>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 border-emerald-500/30 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
              onClick={handleTestConnection}
              disabled={testing}
            >
              {testing ? (
                <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
              ) : (
                <RefreshCw className="h-4 w-4 text-emerald-600" />
              )}
              Testar Conexão
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pt-6">
          {/* Status do Teste */}
          {testResult && (
            <div
              className={`flex items-start gap-3 rounded-xl border p-4 text-sm ${
                testResult.success
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-900 dark:text-emerald-200"
                  : "border-rose-500/30 bg-rose-500/10 text-rose-900 dark:text-rose-200"
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
              ) : (
                <AlertCircle className="h-5 w-5 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
              )}
              <div>
                <p className="font-semibold">
                  {testResult.success ? "Conexão Ativa" : "Falha na Conexão"}
                </p>
                <p className="text-xs opacity-90">{testResult.message}</p>
              </div>
            </div>
          )}

          {/* Form de Parâmetros SURI */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <Globe className="h-3.5 w-3.5" /> Endpoint SURI
              </Label>
              <Input
                value={config.endpoint}
                onChange={(e) => setConfig({ ...config, endpoint: e.target.value })}
                placeholder="https://cb89694138.api.suri.ai/"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5" /> Identificador da Conta
              </Label>
              <Input
                value={config.identifier}
                onChange={(e) => setConfig({ ...config, identifier: e.target.value })}
                placeholder="cb89694138"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Nome da Instância / Canal
              </Label>
              <Input
                value={config.name}
                onChange={(e) => setConfig({ ...config, name: e.target.value })}
                placeholder="DMI"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <Key className="h-3.5 w-3.5" /> Token Bearer API
              </Label>
              <Input
                type="password"
                value={config.token}
                onChange={(e) => setConfig({ ...config, token: e.target.value })}
                placeholder="5e43b5ec-7311-4324-8c34-820850928cc9"
              />
            </div>
          </div>

          {/* Webhooks Ativos */}
          <div className="rounded-xl border bg-muted/20 p-4 space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-amber-500" /> Webhooks de Eventos Habilitados
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {webhooksList.map((wh) => (
                <Badge
                  key={wh}
                  variant="outline"
                  className="bg-background font-mono text-[11px] px-2 py-0.5"
                >
                  {wh}
                </Badge>
              ))}
            </div>
          </div>

          {/* Switches de Automação */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Automações de Notificação
            </h4>

            <div className="flex items-center justify-between rounded-xl border p-3">
              <div className="space-y-0.5">
                <Label className="text-sm font-semibold">Notificar Candidatos Automático</Label>
                <p className="text-xs text-muted-foreground">
                  Dispara mensagem no WhatsApp ao candidato quando a etapa da vaga for alterada no
                  Kanban.
                </p>
              </div>
              <Switch
                checked={config.autoCandidateNotify}
                onCheckedChange={(c) => setConfig({ ...config, autoCandidateNotify: c })}
              />
            </div>

            <div className="flex items-center justify-between rounded-xl border p-3">
              <div className="space-y-0.5">
                <Label className="text-sm font-semibold">Notificar Funcionários Automático</Label>
                <p className="text-xs text-muted-foreground">
                  Dispara WhatsApp para colaboradores em solicitações de folha e comunicados.
                </p>
              </div>
              <Switch
                checked={config.autoEmployeeNotify}
                onCheckedChange={(c) => setConfig({ ...config, autoEmployeeNotify: c })}
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              onClick={handleSave}
              className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Salvar Configurações SURI
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Disparo de Teste Manual */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Send className="h-4 w-4 text-emerald-600" />
            Enviar Mensagem de Teste WhatsApp
          </CardTitle>
          <CardDescription>
            Teste o disparo direto para um celular cadastrado usando as credenciais SURI salvas.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5 sm:col-span-1">
              <Label className="text-xs font-semibold">Número do Celular (com DDD)</Label>
              <Input
                placeholder="Ex: 81999998888"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-xs font-semibold">Mensagem de Teste</Label>
              <Input value={testMessage} onChange={(e) => setTestMessage(e.target.value)} />
            </div>
          </div>
          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={handleSendTestMessage}
              disabled={sendingTestMessage}
              className="gap-2 border-emerald-500/40 text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400"
            >
              {sendingTestMessage ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Enviar Teste WhatsApp
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
