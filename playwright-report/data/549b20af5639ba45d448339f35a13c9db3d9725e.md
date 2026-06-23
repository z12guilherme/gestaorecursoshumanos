# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: login.spec.ts >> Fluxos de Login >> login com sucesso redireciona para o dashboard
- Location: tests\e2e\login.spec.ts:32:3

# Error details

```
Error: expect(page).toHaveURL(expected) failed

Expected pattern: /\/(dashboard)?$/
Received string:  "http://127.0.0.1:3000/manager-portal"
Timeout: 5000ms

Call log:
  - Expect "toHaveURL" with timeout 5000ms
    8 × unexpected value "http://127.0.0.1:3000/manager-portal"

```

# Page snapshot

```yaml
- generic [ref=e2]:
    - region "Notifications (F8)":
        - list
    - region "Notifications alt+T"
    - generic [ref=e4]:
        - generic [ref=e5]:
            - generic [ref=e6]:
                - generic [ref=e8]:
                    - img "Logo da empresa" [ref=e9]
                    - generic [ref=e10]:
                        - generic "TechCorp Brasil" [ref=e11]
                        - generic [ref=e12]: Gestão de Pessoas
                - list [ref=e14]:
                    - listitem [ref=e15]:
                        - link "Dashboard" [ref=e16] [cursor=pointer]:
                            - /url: /
                            - img [ref=e17]
                            - generic [ref=e22]: Dashboard
                    - listitem [ref=e23]:
                        - link "Colaboradores" [ref=e24] [cursor=pointer]:
                            - /url: /employees
                            - img [ref=e25]
                            - generic [ref=e30]: Colaboradores
                    - listitem [ref=e31]:
                        - link "Salários e Pagamentos" [ref=e32] [cursor=pointer]:
                            - /url: /payroll
                            - img [ref=e33]
                            - generic [ref=e36]: Salários e Pagamentos
                    - listitem [ref=e37]:
                        - link "Recrutamento" [ref=e38] [cursor=pointer]:
                            - /url: /recruitment
                            - img [ref=e39]
                            - generic [ref=e42]: Recrutamento
                    - listitem [ref=e43]:
                        - link "Avaliações" [ref=e44] [cursor=pointer]:
                            - /url: /performance
                            - img [ref=e45]
                            - generic [ref=e47]: Avaliações
                    - listitem [ref=e48]:
                        - link "Férias & Ausências" [ref=e49] [cursor=pointer]:
                            - /url: /absences
                            - img [ref=e50]
                            - generic [ref=e55]: Férias & Ausências
                    - listitem [ref=e56]:
                        - link "Controle de Ponto" [ref=e57] [cursor=pointer]:
                            - /url: /timesheet
                            - img [ref=e58]
                            - generic [ref=e61]: Controle de Ponto
                    - listitem [ref=e62]:
                        - link "Chamados" [ref=e63] [cursor=pointer]:
                            - /url: /tickets
                            - img [ref=e64]
                            - generic [ref=e71]: Chamados
                    - listitem [ref=e72]:
                        - link "Relatórios" [ref=e73] [cursor=pointer]:
                            - /url: /reports
                            - img [ref=e74]
                            - generic [ref=e80]: Relatórios
                    - listitem [ref=e81]:
                        - link "Comunicação" [ref=e82] [cursor=pointer]:
                            - /url: /communication
                            - img [ref=e83]
                            - generic [ref=e85]: Comunicação
                    - listitem [ref=e86]:
                        - link "Ouvidoria" [ref=e87] [cursor=pointer]:
                            - /url: /suggestions
                            - img [ref=e88]
                            - generic [ref=e90]: Ouvidoria
                    - listitem [ref=e91]:
                        - link "Assistente IA" [ref=e92] [cursor=pointer]:
                            - /url: /ai-assistant
                            - img [ref=e93]
                            - generic [ref=e100]: Assistente IA
                    - listitem [ref=e101]:
                        - link "Automações" [ref=e102] [cursor=pointer]:
                            - /url: /automations
                            - img [ref=e103]
                            - generic [ref=e107]: Automações
                    - listitem [ref=e108]:
                        - link "Auditoria" [ref=e109] [cursor=pointer]:
                            - /url: /audit-logs
                            - img [ref=e110]
                            - generic [ref=e114]: Auditoria
                    - listitem [ref=e115]:
                        - link "Configurações" [ref=e116] [cursor=pointer]:
                            - /url: /settings
                            - img [ref=e117]
                            - generic [ref=e120]: Configurações
                    - listitem [ref=e121]:
                        - link "Área de Gestores 1" [ref=e122] [cursor=pointer]:
                            - /url: /manager-portal
                            - img [ref=e123]
                            - generic [ref=e125]: Área de Gestores
                            - generic [ref=e126]: "1"
                - button "Administrador Demo Gerente de RH" [ref=e128] [cursor=pointer]:
                    - img [ref=e130]
                    - generic [ref=e131]:
                        - generic [ref=e132]: Administrador Demo
                        - generic [ref=e133]: Gerente de RH
                    - img [ref=e134]
            - button "Toggle Sidebar" [ref=e136]
        - main [ref=e137]:
            - generic [ref=e138]:
                - generic [ref=e139]:
                    - button "Toggle Sidebar" [ref=e140] [cursor=pointer]:
                        - img
                        - generic [ref=e141]: Toggle Sidebar
                    - generic:
                        - heading [level=1]
                - generic [ref=e142]:
                    - generic [ref=e143]:
                        - img [ref=e144]
                        - textbox "Buscar..." [ref=e147]
                    - button "3" [ref=e148] [cursor=pointer]:
                        - img
                        - generic [ref=e149]: "3"
            - main [ref=e150]:
                - generic [ref=e152]:
                    - generic [ref=e153]:
                        - button "Portal de Comunicação" [ref=e154] [cursor=pointer]:
                            - img
                            - text: Portal de Comunicação
                        - button "Trocar Senha" [ref=e155] [cursor=pointer]:
                            - img
                            - text: Trocar Senha
                    - generic [ref=e156]:
                        - generic [ref=e157]:
                            - generic [ref=e158]:
                                - generic [ref=e159]:
                                    - heading "Portal" [level=1] [ref=e160]:
                                        - img [ref=e161]
                                        - text: Portal
                                    - button [ref=e163] [cursor=pointer]:
                                        - img
                                - generic [ref=e164]:
                                    - img [ref=e165]
                                    - textbox "Buscar conversas..." [ref=e168]
                            - generic [ref=e170]:
                                - 'button "A Administrador Demo 22/06/26 Solicitação de Aprovação: Contratação Urgente - Setor Financeiro RH Estratégico, Solicito aprovação para abertura ..." [ref=e171] [cursor=pointer]':
                                    - generic [ref=e172]: A
                                    - generic [ref=e173]:
                                        - generic [ref=e174]:
                                            - generic [ref=e175]: Administrador Demo
                                            - generic [ref=e176]: 22/06/26
                                        - paragraph [ref=e177]: "Solicitação de Aprovação: Contratação Urgente - Setor Financeiro"
                                        - paragraph [ref=e178]: RH Estratégico, Solicito aprovação para abertura ...
                                - 'button "Chamado: Diretoria 22/06/26 Autorização para Horas Extras - Projeto Especial Solicito autorização formal para banco de horas ex..." [ref=e180] [cursor=pointer]':
                                    - img [ref=e182]
                                    - generic [ref=e186]:
                                        - generic [ref=e187]:
                                            - generic [ref=e188]: "Chamado: Diretoria"
                                            - generic [ref=e189]: 22/06/26
                                        - paragraph [ref=e190]: Autorização para Horas Extras - Projeto Especial
                                        - paragraph [ref=e191]: Solicito autorização formal para banco de horas ex...
                                - button "A Administrador Demo 20/06/26 Reunião de Alinhamento Q3 - Metas e KPIs Prezados gestores, Convoco reunião de alinhamento..." [ref=e193] [cursor=pointer]:
                                    - generic [ref=e194]: A
                                    - generic [ref=e195]:
                                        - generic [ref=e196]:
                                            - generic [ref=e197]: Administrador Demo
                                            - generic [ref=e198]: 20/06/26
                                        - paragraph [ref=e199]: Reunião de Alinhamento Q3 - Metas e KPIs
                                        - paragraph [ref=e200]: Prezados gestores, Convoco reunião de alinhamento...
                                - 'button "Chamado: RH Estratégico 16/06/26 Revisão da Política de Banco de Horas A política atual de banco de horas está gerando co..." [ref=e201] [cursor=pointer]':
                                    - img [ref=e203]
                                    - generic [ref=e207]:
                                        - generic [ref=e208]:
                                            - generic [ref=e209]: "Chamado: RH Estratégico"
                                            - generic [ref=e210]: 16/06/26
                                        - paragraph [ref=e211]: Revisão da Política de Banco de Horas
                                        - paragraph [ref=e212]: A política atual de banco de horas está gerando co...
                        - generic [ref=e215]:
                            - img [ref=e217]
                            - heading "Portal de Comunicação" [level=2] [ref=e219]
                            - paragraph [ref=e220]:
                                - text: Selecione uma conversa na lista ao lado para visualizar os detalhes, ou clique no botão
                                - strong [ref=e221]: +
                                - text: para iniciar um novo Protocolo ou Chamado.
                            - generic [ref=e222]:
                                - generic [ref=e223]:
                                    - img [ref=e224]
                                    - heading "Protocolos" [level=3] [ref=e230]
                                    - paragraph [ref=e231]: Comunicação oficial e rastreável com outros gestores.
                                - generic [ref=e232]:
                                    - img [ref=e233]
                                    - heading "Chamados" [level=3] [ref=e237]
                                    - paragraph [ref=e238]: Solicitações formais para o RH ou Diretoria.
```

# Test source

```ts
  1  | import { expect, test } from '@playwright/test';
  2  |
  3  | test.describe('Fluxos de Login', () => {
  4  |   test.beforeEach(async ({ page }) => {
  5  |     await page.addInitScript(() => {
  6  |       window.localStorage.clear();
  7  |     });
  8  |   });
  9  |
  10 |   test('usuário sem sessão é redirecionado para o login', async ({ page }) => {
  11 |     await page.goto('/');
  12 |     // Aumentamos o timeout para o redirect; browsers como Safari podem demorar na hidratação do Auth
  13 |     await expect(page).toHaveURL(/\/login$/, { timeout: 10000 });
  14 |     await expect(page.getByRole('heading', { name: /bem-vindo de volta/i })).toBeVisible();
  15 |   });
  16 |
  17 |   test('acesso rápido do colaborador abre o portal e permite voltar ao login', async ({ page }) => {
  18 |     await page.goto('/login');
  19 |
  20 |     // Garantimos que o botão está estável antes do clique (essencial para Mobile Safari)
  21 |     const employeeAreaBtn = page.getByRole('button', { name: /área do funcionário/i });
  22 |     await employeeAreaBtn.waitFor({ state: 'visible' });
  23 |     await employeeAreaBtn.click();
  24 |
  25 |     await expect(page).toHaveURL(/\/clock-in$/);
  26 |     await expect(page.getByText(/portal do colaborador/i).first()).toBeVisible();
  27 |
  28 |     await page.getByRole('button', { name: /acesso administrativo/i }).click();
  29 |     await expect(page).toHaveURL(/\/login$/);
  30 |   });
  31 |
  32 |   test('login com sucesso redireciona para o dashboard', async ({ page }) => {
  33 |     // Interceptamos a chamada de login do Supabase para garantir sucesso sem depender do banco real
  34 |     await page.route('**/auth/v1/token*', async route => {
  35 |       await route.fulfill({
  36 |         status: 200,
  37 |         contentType: 'application/json',
  38 |         body: JSON.stringify({
  39 |           access_token: 'fake-token',
  40 |           token_type: 'bearer',
  41 |           expires_in: 3600,
  42 |           refresh_token: 'fake-refresh',
  43 |           user: { id: 'test-user', email: 'admin@teste.com' }
  44 |         })
  45 |       });
  46 |     });
  47 |
  48 |     await page.goto('/login');
  49 |
  50 |     await page.locator('input[type="email"]').fill('admin@teste.com');
  51 |     await page.locator('input[type="password"]').fill('123456');
  52 |     await page.getByRole('button', { name: /entrar no sistema/i }).click();
  53 |
> 54 |     await expect(page).toHaveURL(/\/(dashboard)?$/);
     |                        ^ Error: expect(page).toHaveURL(expected) failed
  55 |   });
  56 | });
  57 |
```
