# 📘 Manual do Usuário - Sistema GestãoRH

Bem-vindo ao **GestãoRH**, a plataforma integrada para administração de recursos humanos. Este documento serve como guia de referência para todas as funcionalidades do sistema, desde o cadastro de colaboradores até o uso do assistente de inteligência artificial.

---

## 📑 Índice

1.  [Visão Geral](#1-visão-geral)
2.  [Gestão de Colaboradores](#2-gestão-de-colaboradores)
3.  [Recrutamento e Seleção](#3-recrutamento-e-seleção)
4.  [Férias e Ausências](#4-férias-e-ausências)
5.  [Ponto Eletrônico](#5-ponto-eletrônico)
6.  [Avaliação de Desempenho](#6-avaliação-de-desempenho)
7.  [Comunicação Interna](#7-comunicação-interna)
8.  [Ouvidoria e Sugestões](#8-ouvidoria-e-sugestões)
9.  [🤖 Manual do Assistente IA](#9-manual-do-assistente-ia)
10. [⚙️ Automações](#10-automações-scripts-python)
11. [Configurações](#11-configurações)

---

## 1. Visão Geral

Ao fazer login, você será direcionado ao **Dashboard**. Esta tela oferece uma visão panorâmica da empresa:
*   **KPIs:** Total de colaboradores, funcionários ativos, pessoas em férias e afastados.
*   **Gráficos:** Tendências de contratação e distribuição por departamento.
*   **Atalhos:** Acesso rápido às principais funções.

---

## 2. Gestão de Colaboradores

O módulo de colaboradores é o coração do sistema.

### Funcionalidades:
*   **Listagem:** Visualize todos os funcionários com filtros por departamento e status.
*   **Cadastro:** Adicione novos colaboradores manualmente preenchendo o formulário completo (Dados Pessoais, Cargo, Salário, etc.).
*   **Documentos:** Na aba "Documentos" do perfil, faça upload de arquivos digitalizados (PDF/Imagens) como CNH, Contrato de Trabalho e Atestados.
*   **Foto de Perfil:** Adicione uma foto ao perfil do colaborador. O sistema otimiza a imagem para economizar espaço, mas recomendamos o uso de fotos com até 500x500 pixels.
*   **Financeiro:** Configure adicionais fixos (Insalubridade, Noturno), lançamentos variáveis (Gratificações, Bônus) e descontos eventuais (Farmácia, Adiantamentos) para cálculo preciso da folha. O sistema utiliza a tabela progressiva do INSS (2026) automaticamente.
*   **Importação:** Utilize o botão de importação para carregar planilhas Excel com múltiplos funcionários de uma vez.
*   **Perfil Detalhado:** Clique em um nome para ver o histórico completo, alterar senha do ponto ou editar dados.
*   **Desligamento:** Processo de demissão que altera o status para "Desligado" e arquiva o histórico.
*   **Holerite:** Gere o recibo de pagamento em PDF com base nos dados financeiros cadastrados, incluindo chave PIX.

---

## 3. Recrutamento e Seleção

Gerencie seus processos seletivos em um quadro visual (Kanban).

*   **Vagas:** Crie e publique novas oportunidades de emprego.
*   **Candidatos:** Cadastre candidatos e vincule-os às vagas.
*   **Fluxo:** Arraste os candidatos entre as colunas: *Inscrito* → *Triagem* → *Entrevista* → *Aprovado*.

---

## 4. Férias e Ausências

Controle o calendário de folgas da equipe.

*   **Solicitações:** Visualize pedidos de férias pendentes.
*   **Aprovação:** Aprove ou rejeite solicitações com um clique. O sistema atualiza automaticamente o status do funcionário durante o período.
*   **Calendário:** Visão mensal de quem estará ausente.

---

## 5. Ponto Eletrônico

O sistema possui dois modos de controle de ponto:

1.  **Terminal de Ponto (Para o Funcionário):** Uma interface simplificada onde o colaborador seleciona seu nome e digita sua senha (PIN) para registrar entrada ou saída.
2.  **Relatório de Ponto (Para o RH):** O gestor visualiza o espelho de ponto, com horários de entrada e saída, localização no mapa e cálculo de saldo de horas.

---

## 6. Avaliação de Desempenho

Realize ciclos de avaliação periódicos.
*   Defina metas e competências.
*   Registre feedbacks e notas para cada colaborador.
*   Acompanhe a evolução profissional da equipe.

---

## 7. Comunicação Interna

Mantenha a empresa informada através do **Mural de Avisos**.
*   Crie comunicados com níveis de prioridade (Alta, Média, Baixa).
*   Todos os usuários visualizam os avisos recentes no painel principal.

---

## 8. Ouvidoria e Sugestões

Gerencie o feedback recebido de clientes ou colaboradores externos.

*   **Acesso Público:** O sistema gera uma página externa onde qualquer pessoa pode enviar sugestões.
*   **QR Code:** No menu de Ouvidoria, clique em "Gerar QR Code" para imprimir um cartaz de divulgação.
*   **Gestão:** O RH visualiza as mensagens recebidas, podendo marcá-las como lidas ou arquivadas.

---

## 9. 🤖 Manual do Assistente IA

O **Assistente Virtual** é uma ferramenta poderosa para agilizar tarefas repetitivas. Você pode conversar com ele naturalmente ou usar comandos numéricos.

### 🚀 Como acessar
Clique no menu **"Assistente IA"** na barra lateral.

### 📋 O que ele pode fazer?

Abaixo estão os principais comandos que o assistente entende. Você não precisa digitar exatamente igual aos exemplos, ele entende variações!

#### 1. Consultas Rápidas

| O que você quer saber? | O que digitar (Exemplos) |
| :--- | :--- |
| **Contagem de Pessoal** | "Quantos funcionários temos?" <br> "Qual o total de colaboradores?" |
| **Listar Funcionários** | "Listar todos os colaboradores" <br> "Quem trabalha no setor de Tecnologia?" <br> "Ver funcionários do RH" |
| **Buscar Alguém** | "Buscar Mariana" <br> "Quem é João Silva?" <br> "Encontrar o funcionário Pedro" |

#### 2. Gestão de Férias

O assistente pode agendar e cancelar férias diretamente no sistema.

| Ação | O que digitar (Exemplos) |
| :--- | :--- |
| **Ver quem está fora** | "Quem está de férias?" <br> "Ver solicitações de férias" |
| **Dar Férias** | "Dar férias para **Marcos Guilherme** de **01/12** a **15/12**" <br> "Agendar férias para **Ana** a partir de **10/11** até **20/11**" |
| **Cancelar/Voltar** | "Encerrar férias de **Marcos**" <br> "Tirar férias de **Ana**" <br> *(Isso traz o funcionário de volta ao status 'Ativo')* |

#### 3. Recrutamento e Vagas

| Ação | O que digitar (Exemplos) |
| :--- | :--- |
| **Ver Vagas** | "Quais são as vagas abertas?" <br> "Tem vaga para Desenvolvedor?" |
| **Criar Nova Vaga** | "Abrir vaga de **Analista Financeiro** no departamento **Financeiro**" <br> "Criar vaga para **Recepcionista**" |

#### 4. Comunicação Interna

Publique avisos no mural da empresa instantaneamente.

| Ação | O que digitar (Exemplos) |
| :--- | :--- |
| **Publicar Aviso** | "Criar aviso: **Reunião Geral amanhã às 14h**" <br> "Novo aviso: **O escritório fechará no feriado**" |

#### 5. Admissão e Desligamento

| Ação | O que digitar (Exemplos) |
| :--- | :--- |
| **Cadastrar (Individual)** | "Cadastre o funcionário **Lucas Pereira**, cargo **Designer**, no departamento **Marketing**" |
| **Cadastrar (Em Massa)** | "massa: **Nome1, Cargo1, Dept1; Nome2, Cargo2, Dept2**" <br> *(Útil para importar listas rápidas)* |
| **Desligar** | "Demitir **Carlos Souza**" <br> "Desligar funcionário **Roberto**" |

#### 💡 Dicas para o Chat
*   **Datas:** Ao agendar férias, use o formato `DD/MM` ou `DD/MM/AAAA`.
*   **Nomes:** Tente escrever o nome completo ou o primeiro nome corretamente.
*   **Menu:** Se estiver perdido, digite **"Ajuda"** ou **"Menu"** para ver as opções numéricas.

---

## 10. ⚙️ Automações (Scripts Python)

O módulo de **Automações** permite gerar scripts em Python para executar tarefas repetitivas fora do sistema.

### Funcionalidades:
*   **Templates Prontos:** Modelos pré-configurados para tarefas comuns (ex: E-mails de Aniversário, Relatório de Ponto, Setup de Onboarding).
*   **Criar com IA:** Descreva uma tarefa personalizada e a Inteligência Artificial escreverá o código para você.
*   **Biblioteca:** Salve seus scripts gerados para uso futuro.

### Como usar:
1.  Acesse o menu **Automações**.
2.  Escolha um template ou use a aba **"Criar com IA"**.
3.  Preencha os parâmetros ou descreva a tarefa.
4.  Clique em **Gerar Script**.
5.  Copie o código ou faça o download do arquivo `.py` para executar em sua máquina.

---

## 11. Configurações

No menu **Configurações**, você pode personalizar o sistema:

*   **Perfil:** Altere sua foto de avatar e nome de exibição (ex: `[DEV] Marcos Guilherme` para `Admin RH`).
*   **Empresa:** Atualize Razão Social e CNPJ para relatórios.
*   **Notificações:** Ative ou desative alertas por e-mail.
*   **Aparência:** (Em breve) Controle total sobre o tema Claro/Escuro.

---

### ❓ Suporte

Caso encontre algum erro ou tenha dúvidas não cobertas por este manual, entre em contato com o suporte técnico ou consulte o arquivo `README.md` para detalhes técnicos de instalação.

---
*Documento gerado automaticamente em 27/01/2026.*