## 🎯 Sprint Atual (Novas Funcionalidades)

*(Aguardando novas tarefas)*

---

## ✅ Sprint Anterior (Concluída)

###  Gestão de Documentos (Digitalização)
- [x] **Módulo de Arquivos no Perfil:**
  - [x] Criar aba "Documentos" na edição do colaborador.
  - [x] Implementar Upload para o Supabase Storage (Bucket `documents`).
  - [x] Listagem e Download de arquivos (CNH, Contrato, Atestados).
  - [x] Permissão de exclusão (apenas Admin/RH).

### 📊 Dashboard Gerencial (Analytics)
- [x] **Gráficos e Indicadores:**
  - [x] Gráfico de Pizza: Distribuição de Custo de Folha por Departamento.
  - [x] Gráfico de Barras: Total de Horas Extras por Mês.
  - [x] Card de KPI: Taxa de Rotatividade (Turnover).

### 💰 Financeiro e Folha
- [x] **Dados Financeiros no Cadastro (Edição de Colaborador):**
  - [x] Campos de Valores: Salário Família, Hora Extra, Férias, 1/3 de Férias.
  - [x] Insalubridade e Adicional Noturno: Opção Sim/Não + Campo para digitar o valor monetário.
  - [x] Descontos Variáveis: Lista dinâmica (Descrição e Valor) para descontos avulsos.
  - [x] Adicionais Variáveis: Lista dinâmica para Gratificações e Bônus.
  - [x] Cálculo de Impostos: Implementação da Tabela Progressiva INSS 2026.
- [x] **Lógica de Fechamento Mensal:**
  - [x] Botão/Ação para "Fechar Mês" (Exportar dados e zerar variáveis, mantendo salário base).
  - [x] Alerta no último dia do mês para exportação.
- [x] **Relatório de Folha:**
  - [x] Listar colunas detalhadas (Base, Adicionais, Descontos, Líquido).
  - [x] Incluir Chave PIX no relatório.
  - [x] Exportação para Excel/Planilha.

### 🗣️ Ouvidoria e Sugestões
- [x] **Banco de Dados:** Criar tabela de sugestões.
 - [x] **Página Pública:** Formulário acessível via QR Code (sem login) para clientes enviarem sugestões.
 - [x] **Painel Interno:** Aba no sistema para o RH visualizar as sugestões recebidas.
- [x] **Gerador de QR Code:** Funcionalidade para imprimir o QR Code da página de sugestões.

### 🕒 Ponto e Relatórios
- [x] **Relatório de Ponto Mensal:** Exportação com cálculo de horas trabalhadas vs contratadas (Saldo de horas).
- [x] **Geolocalização:** Registro de latitude/longitude no ponto.
- [x] **Tema Escuro:** Implementação de Dark Mode.
