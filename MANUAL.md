# 📘 Documentação Oficial do Usuário - Plataforma GestãoRH

Bem-vindo à documentação oficial do **GestãoRH**, a plataforma corporativa completa para administração de Capital Humano (HCM). Este documento foi elaborado para servir como o guia definitivo de operação do sistema, detalhando fluxos de trabalho, regras de negócio e funcionalidades técnicas. 

Projetado com foco em eficiência operacional, conformidade legal (LGPD) e experiência do usuário, o GestãoRH centraliza todas as rotinas do departamento pessoal e estratégico em um único ambiente seguro.

---

## 📑 Índice

1.  [Visão Executiva e Dashboard](#1-visão-executiva-e-dashboard)
2.  [Gestão de Colaboradores (Dossiê Digital)](#2-gestão-de-colaboradores-dossiê-digital)
3.  [Folha de Pagamento e Holerites Digitais](#3-folha-de-pagamento-e-holerites-digitais)
4.  [Controle de Frequência e Ponto Eletrônico](#4-controle-de-frequência-e-ponto-eletrônico)
5.  [Férias e Afastamentos](#5-férias-e-afastamentos)
6.  [Recrutamento e Seleção (ATS)](#6-recrutamento-e-seleção-ats)
7.  [Avaliação de Desempenho](#7-avaliação-de-desempenho)
8.  [Comunicação Interna e Ouvidoria](#8-comunicação-interna-e-ouvidoria)
9.  [🤖 Assistente Virtual de IA](#9-assistente-virtual-de-ia)
10. [⚙️ Automações de Rotina](#10-automações-de-rotina)
11. [🛡️ Segurança, Auditoria e LGPD](#11-segurança-auditoria-e-lgpd)
12. [Configurações do Sistema](#12-configurações-do-sistema)

---

## 1. Visão Executiva e Dashboard

O **Dashboard** atua como a central de comando do departamento de RH, fornecendo indicadores-chave de desempenho (KPIs) em tempo real para embasar tomadas de decisão estratégicas.

### Indicadores Disponíveis:
- **Métricas de Headcount:** Contagem em tempo real de colaboradores ativos, total de registros, colaboradores em período de férias e profissionais afastados.
- **Análise de Turnover:** Monitoramento do índice de rotatividade de pessoal, permitindo identificar tendências de retenção.
- **Distribuição Demográfica:** Gráficos interativos ilustrando a alocação de custos e de pessoal por departamento.
- **Alertas Operacionais:** Painel de notificações destacando pendências críticas, como férias a vencer nos próximos 30 dias e aniversariantes do mês.

---

## 2. Gestão de Colaboradores (Dossiê Digital)

O módulo de gestão unifica todas as informações cadastrais, contratuais e financeiras do quadro de funcionários, substituindo pastas físicas por um **Dossiê Digital** altamente seguro.

### 2.1. Cadastro e Integração (Onboarding)
- **Cadastro Individual:** Formulário segmentado em Dados Pessoais, Contratuais e Financeiros. Permite o registro de informações como CPF, PIS/PASEP, Cargo, Departamento, Unidade e Dados Bancários (Chave PIX).
- **Importação em Massa:** Ferramenta para upload de planilhas (`.xlsx` ou `.csv`). O sistema valida automaticamente os cabeçalhos e processa dezenas de cadastros simultaneamente, ideal para migração de sistemas legados.

### 2.2. Gestão Eletrônica de Documentos (GED)
Dentro do perfil de cada colaborador, a aba **Documentos** permite o arquivamento seguro em nuvem de arquivos digitalizados.
- Suporta envio de contratos, exames admissionais/demissionais, CNH e atestados.
- Os arquivos são armazenados em *Buckets* protegidos no banco de dados, garantindo que apenas usuários autenticados com permissão de RH possam acessá-los.

### 2.3. Movimentação e Desligamento
- **Alteração de Status:** Transições de status (Ex: *Ativo* para *Afastado* ou *Desligado*) mantêm o histórico intacto no banco de dados.
- **Gestão de Acessos:** Geração e redefinição segura de Senhas (PIN) individuais que o colaborador utilizará estritamente para o registro no Terminal de Ponto.

---

## 3. Folha de Pagamento e Holerites Digitais

O GestãoRH automatiza etapas críticas do fechamento financeiro, reduzindo erros de cálculo e o tempo gasto na distribuição de contracheques.

### 3.1. Configuração Financeira do Colaborador
O sistema suporta regras complexas de remuneração:
- **Proventos Fixos:** Salário Base, Adicional de Insalubridade, Adicional Noturno e Salário Família.
- **Proventos e Descontos Variáveis:** Inserção de rubricas personalizadas mensais (Ex: Bonificações por Meta, Desconto de Farmácia, Adiantamentos).
- **Cálculo Tributário Automático:** O sistema utiliza tabelas dinâmicas configuráveis de impostos (INSS e IRRF) para estimar os descontos legais aplicáveis sobre as bases de cálculo corretas.

### 3.2. Emissão e Assinatura Eletrônica de Holerites
O sistema elimina a necessidade de impressão de contracheques através de um fluxo digital auditável:
1. **Geração e Disparo:** O RH gera o Holerite em formato PDF, que é automaticamente enviado para o e-mail pessoal do colaborador cadastrado.
2. **Assinatura Digital (Touch/Mouse):** O colaborador recebe um link seguro, visualiza o documento e realiza a assinatura diretamente na tela do dispositivo (computador, tablet ou smartphone).
3. **Autenticação e Carimbo de Tempo:** Ao assinar, o sistema captura o endereço IP, o dispositivo utilizado (User Agent) e a data/hora exata.
4. **Comprovante Criptográfico:** Um hash único é gerado e impresso no rodapé do novo PDF corporativo, servindo como comprovação legal de recebimento do documento.

### 3.3. Integração Bancária e Contábil
- Exportação de arquivos padronizados (CNAB 240 ou CSV estruturado) para integração direta com sistemas de contabilidade terceirizados ou para processamento de pagamentos em lote junto a instituições financeiras.

---

## 4. Controle de Frequência e Ponto Eletrônico

Uma solução moderna de registro de jornada que dispensa relógios de ponto físicos tradicionais (REP), substituindo-os por interfaces baseadas em nuvem com validação de localidade.

### 4.1. Terminal do Colaborador (Modo Quiosque / PWA)
- **Registro Rápido:** O colaborador acessa o terminal público da empresa, localiza seu nome ou digita sua matrícula, insere seu PIN criptografado e registra o evento (Entrada, Início Almoço, Fim Almoço, Saída).
- **Geolocalização (GPS):** Se configurado, o sistema captura a latitude e longitude exatas no momento da batida do ponto, permitindo auditar o local de trabalho (ideal para equipes externas ou home office).

### 4.2. Gestão de Frequência (Visão RH)
- **Espelho de Ponto:** Painel gerencial que consolida todas as marcações.
- **Mapa Interativo:** O RH pode visualizar em um mapa geográfico a procedência de cada batida de ponto registrada pelos colaboradores.
- **Saldo de Horas:** Cálculo automatizado das horas trabalhadas frente à carga horária contratada (Ex: 09:00 - 18:00), identificando ausências, atrasos ou horas extras a serem tratadas.

---

## 5. Férias e Afastamentos

Módulo dedicado à programação e compliance do cronograma de descanso anual, garantindo que a empresa não incorra em multas por vencimento de períodos aquisitivos.

- **Painel de Solicitações:** Centraliza pedidos de férias ou submissão de atestados médicos. O sistema permite anexar o arquivo do atestado médico diretamente na solicitação.
- **Fluxo de Aprovação:** O gestor analisa, aprova ou rejeita a solicitação.
- **Automação de Status:** Ao aprovar um período (Ex: 10/11 a 20/11), o sistema assume a responsabilidade de alterar o status do colaborador para "Férias" na data de início e retorná-lo para "Ativo" no término, sem necessidade de intervenção manual.
- **Visão Global:** Calendário interativo para visualização de conflitos de escala (garantindo que departamentos não fiquem desguarnecidos).

---

## 6. Recrutamento e Seleção (ATS)

O GestãoRH conta com um *Applicant Tracking System* (ATS) integrado, simplificando a aquisição de novos talentos.

### Funcionalidades:
- **Gestão de Vagas:** Criação de descritivos de cargos, requisitos e publicação do status da vaga (Aberta, Em Andamento, Fechada).
- **Banco de Talentos:** Repositório seguro para cadastro de candidatos, dados de contato e upload de currículos em PDF.
- **Pipeline Visual (Kanban):** Gestão fluida do processo seletivo. O recrutador pode movimentar os candidatos arrastando-os entre as etapas personalizáveis:
  1. *Inscrito*
  2. *Triagem*
  3. *Entrevista*
  4. *Aprovado* / *Reprovado*

---

## 7. Avaliação de Desempenho

Módulo voltado para o desenvolvimento contínuo e acompanhamento da performance do quadro funcional.
- **Ciclos de Avaliação:** Permite a abertura de períodos de avaliação formal, onde líderes podem documentar o desempenho de seus liderados.
- **Metricas Estruturadas:** Registro de notas globais, atingimento de metas pactuadas e desenvolvimento de competências comportamentais/técnicas (Hard Skills e Soft Skills).
- **Feedback Oficial:** Arquivamento do histórico de feedbacks para fundamentar futuras promoções ou planos de recuperação de performance.

---

## 8. Comunicação Interna e Ouvidoria

O engajamento e a transparência são fomentados por meio de canais oficiais e seguros integrados à plataforma.

### 8.1. Mural Digital Corporativo
- Ferramenta de *Broadcast* para disparo de comunicados organizacionais.
- Classificação visual por prioridade (Informativo, Importante, Urgente), garantindo que todos os usuários logados sejam imediatamente notificados no dashboard.

### 8.2. Canal de Ouvidoria (Canal de Denúncias/Sugestões)
- **Interface Pública:** Um portal web independente para recebimento de manifestações anônimas ou identificadas (exigência de compliance e políticas de boa governança).
- **QR Code:** Geração automática de material visual (QR Code) para impressão e fixação nas dependências da empresa, facilitando o acesso via smartphones.
- **Gestão de Tickets:** Painel interno restrito ao RH para triagem, investigação e arquivamento das manifestações recebidas.

---

## 9. 🤖 Assistente Virtual de IA

O GestãoRH é pioneiro na utilização de Processamento de Linguagem Natural (NLP) para facilitar a operação diária do RH. O Assistente Virtual traduz ordens descritas em português comum para ações complexas no banco de dados.

### 🚀 Como acessar
Localizado no menu lateral sob a rubrica **"Assistente IA"**.

### 📋 O que ele pode fazer?
O algoritmo de reconhecimento de intenção compreende linguagem fluida e variações semânticas. Abaixo estão as categorias de operações suportadas:

#### 1. Consultas Rápidas
| O que você quer saber? | O que digitar (Exemplos) |
| :--- | :--- |
| **Métricas / Headcount** | "Quantos funcionários temos?" <br> "Qual o total de colaboradores ativos?" |
| **Filtros Departamentais** | "Listar todos do setor de Tecnologia" <br> "Quem trabalha no Financeiro?" |
| **Busca Específica** | "Buscar a ficha da Mariana" <br> "Encontrar o funcionário Pedro Silva" |

| Ação | O que digitar (Exemplos) |
| :--- | :--- |
| **Ver quem está fora** | "Quem está de férias hoje?" <br> "Ver solicitações de ausência" |
| **Agendar Férias** | "Dar férias para **Marcos Guilherme** de **01/12** a **15/12**" <br> "Agendar férias para **Ana** a partir de **10/11** até **20/11**" |
| **Revogar Férias** | "Encerrar as férias do **Marcos**" <br> *(Retorna imediatamente o status para 'Ativo')* |

#### 3. Recrutamento e Vagas
| Ação | O que digitar (Exemplos) |
| :--- | :--- |
| **Monitorar Vagas** | "Quais são as vagas abertas no momento?" <br> "Tem vaga para Desenvolvedor?" |
| **Abertura de Requisição** | "Abrir vaga de **Analista Financeiro** no departamento **Financeiro**" |

#### 4. Comunicação Interna
| Ação | O que digitar (Exemplos) |
| :--- | :--- |
| **Disparo de Comunicado** | "Criar aviso: **Reunião Geral amanhã às 14h**" <br> "Novo aviso: **Feriado na próxima semana**" |

#### 5. Movimentação de Pessoal
| Ação | O que digitar (Exemplos) |
| :--- | :--- |
| **Admissão Expressa** | "Cadastre o funcionário **Lucas Pereira**, cargo **Designer**, no departamento **Marketing**" |
| **Cadastrar (Em Massa)** | "massa: **Nome1, Cargo1, Dept1; Nome2, Cargo2, Dept2**" <br> *(Útil para importar listas rápidas)* |
| **Desligamento Automático** | "Demitir **Carlos Souza**" <br> "Desligar o funcionário **Roberto** do sistema" |

> **💡 Melhores Práticas de Interação:**
> - **Precisão Temporal:** Ao referenciar datas, utilize o formato explícito `DD/MM` ou `DD/MM/AAAA`.
> - **Ambiguidade de Nomes:** Em caso de homônimos, forneça o nome completo e o cargo para evitar ações no cadastro incorreto.
> - **Navegação Guiada:** Caso não deseje usar linguagem livre, digite **"Ajuda"** ou **"Menu"** para acessar o modo de botões guiados numericamente.

---

## 10. ⚙️ Automações de Rotina

O ecossistema GestãoRH conta com um motor de automação que estende as capacidades do sistema para além de sua interface, permitindo a geração de rotinas personalizadas via scripts.

### Capacidades:
- **Templates de Processos:** Modelos pré-validados para tarefas padronizadas, tais como:
  - Disparo em lote de e-mails de feliz aniversário.
  - Extração profunda e sanitização de dados de ponto.
  - Setup automatizado de contas de TI no processo de Onboarding.
- **Desenvolvimento Assistido por IA:** O analista descreve a automação necessária (Ex: *"Preciso de uma rotina que alerte se houver funcionários com mais de 30 horas extras"*), e a IA interna escreve o código Python completo da automação.
- **Gestão de Acervo:** Salve e cataloge todas as automações operacionais no banco de dados da empresa para reaproveitamento futuro pela equipe de RH ou TI.

---

## 11. 🛡️ Segurança, Auditoria e LGPD

A segurança da informação e a privacidade dos dados corporativos são premissas fundamentais da arquitetura do GestãoRH.

### 11.1. Trilha de Auditoria Universal (Audit Logs)
Garantindo total compliance e rastreabilidade, o banco de dados monitora e arquiva um registro imutável de **qualquer alteração sistêmica**.
- **O que é monitorado:** Modificações salariais, alterações de cadastros, exclusões e demissões.
- **Como funciona:** O painel de Auditoria exibe exatamente *Quem* fez a alteração, *Quando* ocorreu, e qual foi a mudança estrutural (apresentando um *Diff* claro mostrando o dado antigo e o novo dado inserido).

### 11.2. Proteção de Dados Financeiros e RLS
- **Row Level Security (RLS):** O banco de dados bloqueia requisições não autorizadas no nível da infraestrutura. Apenas usuários logados e com credenciais de administração têm autorização matemática de leitura nas tabelas.
- **Views Seguras:** Dados sensíveis (como `base_salary` e descontos) são isolados da API pública do sistema. Interfaces não-administrativas (como as telas que o colaborador acessa no terminal de ponto) consomem apenas metadados esterilizados (Ex: Nome, Setor, Foto), garantindo que vazamentos de informações por engenharia reversa sejam impossíveis.

### 11.3. Controles de Acesso
- **Sessões via JWT:** A plataforma utiliza tokens de curta duração.
- **Prevenção de Ataques:** Proteções contra força-bruta (Rate Limiting no login) e bloqueio contra auto-exclusão acidental por parte do Administrador do sistema.

---

## 12. Configurações do Sistema

O módulo de **Configurações** destina-se ao Administrador Institucional para gerenciamento das variáveis globais da aplicação:

- **Perfil Pessoal:** Gerenciamento da identidade do administrador operando o sistema (Foto de perfil, Nome de exibição).
- **Dados Institucionais (White-label):** Atualização da Razão Social, CNPJ oficial, Endereço e Contatos. Essas informações são consumidas em tempo real pelo gerador de PDFs (Holerites, Relatórios e Dossiês).
- **Preferências Operacionais:** Gestão da ativação ou desativação de notificações do sistema por e-mail.
- **Personalização de Tema:** Escolha da preferência de interface (Claro / Escuro / Automático pelo Sistema Operacional).

---

### ❓ Suporte

Para questões técnicas, instabilidade sistêmica, ou dúvidas operacionais não mitigadas por esta documentação, favor abrir um chamado junto ao departamento de Tecnologia (TI) responsável pela infraestrutura ou contatar o suporte através de **suporte@gestaorh.com**.