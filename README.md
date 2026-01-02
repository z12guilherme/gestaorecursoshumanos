# 🚀 Sistema de Gestão de Recursos Humanos

Um sistema moderno e intuitivo para a gestão de recursos humanos, construído com as mais recentes tecnologias web.

## ✨ Tecnologias Utilizadas

Este projeto foi construído com:

- ![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
- ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
- ![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
- ![shadcn/ui](https://img.shields.io/badge/shadcn/ui-000000?style=for-the-badge&logo=shadcnui&logoColor=white)
- ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

## 🛠️ Funcionalidades

O sistema conta atualmente com os seguintes módulos:

- **📊 Dashboard**: Visão geral com métricas de RH, gráficos de tendências, aniversariantes e atividades recentes.
- **👥 Gestão de Colaboradores**:
  - Listagem, cadastro e edição de funcionários.
  - Controle de status (Ativo, Férias, Afastado, Desligado).
  - Importação em massa via Excel/CSV.
  - Ações rápidas para concessão de férias e desligamento com confirmação.
- **📅 Controle de Férias e Ponto**:
  - Gestão de solicitações de ausência.
  - Visualização de colaboradores em férias e alertas de cobertura de setor.
  - Aprovação e rejeição de pedidos.
- **📢 Comunicação Interna**: Mural de avisos e comunicados importantes com níveis de prioridade.
- **🤝 Recrutamento e Seleção**:
  - Quadro Kanban (arrastar e soltar) para gestão de candidatos.
  - Gerenciamento de vagas em aberto.
- **🤖 Assistente de IA**:
  - Chat inteligente para consultas e execução de tarefas operacionais.
  - Comandos de linguagem natural (ex: "Agendar férias para João", "Desligar colaborador Maria").
  - Análise de dados e sugestões proativas.

## 🏁 Começando

Para obter uma cópia local e executá-la, siga estes passos simples.

### ✅ Pré-requisitos

Você precisa ter o Node.js e o npm instalados em sua máquina. Você pode instalá-los usando o [nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

### ⚙️ Instalação

1.  Clone o repositório
    ```sh
    git clone <URL_DO_SEU_GIT>
    ```
2.  Navegue até o diretório do projeto
    ```sh
    cd gestaorecursoshumanos
    ```
3.  Instale os pacotes NPM
    ```sh
    npm install
    ```
4.  Inicie o servidor de desenvolvimento
    ```sh
    npm run dev
    ```

A aplicação estará disponível em `http://localhost:5173`.

## 🔑 Login

Para fins de desenvolvimento, você pode fazer login com qualquer e-mail e senha.

## 🚀 Próximos Passos (Roadmap)

- [ ] **Integração com Banco de Dados Real**: Migração do armazenamento local (`localStorage`) para **Supabase** (PostgreSQL) para persistência segura e escalável dos dados.
- [ ] Implementação de autenticação robusta e níveis de permissão de usuário.
- [ ] Geração de relatórios avançados em PDF.
