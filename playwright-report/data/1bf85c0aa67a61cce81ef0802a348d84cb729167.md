# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: employees.spec.ts >> Fluxos de Colaboradores >> cadastrar novo colaborador com sucesso
- Location: tests\e2e\employees.spec.ts:14:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.fill: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByLabel(/e-mail/i)

```

# Page snapshot

```yaml
- generic:
  - generic:
    - list
    - region "Notifications alt+T"
    - generic:
      - generic:
        - generic:
          - generic:
            - generic:
              - generic:
                - img
                - generic:
                  - generic: TechCorp Brasil
                  - generic: Gestão de Pessoas
            - generic:
              - list:
                - listitem:
                  - link:
                    - /url: /
                    - img
                    - generic: Dashboard
                - listitem:
                  - link:
                    - /url: /employees
                    - img
                    - generic: Colaboradores
                - listitem:
                  - link:
                    - /url: /payroll
                    - img
                    - generic: Salários e Pagamentos
                - listitem:
                  - link:
                    - /url: /recruitment
                    - img
                    - generic: Recrutamento
                - listitem:
                  - link:
                    - /url: /performance
                    - img
                    - generic: Avaliações
                - listitem:
                  - link:
                    - /url: /absences
                    - img
                    - generic: Férias & Ausências
                - listitem:
                  - link:
                    - /url: /timesheet
                    - img
                    - generic: Controle de Ponto
                - listitem:
                  - link:
                    - /url: /tickets
                    - img
                    - generic: Chamados
                - listitem:
                  - link:
                    - /url: /reports
                    - img
                    - generic: Relatórios
                - listitem:
                  - link:
                    - /url: /communication
                    - img
                    - generic: Comunicação
                - listitem:
                  - link:
                    - /url: /suggestions
                    - img
                    - generic: Ouvidoria
                - listitem:
                  - link:
                    - /url: /ai-assistant
                    - img
                    - generic: Assistente IA
                - listitem:
                  - link:
                    - /url: /automations
                    - img
                    - generic: Automações
                - listitem:
                  - link:
                    - /url: /audit-logs
                    - img
                    - generic: Auditoria
                - listitem:
                  - link:
                    - /url: /settings
                    - img
                    - generic: Configurações
            - generic:
              - button:
                - generic:
                  - img
                - generic:
                  - generic: Administrador Demo
                  - generic: Gerente de RH
                - img
          - button
        - main:
          - generic:
            - generic:
              - button:
                - img
                - generic: Toggle Sidebar
              - generic:
                - heading [level=1]: Colaboradores
                - paragraph: Gerencie todos os colaboradores da empresa
            - generic:
              - generic:
                - img
                - textbox:
                  - /placeholder: Buscar...
              - button:
                - img
                - generic: "3"
          - main:
            - generic:
              - generic:
                - generic:
                  - generic:
                    - generic:
                      - generic:
                        - img
                      - generic:
                        - paragraph: "5"
                        - paragraph: Total
                  - generic:
                    - generic:
                      - generic:
                        - img
                      - generic:
                        - paragraph: "4"
                        - paragraph: Ativos
                  - generic:
                    - generic:
                      - generic:
                        - img
                      - generic:
                        - paragraph: "1"
                        - paragraph: Férias
                  - generic:
                    - generic:
                      - generic:
                        - img
                      - generic:
                        - paragraph: "0"
                        - paragraph: Afastados
                  - generic:
                    - generic:
                      - generic:
                        - img
                      - generic:
                        - paragraph: "0"
                        - paragraph: Desligados
                - generic:
                  - button:
                    - img
                    - text: Gerar Crachá
                  - button:
                    - img
                    - text: Gerar Link de Avaliação
                - generic:
                  - generic:
                    - generic:
                      - img
                      - textbox:
                        - /placeholder: Buscar por nome, email ou cargo...
                    - combobox:
                      - generic: Todos
                      - img
                    - combobox:
                      - generic: Todos
                      - img
                  - generic:
                    - button:
                      - img
                      - text: Baixar Modelo
                    - generic:
                      - button
                      - button:
                        - img
                        - text: Importar
                    - button:
                      - img
                      - text: Novo Colaborador
                - generic:
                  - generic:
                    - table:
                      - rowgroup:
                        - row:
                          - columnheader: Colaborador
                          - columnheader: Cargo
                          - columnheader: Departamento
                          - columnheader: Contrato
                          - columnheader: Status
                          - columnheader: Ações
                      - rowgroup:
                        - row:
                          - cell:
                            - generic:
                              - generic:
                                - generic: AD
                              - generic:
                                - paragraph: Ana do Marketing
                                - paragraph: ana.mkt@empresa.com
                          - cell: Coordenadora de Marketing
                          - cell: Marketing
                          - cell: CLT
                          - cell:
                            - generic: Ativo
                          - cell:
                            - button:
                              - img
                        - row:
                          - cell:
                            - generic:
                              - generic:
                                - generic: CD
                              - generic:
                                - paragraph: Carlos Desenvolvedor
                                - paragraph: carlos.dev@empresa.com
                          - cell: Engenheiro de Software Sênior
                          - cell: TI
                          - cell: CLT
                          - cell:
                            - generic: Ativo
                          - cell:
                            - button:
                              - img
                        - row:
                          - cell:
                            - generic:
                              - generic:
                                - generic: FR
                              - generic:
                                - paragraph: Fernanda RH
                                - paragraph: fernanda.rh@empresa.com
                          - cell: Analista de RH Sênior
                          - cell: Recursos Humanos
                          - cell: CLT
                          - cell:
                            - generic: Ativo
                          - cell:
                            - button:
                              - img
                        - row:
                          - cell:
                            - generic:
                              - generic:
                                - generic: JD
                              - generic:
                                - paragraph: João do Financeiro
                                - paragraph: joao.fin@empresa.com
                          - cell: Analista Financeiro Pleno
                          - cell: Financeiro
                          - cell: CLT
                          - cell:
                            - generic: Ativo
                          - cell:
                            - button:
                              - img
                        - row:
                          - cell:
                            - generic:
                              - generic:
                                - generic: RO
                              - generic:
                                - paragraph: Ricardo Operações
                                - paragraph: ricardo.ops@empresa.com
                          - cell: Supervisor de Operações
                          - cell: Operações
                          - cell: CLT
                          - cell:
                            - generic: Férias
                          - cell:
                            - button:
                              - img
  - dialog "Novo Colaborador" [ref=e2]:
    - generic [ref=e3]:
      - heading "Novo Colaborador" [level=2] [ref=e4]
      - paragraph [ref=e5]: Insira as informações para cadastrar um novo colaborador.
    - generic [ref=e6]:
      - generic [ref=e7]:
        - generic [ref=e8]:
          - text: Nome completo
          - textbox "Nome completo" [active] [ref=e9]: Maria Silva
        - generic [ref=e10]:
          - text: Email
          - textbox "Email" [ref=e11]
        - generic [ref=e12]:
          - text: Telefone
          - textbox "Telefone" [ref=e13]
        - generic [ref=e14]:
          - text: Cargo
          - textbox "Cargo" [ref=e15]
        - generic [ref=e16]:
          - text: Departamento
          - combobox [ref=e17] [cursor=pointer]:
            - generic: Selecione
            - img [ref=e18]
          - combobox [ref=e20]
        - generic [ref=e21]:
          - text: Tipo de Contrato
          - combobox [ref=e22] [cursor=pointer]:
            - generic: CLT
            - img [ref=e23]
          - combobox [ref=e25]
        - generic [ref=e26]:
          - text: Status
          - combobox [ref=e27] [cursor=pointer]:
            - generic: Ativo
            - img [ref=e28]
          - combobox [ref=e30]
        - generic [ref=e31]:
          - text: Senha do Ponto (PIN)
          - generic [ref=e32]:
            - img [ref=e33]
            - textbox "Senha do Ponto (PIN)" [ref=e36]:
              - /placeholder: PIN de 4 a 6 dígitos
        - generic [ref=e37]:
          - text: Data de Admissão
          - textbox "Data de Admissão" [ref=e38]
        - generic [ref=e39]:
          - text: Data de Nascimento
          - textbox "Data de Nascimento" [ref=e40]
        - heading "Dados Financeiros & Folha" [level=4] [ref=e42]
        - generic [ref=e43]:
          - text: Salário Base (R$)
          - spinbutton "Salário Base (R$)" [ref=e44]: "0"
        - generic [ref=e45]:
          - text: Descontos Fixos (R$)
          - spinbutton "Descontos Fixos (R$)" [ref=e46]: "0"
        - generic [ref=e47]:
          - text: INSS Manual (R$)
          - spinbutton "INSS Manual (R$)" [ref=e48]
          - paragraph [ref=e49]: Se preenchido, substitui o cálculo automático.
        - generic [ref=e50]:
          - generic [ref=e51]:
            - heading "Adicionais / Gratificações" [level=4] [ref=e52]
            - button "Adicionar" [ref=e53] [cursor=pointer]:
              - img
              - text: Adicionar
          - paragraph [ref=e54]: Nenhum adicional lançado.
        - generic [ref=e55]:
          - generic [ref=e56]:
            - heading "Descontos Variáveis / Eventuais" [level=4] [ref=e57]
            - button "Adicionar" [ref=e58] [cursor=pointer]:
              - img
              - text: Adicionar
          - paragraph [ref=e59]: Nenhum desconto variável adicionado.
        - generic [ref=e60]:
          - text: Carga Horária Mensal
          - spinbutton "Carga Horária Mensal" [ref=e61]: "220"
        - generic [ref=e62]:
          - text: Insalubridade
          - combobox [ref=e63] [cursor=pointer]:
            - generic: Não
            - img [ref=e64]
          - combobox [ref=e66]
        - generic [ref=e67]:
          - text: Adicional Noturno
          - combobox [ref=e68] [cursor=pointer]:
            - generic: Não
            - img [ref=e69]
          - combobox [ref=e71]
        - heading "Documentação & Prazos" [level=4] [ref=e73]
        - generic [ref=e74]:
          - text: PIS/PASEP
          - textbox "PIS/PASEP" [ref=e75]:
            - /placeholder: 000.00000.00-0
        - generic [ref=e76]:
          - text: Chave PIX
          - textbox "Chave PIX" [ref=e77]:
            - /placeholder: CPF, Email ou Aleatória
        - generic [ref=e78]:
          - text: Vencimento Férias
          - textbox "Vencimento Férias" [ref=e79]
        - generic [ref=e80]:
          - text: Limite para Gozo
          - textbox "Limite para Gozo" [ref=e81]
        - generic [ref=e82]:
          - heading "Documentação Anexada" [level=3] [ref=e83]
          - paragraph [ref=e84]: Salve o colaborador recém-criado primeiro para poder anexar documentos a ele.
      - generic [ref=e85]:
        - button "Cancelar" [ref=e86] [cursor=pointer]
        - button "Cadastrar Colaborador" [ref=e87] [cursor=pointer]
    - button "Close" [ref=e88] [cursor=pointer]:
      - img [ref=e89]
      - generic [ref=e92]: Close
```

# Test source

```ts
  1  | import { expect, test } from '@playwright/test';
  2  | 
  3  | test.describe('Fluxos de Colaboradores', () => {
  4  |   test.beforeEach(async ({ page }) => {
  5  |     await page.route('**/rest/v1/**', async (route) => {
  6  |       await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
  7  |     });
  8  | 
  9  |     await page.addInitScript(() => {
  10 |       window.localStorage.setItem('mock_logged_in', 'true');
  11 |     });
  12 |   });
  13 | 
  14 |   test('cadastrar novo colaborador com sucesso', async ({ page }) => {
  15 |     await page.goto('/employees', { waitUntil: 'domcontentloaded' });
  16 | 
  17 |     await page.getByRole('button', { name: /novo colaborador/i }).click();
  18 | 
  19 |     await page.getByLabel(/nome completo/i).fill('Maria Silva');
> 20 |     await page.getByLabel(/e-mail/i).fill('maria@teste.com');
     |                                      ^ Error: locator.fill: Test timeout of 30000ms exceeded.
  21 |     await page.getByLabel(/cargo/i).fill('Desenvolvedora');
  22 | 
  23 |     await page.getByRole('button', { name: /salvar colaborador/i }).click();
  24 | 
  25 |     await expect(page.getByText(/Colaborador criado/i).first()).toBeVisible();
  26 |   });
  27 | });
  28 | 
```