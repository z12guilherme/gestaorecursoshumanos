import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { BookOpen, CheckCircle2, HelpCircle } from "lucide-react";

export function ManualModal() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-primary">
          <BookOpen className="h-4 w-4" />
          Manual do Usuário
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl h-[85vh] flex flex-col p-0 gap-0">
        <div className="p-6 pb-4 border-b">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-primary" />
              Manual do Sistema GestãoRH
            </DialogTitle>
            <DialogDescription>
              Guia completo de funcionalidades e operações do sistema.
            </DialogDescription>
          </DialogHeader>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-8 text-sm text-foreground/80">
          
          {/* 1. Visão Geral */}
          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              1. Visão Geral
            </h3>
            <p>
              Ao fazer login, você será direcionado ao <strong>Dashboard</strong>. Esta tela oferece uma visão panorâmica da empresa:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>KPIs:</strong> Total de colaboradores, funcionários ativos, pessoas em férias e afastados.</li>
              <li><strong>Gráficos:</strong> Tendências de contratação e distribuição por departamento.</li>
              <li><strong>Atalhos:</strong> Acesso rápido às principais funções.</li>
            </ul>
          </section>

          <hr className="border-border" />

          {/* 2. Gestão de Colaboradores */}
          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground">2. Gestão de Colaboradores</h3>
            <p>O módulo de colaboradores é o coração do sistema.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-muted/50 p-3 rounded-md">
                <strong className="block mb-1 text-foreground">Listagem & Busca</strong>
                Visualize todos os funcionários com filtros por departamento e status.
              </div>
              <div className="bg-muted/50 p-3 rounded-md">
                <strong className="block mb-1 text-foreground">Cadastro & Importação</strong>
                Adicione manualmente ou importe planilhas Excel com múltiplos funcionários.
              </div>
              <div className="bg-muted/50 p-3 rounded-md">
                <strong className="block mb-1 text-foreground">Perfil Detalhado</strong>
                Histórico completo, alteração de senha do ponto e edição de dados.
              </div>
              <div className="bg-muted/50 p-3 rounded-md">
                <strong className="block mb-1 text-foreground">Desligamento</strong>
                Processo de demissão que altera o status e arquiva o histórico.
              </div>
            </div>
          </section>

          <hr className="border-border" />

          {/* 3. Recrutamento */}
          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground">3. Recrutamento e Seleção</h3>
            <p>Gerencie seus processos seletivos em um quadro visual (Kanban).</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Vagas:</strong> Crie e publique novas oportunidades.</li>
              <li><strong>Candidatos:</strong> Cadastre candidatos e vincule-os às vagas.</li>
              <li><strong>Fluxo:</strong> Arraste os candidatos: <em>Inscrito → Triagem → Entrevista → Aprovado</em>.</li>
            </ul>
          </section>

          <hr className="border-border" />

          {/* 4. Férias e Ausências */}
          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground">4. Férias e Ausências</h3>
            <p>Controle o calendário de folgas da equipe.</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Solicitações:</strong> Visualize pedidos de férias pendentes.</li>
              <li><strong>Aprovação:</strong> Aprove ou rejeite com um clique. O status do funcionário atualiza automaticamente.</li>
              <li><strong>Calendário:</strong> Visão mensal de quem estará ausente.</li>
            </ul>
          </section>

          <hr className="border-border" />

          {/* 5. Ponto Eletrônico */}
          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground">5. Ponto Eletrônico</h3>
            <div className="space-y-2">
              <p><strong>Terminal de Ponto:</strong> Interface simplificada onde o colaborador usa sua senha (PIN) para registrar entrada/saída.</p>
              <p><strong>Relatório (RH):</strong> O gestor visualiza o espelho de ponto, com filtros por data e funcionário.</p>
            </div>
          </section>

          <hr className="border-border" />

          {/* 8. Assistente IA */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-foreground">8. Assistente IA</h3>
              <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">Novo</span>
            </div>
            <p>O Assistente Virtual agiliza tarefas repetitivas através de chat.</p>
            
            <div className="border rounded-md overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted text-muted-foreground">
                  <tr>
                    <th className="p-3 font-medium">O que você quer fazer?</th>
                    <th className="p-3 font-medium">Exemplo de comando</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <tr>
                    <td className="p-3">Consultar Pessoal</td>
                    <td className="p-3 italic">"Quantos funcionários temos?" ou "Listar setor de TI"</td>
                  </tr>
                  <tr>
                    <td className="p-3">Dar Férias</td>
                    <td className="p-3 italic">"Dar férias para Ana de 10/11 a 20/11"</td>
                  </tr>
                  <tr>
                    <td className="p-3">Criar Vaga</td>
                    <td className="p-3 italic">"Abrir vaga de Analista no Financeiro"</td>
                  </tr>
                  <tr>
                    <td className="p-3">Publicar Aviso</td>
                    <td className="p-3 italic">"Criar aviso: Reunião amanhã às 14h"</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-xs text-muted-foreground">
              <strong>Dica:</strong> Se estiver perdido, digite "Ajuda" ou "Menu" no chat para ver as opções.
            </p>
          </section>

          <hr className="border-border" />

          {/* Suporte */}
          <section className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg flex gap-3 items-start">
            <HelpCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-900 dark:text-blue-300">Precisa de ajuda?</h4>
              <p className="text-blue-800 dark:text-blue-400">
                Caso encontre algum erro ou tenha dúvidas não cobertas por este manual, entre em contato com o suporte técnico.
              </p>
            </div>
          </section>

        </div>
      </DialogContent>
    </Dialog>
  );
}