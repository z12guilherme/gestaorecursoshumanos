# 🚀 Sistema de Gestão de Recursos Humanos (GestaoRH)

Um sistema moderno, intuitivo e completo para a gestão de recursos humanos, projetado para otimizar processos administrativos e estratégicos. Construído com as mais recentes tecnologias web e integrado a um backend robusto para oferecer uma experiência de usuário fluida e responsiva.

![GestaoRH Screenshot](./img/print.JPG)

> **🔗 Demonstração Online:** [Acesse o sistema aqui](https://gestaorecursoshumanos.vercel.app/login)

## ✨ Tecnologias Utilizadas

Este projeto foi desenvolvido utilizando uma stack moderna e robusta:

- **Core:**
  - ![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?style=flat&logo=supabase&logoColor=white) **Supabase** (Backend & Banco de Dados)
  - ![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB) **React 18**
  - ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white) **TypeScript**
  - ![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white) **Vite**

- **UI & Estilização:**
  - ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white) **Tailwind CSS**
  - **shadcn/ui** (Componentes reutilizáveis)
  - **Lucide React** (Ícones)

- **Funcionalidades & Utilitários:**
  - **Recharts** (Gráficos e visualização de dados)
  - **React Router DOM** (Navegação)
  - **jsPDF & jspdf-autotable** (Geração de relatórios PDF)
  - **XLSX** (Manipulação de planilhas Excel)
  - **Date-fns** (Manipulação de datas)

## 🛠️ Módulos e Funcionalidades

O sistema é dividido em módulos integrados para cobrir todas as áreas do RH:

### 📊 Dashboard
Visão panorâmica da empresa com métricas em tempo real.
- KPIs de total de colaboradores, turnover, vagas abertas e solicitações pendentes.
- Gráficos de tendências de contratação e distribuição por departamento.
- Lista de aniversariantes do mês e atividades recentes.

### 👥 Gestão de Colaboradores
Controle total sobre o quadro de funcionários.
- **Listagem e Busca**: Filtros avançados por departamento e status.
- **CRUD Completo**: Adição, edição e visualização de detalhes.
- **Ações Rápidas**: Concessão de férias, desligamento e alteração de status.
- **Importação em Massa**: Suporte para importação de dados via arquivos Excel/CSV.

### 🤝 Recrutamento e Seleção
Ferramentas para atrair e selecionar talentos.
- **Quadro Kanban**: Gestão visual de candidatos por etapas (Inscrito, Triagem, Entrevista, Aprovado).
- **Gestão de Vagas**: Criação e edição de descrições de vagas.
- **Movimentação**: Arrastar e soltar candidatos entre as fases do processo.

### 📅 Férias & Ausências
Gestão eficiente de ausências e licenças.
- **Solicitações**: Visualização de pedidos de férias e licenças.
- **Aprovação**: Fluxo de aprovação ou rejeição de solicitações.
- **Visão Geral**: Calendário e lista de quem está ausente.

### 🕒 Ponto Eletrônico
Interface pública para que os colaboradores registrem suas horas.
- **Registro Simplificado**: O colaborador seleciona seu perfil, insere sua senha e o sistema captura a hora automaticamente.
- **Controle de Entrada e Saída**: Lógica para alternar entre registro de entrada e saída.

### 📋 Controle de Ponto
Acompanhamento detalhado dos registros de ponto.
- **Relatório Completo**: Lista com todos os eventos de entrada e saída dos funcionários.
- **Visualização Rápida**: Badges para identificar o tipo de registro.

### 📢 Comunicação Interna
Canal direto com a equipe.
- **Mural de Avisos**: Publicação de comunicados com níveis de prioridade (Alta, Média, Baixa).
- **Histórico**: Registro de mensagens enviadas.

### 🤖 Automações & IA
Suporte inteligente para o gestor de RH.
- **Gerador de Scripts**: Modelos pré-definidos para tarefas comuns (e-mails de aniversário, relatórios de ponto).
- **Criação com IA**: Descreva uma tarefa e a IA gera um script Python para automatizá-la.
- **Exportação**: Baixe os scripts gerados para uso local.

### ⚙️ Configurações
Gerenciamento centralizado das preferências do sistema.
- **Dados da Empresa**: Edição de informações institucionais.
- **Preferências**: Configuração de tema (Claro/Escuro) e notificações.

## 📂 Estrutura do Projeto

```
src/
├── components/      # Componentes reutilizáveis (UI, Layout, específicos de módulos)
├── contexts/        # Contextos do React (ex: ThemeContext)
├── hooks/           # Hooks personalizados (use-toast, etc.)
├── lib/             # Utilitários e configurações de bibliotecas
├── pages/           # Páginas principais da aplicação (rotas)
│   ├── ClockIn.tsx      # (Terminal de Ponto - /time-off)
│   ├── TimeOff.tsx      # (Férias & Ausências - /absences)
│   ├── Timesheet.tsx    # (Relatório de Ponto - /timesheet)
│   └── ...
├── types/           # Definições de tipos globais
└── App.tsx          # Componente raiz e configuração de rotas
```

## 🏁 Começando

Siga estas instruções para obter uma cópia do projeto e executá-la localmente.

### ✅ Pré-requisitos

- Node.js (versão 18 ou superior recomendada)
- npm ou yarn

### ⚙️ Instalação

1.  **Clone o repositório**
    ```sh
    git clone <URL_DO_SEU_GIT>
    ```

2.  **Acesse o diretório**
    ```sh
    cd gestaorecursoshumanos
    ```

3.  **Configure as Variáveis de Ambiente**
    Crie um arquivo `.env` na raiz do projeto e adicione suas credenciais do Supabase:
    ```env
    VITE_SUPABASE_URL="SUA_URL_DO_SUPABASE"
    VITE_SUPABASE_ANON_KEY="SUA_CHAVE_ANONIMA_DO_SUPABASE"
    ```

4.  **Instale as dependências**
    ```sh
    npm install
    ```

5.  **Inicie o servidor de desenvolvimento**
    ```sh
    npm run dev
    ```

6.  **Acesse a aplicação**
    Abra seu navegador em `http://localhost:5173`.

## 🗄️ Banco de Dados (Supabase)

O projeto utiliza o Supabase como backend. Certifique-se de criar as seguintes tabelas no seu projeto:
- `employees` (Colaboradores)
- `candidates` (Candidatos)
- `job_postings` (Vagas)
- `time_off_requests` (Solicitações de Férias)
- `settings` (Configurações do Sistema)
- `automation_scripts` (Scripts de Automação)

## 🔑 Acesso

O sistema utiliza a autenticação do Supabase.
1. Crie um usuário no painel de **Authentication** do Supabase.
2. Utilize o e-mail e senha cadastrados para fazer login na aplicação.

## 🚀 Roadmap (Próximos Passos)

 - [x] **Backend Real**: Integração com Supabase/PostgreSQL para persistência de dados.
- [x] **Autenticação**: Implementação de login seguro com JWT/OAuth.
- [x] **Ponto Eletrônico**: Módulo para registro e espelho de ponto.
- [ ] **App Mobile**: Versão responsiva otimizada ou app nativo.

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.
