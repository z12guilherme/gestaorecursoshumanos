import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Workflow, Copy, Check, FileCode, Mail, FileSpreadsheet, UserPlus, Download, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const automations = [
  {
    id: 'birthday-emails',
    title: 'E-mails de Aniversário',
    description: 'Envia e-mails automáticos para colaboradores aniversariantes do dia.',
    icon: Mail,
    language: 'python',
    fields: [
      { name: 'csv_file', label: 'Caminho do Arquivo CSV', type: 'text', placeholder: 'ex: C:/Users/user/colaboradores.csv', defaultValue: 'colaboradores.csv', description: 'O arquivo CSV deve conter as colunas: nome, data_nascimento, email.' }
    ],
    code: `import smtplib
import pandas as pd
from datetime import datetime
from email.mime.text import MIMEText

def send_birthday_emails(csv_file):
    # Configurações do servidor de e-mail (ajuste conforme necessário)
    smtp_server = "smtp.empresa.com"
    smtp_port = 587
    sender_email = "rh@empresa.com"
    password = "sua_senha_de_app_aqui" # Use uma senha de aplicativo se tiver 2FA

    try:
        # Ler dados dos colaboradores
        df = pd.read_csv(csv_file)
    except FileNotFoundError:
        print(f"Erro: Arquivo '{csv_file}' não encontrado.")
        return

    # Normalizar a coluna de data para dd/mm se existir
    if 'data_nascimento' in df.columns:
        df['data_nascimento'] = pd.to_datetime(df['data_nascimento'], errors='coerce').dt.strftime('%d/%m')
    else:
        print("Erro: A coluna 'data_nascimento' não foi encontrada no CSV.")
        return

    today = datetime.now().strftime('%d/%m')

    # Filtrar aniversariantes
    birthdays = df[df['data_nascimento'] == today]

    if birthdays.empty:
        print("Nenhum aniversariante hoje.")
        return

    try:
        # Conectar ao servidor
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()
        server.login(sender_email, password)

        for index, row in birthdays.iterrows():
            msg = MIMEText(f"Parabéns, {row['nome']}! Desejamos um feliz aniversário!")
            msg['Subject'] = "Feliz Aniversário!"
            msg['From'] = sender_email
            msg['To'] = row['email']

            server.send_message(msg)
            print(f"E-mail de aniversário enviado com sucesso para {row['nome']} ({row['email']})")

        server.quit()
    except Exception as e:
        print(f"Ocorreu um erro ao enviar os e-mails: {e}")

# --- Início da Execução ---
# Chame a função com o caminho para o seu arquivo de colaboradores.
# Certifique-se que o arquivo CSV contenha as colunas 'nome', 'data_nascimento' (dd/mm/aaaa), e 'email'.
send_birthday_emails("{{csv_file}}")
`
  },
  {
    id: 'timesheet-report',
    title: 'Relatório de Ponto',
    description: 'Gera um relatório mensal de horas trabalhadas e horas extras.',
    icon: FileSpreadsheet,
    language: 'python',
    fields: [
      { name: 'input_file', label: 'Arquivo de Ponto (CSV)', type: 'text', placeholder: 'ponto_mensal.csv', defaultValue: 'ponto_mensal.csv', description: 'CSV com colunas: colaborador, entrada, saida.' },
      { name: 'output_file', label: 'Nome do Relatório (Excel)', type: 'text', placeholder: 'relatorio_final.xlsx', defaultValue: 'relatorio_horas.xlsx', description: 'Nome do arquivo Excel que será gerado.' },
      { name: 'monthly_hours', label: 'Horas Mensais Contratadas', type: 'number', placeholder: '160', defaultValue: 160, description: 'Total de horas mensais para cálculo de horas extras.' }
    ],
    code: `import pandas as pd

def generate_timesheet_report(input_file, output_file, monthly_hours):
    try:
        # Carregar dados de ponto
        df = pd.read_csv(input_file)
    except FileNotFoundError:
        print(f"Erro: Arquivo de entrada '{input_file}' não encontrado.")
        return

    # Converter colunas de data/hora
    df['entrada'] = pd.to_datetime(df['entrada'])
    df['saida'] = pd.to_datetime(df['saida'])
    
    # Calcular horas trabalhadas
    df['horas_trabalhadas'] = (df['saida'] - df['entrada']).dt.total_seconds() / 3600
    
    # Agrupar por colaborador
    report = df.groupby('colaborador')['horas_trabalhadas'].sum().reset_index()
    
    # Calcular horas extras
    report['horas_extras'] = report['horas_trabalhadas'].apply(lambda x: max(0, x - monthly_hours))
    
    # Salvar relatório
    report.to_excel(output_file, index=False)
    print(f"Relatório de horas gerado com sucesso e salvo em '{output_file}'")

# --- Início da Execução ---
# Uso:
generate_timesheet_report("{{input_file}}", "{{output_file}}", {{monthly_hours}})
`
  },
  {
    id: 'onboarding-setup',
    title: 'Setup de Onboarding',
    description: 'Cria pastas e arquivos iniciais para novos colaboradores.',
    icon: UserPlus,
    language: 'python',
    fields: [
      { name: 'employee_name', label: 'Nome do Colaborador', type: 'text', placeholder: 'João da Silva', defaultValue: '', description: 'Nome completo do novo colaborador.' },
      { name: 'department', label: 'Departamento', type: 'text', placeholder: 'TI', defaultValue: '', description: 'Departamento ao qual o colaborador pertence.' }
    ],
    code: `import os
import shutil

def setup_new_employee(employee_name, department):
    # Caminho base relativo ao local de execução do script
    base_path = "./documentos_colaboradores"
    
    # Sanitizar nomes para evitar problemas com caminhos de diretório
    safe_employee_name = "".join(c for c in employee_name if c.isalnum() or c in (' ', '_')).rstrip()
    safe_department = "".join(c for c in department if c.isalnum() or c in (' ', '_')).rstrip()

    if not safe_employee_name or not safe_department:
        print("Erro: Nome do colaborador ou departamento inválido.")
        return

    # Criar estrutura de pastas
    employee_folder = os.path.join(base_path, safe_department, safe_employee_name)
    subfolders = ['Documentos Pessoais', 'Contrato', 'Avaliacoes de Desempenho']
    
    try:
        print(f"Criando estrutura de diretórios para {employee_name} em '{employee_folder}'...")
        for folder in subfolders:
            os.makedirs(os.path.join(employee_folder, folder), exist_ok=True)
            
        # Exemplo: Copiar um template de manual do funcionário (se existir)
        template_manual_path = './templates/manual_do_funcionario.pdf'
        if os.path.exists(template_manual_path):
            shutil.copy2(template_manual_path, os.path.join(employee_folder, 'manual_do_funcionario.pdf'))
            print("Manual do funcionário copiado.")
        else:
            print("Aviso: Template 'manual_do_funcionario.pdf' não encontrado, pulando cópia.")

        # Criar um arquivo de boas-vindas
        with open(os.path.join(employee_folder, 'boas_vindas.txt'), 'w') as f:
            f.write(f"Bem-vindo(a), {employee_name}!\n\n")
            f.write("Este é o seu diretório para documentos relacionados à empresa.\n")
            f.write(f"Departamento: {department}\n")

        print(f"Processo de onboarding concluído para {employee_name}.")
        
    except OSError as e:
        print(f"Erro ao criar diretórios ou arquivos: {e}")

# --- Início da Execução ---
# Uso:
setup_new_employee("{{employee_name}}", "{{department}}")
`
  }
];

export default function Automations() {
  const { toast } = useToast();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [generatedCodes, setGeneratedCodes] = useState<{ [key: string]: string }>({});
  const [formValues, setFormValues] = useState<{ [key: string]: any }>({});

  const handleInputChange = (automationId: string, fieldName: string, value: any) => {
    setFormValues(prev => ({
      ...prev,
      [`${automationId}-${fieldName}`]: value,
    }));
  };

  const handleGenerate = (automation: typeof automations[0]) => {
    let finalCode = automation.code;
    
    automation.fields.forEach(field => {
      const value = formValues[`${automation.id}-${field.name}`] || field.defaultValue;
      const placeholder = new RegExp(`{{${field.name}}}`, 'g');
      finalCode = finalCode.replace(placeholder, value);
    });

    setGeneratedCodes(prev => ({
      ...prev,
      [automation.id]: finalCode
    }));
  };

  const handleReset = (automationId: string) => {
    setGeneratedCodes(prev => {
      const newState = { ...prev };
      delete newState[automationId];
      return newState;
    });
    // Opcional: limpar os valores do formulário também
    // setFormValues(...)
  };


  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    toast({
      title: "Código copiado!",
      description: "O script foi copiado para sua área de transferência.",
    });
    
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownload = (code: string, filename: string) => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <AppLayout title="Automações" subtitle="Gerador de scripts Python customizados para RH">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <Card className="md:col-span-3 bg-gradient-to-r from-primary/10 to-transparent border-none shadow-none">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/20 rounded-lg">
                  <Workflow className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <CardTitle>Central de Automação</CardTitle>
                  <CardDescription className="text-base mt-1">
                    Configure os parâmetros abaixo para gerar scripts Python prontos para uso.
                    Automatize tarefas repetitivas sem precisar programar do zero.
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
                    className="w-full justify-start px-4 py-3 data-[state=active]:bg-secondary data-[state=active]:text-foreground border border-transparent data-[state=active]:border-border"
                  >
                    <auto.icon className="h-4 w-4 mr-2" />
                    {auto.title}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
            
            <div className="md:col-span-3">
              {automations.map((auto) => {
                const isGenerated = !!generatedCodes[auto.id];
                const code = generatedCodes[auto.id] || '';

                return (
                  <TabsContent key={auto.id} value={auto.id} className="mt-0">
                    <Card>
                      <CardHeader>
                        <div className="flex items-center gap-2">
                          <FileCode className="h-5 w-5 text-muted-foreground" />
                          <CardTitle>{auto.title}</CardTitle>
                        </div>
                        <CardDescription>{auto.description}</CardDescription>
                      </CardHeader>
                      
                      <CardContent>
                        {!isGenerated ? (
                          <div className="space-y-4">
                            <div className="grid gap-4 py-4">
                              {auto.fields.map((field) => (
                                <div key={field.name} className="grid gap-2">
                                  <Label htmlFor={`${auto.id}-${field.name}`}>{field.label}</Label>
                                  <Input
                                    id={`${auto.id}-${field.name}`}
                                    type={field.type}
                                    placeholder={field.placeholder}
                                    defaultValue={field.defaultValue}
                                    onChange={(e) => handleInputChange(auto.id, field.name, e.target.value)}
                                  />
                                  {field.description && (
                                    <p className="text-xs text-muted-foreground">{field.description}</p>
                                  )}
                                </div>
                              ))}
                            </div>
                            <Button onClick={() => handleGenerate(auto)} className="w-full md:w-auto">
                              <Workflow className="mr-2 h-4 w-4" />
                              Gerar Script
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="flex items-center justify-between bg-secondary/30 p-2 rounded-md border border-border">
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Check className="h-4 w-4 text-green-500" />
                                Script gerado com sucesso!
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleReset(auto.id)}
                                >
                                  <RefreshCw className="h-4 w-4 mr-2" />
                                  Gerar Novo
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDownload(code, `${auto.id}.py`)}
                                >
                                  <Download className="h-4 w-4 mr-2" />
                                  Baixar .py
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => handleCopy(code, auto.id)}
                                >
                                  {copiedId === auto.id ? (
                                    <Check className="h-4 w-4 mr-2" />
                                  ) : (
                                    <Copy className="h-4 w-4 mr-2" />
                                  )}
                                  {copiedId === auto.id ? "Copiado" : "Copiar"}
                                </Button>
                              </div>
                            </div>
                            
                            <ScrollArea className="h-[400px] w-full rounded-md border bg-slate-950 p-4">
                              <pre className="font-mono text-sm text-slate-50">
                                <code>{code}</code>
                              </pre>
                            </ScrollArea>
                            
                            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                              <strong>Instruções de Execução:</strong>
                              <ol className="list-decimal list-inside mt-2 space-y-1">
                                <li>Instale o Python em seu computador.</li>
                                <li>Instale as dependências necessárias: <code>pip install pandas openpyxl</code></li>
                                <li>Baixe o script ou copie o código para um arquivo <code>.py</code>.</li>
                                <li>Certifique-se de que os arquivos de entrada (CSV, etc) estejam no local correto.</li>
                                <li>Execute no terminal: <code>python {auto.id}.py</code></li>
                              </ol>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                );
              })}
            </div>
          </div>
        </Tabs>
      </div>
    </AppLayout>
  );
}
