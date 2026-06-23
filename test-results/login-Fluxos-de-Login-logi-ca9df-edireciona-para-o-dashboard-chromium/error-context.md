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
    7 × unexpected value "http://127.0.0.1:3000/manager-portal"

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
                            - generic [ref=e35]: Salários e Pagamentos
                    - listitem [ref=e36]:
                        - link "Recrutamento" [ref=e37] [cursor=pointer]:
                            - /url: /recruitment
                            - img [ref=e38]
                            - generic [ref=e41]: Recrutamento
                    - listitem [ref=e42]:
                        - link "Avaliações" [ref=e43] [cursor=pointer]:
                            - /url: /performance
                            - img [ref=e44]
                            - generic [ref=e46]: Avaliações
                    - listitem [ref=e47]:
                        - link "Férias & Ausências" [ref=e48] [cursor=pointer]:
                            - /url: /absences
                            - img [ref=e49]
                            - generic [ref=e51]: Férias & Ausências
                    - listitem [ref=e52]:
                        - link "Controle de Ponto" [ref=e53] [cursor=pointer]:
                            - /url: /timesheet
                            - img [ref=e54]
                            - generic [ref=e57]: Controle de Ponto
                    - listitem [ref=e58]:
                        - link "Chamados" [ref=e59] [cursor=pointer]:
                            - /url: /tickets
                            - img [ref=e60]
                            - generic [ref=e67]: Chamados
                    - listitem [ref=e68]:
                        - link "Relatórios" [ref=e69] [cursor=pointer]:
                            - /url: /reports
                            - img [ref=e70]
                            - generic [ref=e73]: Relatórios
                    - listitem [ref=e74]:
                        - link "Comunicação" [ref=e75] [cursor=pointer]:
                            - /url: /communication
                            - img [ref=e76]
                            - generic [ref=e78]: Comunicação
                    - listitem [ref=e79]:
                        - link "Ouvidoria" [ref=e80] [cursor=pointer]:
                            - /url: /suggestions
                            - img [ref=e81]
                            - generic [ref=e83]: Ouvidoria
                    - listitem [ref=e84]:
                        - link "Assistente IA" [ref=e85] [cursor=pointer]:
                            - /url: /ai-assistant
                            - img [ref=e86]
                            - generic [ref=e89]: Assistente IA
                    - listitem [ref=e90]:
                        - link "Automações" [ref=e91] [cursor=pointer]:
                            - /url: /automations
                            - img [ref=e92]
                            - generic [ref=e96]: Automações
                    - listitem [ref=e97]:
                        - link "Auditoria" [ref=e98] [cursor=pointer]:
                            - /url: /audit-logs
                            - img [ref=e99]
                            - generic [ref=e101]: Auditoria
                    - listitem [ref=e102]:
                        - link "Configurações" [ref=e103] [cursor=pointer]:
                            - /url: /settings
                            - img [ref=e104]
                            - generic [ref=e107]: Configurações
                    - listitem [ref=e108]:
                        - link "Área de Gestores 1" [ref=e109] [cursor=pointer]:
                            - /url: /manager-portal
                            - img [ref=e110]
                            - generic [ref=e112]: Área de Gestores
                            - generic [ref=e113]: "1"
                - button "Administrador Demo Gerente de RH" [ref=e115] [cursor=pointer]:
                    - img [ref=e117]
                    - generic [ref=e118]:
                        - generic [ref=e119]: Administrador Demo
                        - generic [ref=e120]: Gerente de RH
                    - img [ref=e121]
            - button "Toggle Sidebar" [ref=e123]
        - main [ref=e124]:
            - generic [ref=e125]:
                - generic [ref=e126]:
                    - button "Toggle Sidebar" [ref=e127] [cursor=pointer]:
                        - img
                        - generic [ref=e128]: Toggle Sidebar
                    - generic:
                        - heading [level=1]
                - generic [ref=e129]:
                    - generic [ref=e130]:
                        - img [ref=e131]
                        - textbox "Buscar..." [ref=e134]
                    - button "3" [ref=e135] [cursor=pointer]:
                        - img
                        - generic [ref=e136]: "3"
            - main [ref=e137]:
                - generic [ref=e139]:
                    - generic [ref=e140]:
                        - button "Portal de Comunicação" [ref=e141] [cursor=pointer]:
                            - img
                            - text: Portal de Comunicação
                        - button "Trocar Senha" [ref=e142] [cursor=pointer]:
                            - img
                            - text: Trocar Senha
                    - generic [ref=e143]:
                        - generic [ref=e144]:
                            - generic [ref=e145]:
                                - generic [ref=e146]:
                                    - heading "Portal" [level=1] [ref=e147]:
                                        - img [ref=e148]
                                        - text: Portal
                                    - button [ref=e150] [cursor=pointer]:
                                        - img
                                - generic [ref=e151]:
                                    - img [ref=e152]
                                    - textbox "Buscar conversas..." [ref=e155]
                            - generic [ref=e157]:
                                - 'button "A Administrador Demo 22/06/26 Solicitação de Aprovação: Contratação Urgente - Setor Financeiro RH Estratégico, Solicito aprovação para abertura ..." [ref=e158] [cursor=pointer]':
                                    - generic [ref=e159]: A
                                    - generic [ref=e160]:
                                        - generic [ref=e161]:
                                            - generic [ref=e162]: Administrador Demo
                                            - generic [ref=e163]: 22/06/26
                                        - paragraph [ref=e164]: "Solicitação de Aprovação: Contratação Urgente - Setor Financeiro"
                                        - paragraph [ref=e165]: RH Estratégico, Solicito aprovação para abertura ...
                                - 'button "Chamado: Diretoria 22/06/26 Autorização para Horas Extras - Projeto Especial Solicito autorização formal para banco de horas ex..." [ref=e167] [cursor=pointer]':
                                    - img [ref=e169]
                                    - generic [ref=e171]:
                                        - generic [ref=e172]:
                                            - generic [ref=e173]: "Chamado: Diretoria"
                                            - generic [ref=e174]: 22/06/26
                                        - paragraph [ref=e175]: Autorização para Horas Extras - Projeto Especial
                                        - paragraph [ref=e176]: Solicito autorização formal para banco de horas ex...
                                - button "A Administrador Demo 20/06/26 Reunião de Alinhamento Q3 - Metas e KPIs Prezados gestores, Convoco reunião de alinhamento..." [ref=e178] [cursor=pointer]:
                                    - generic [ref=e179]: A
                                    - generic [ref=e180]:
                                        - generic [ref=e181]:
                                            - generic [ref=e182]: Administrador Demo
                                            - generic [ref=e183]: 20/06/26
                                        - paragraph [ref=e184]: Reunião de Alinhamento Q3 - Metas e KPIs
                                        - paragraph [ref=e185]: Prezados gestores, Convoco reunião de alinhamento...
                                - 'button "Chamado: RH Estratégico 16/06/26 Revisão da Política de Banco de Horas A política atual de banco de horas está gerando co..." [ref=e186] [cursor=pointer]':
                                    - img [ref=e188]
                                    - generic [ref=e190]:
                                        - generic [ref=e191]:
                                            - generic [ref=e192]: "Chamado: RH Estratégico"
                                            - generic [ref=e193]: 16/06/26
                                        - paragraph [ref=e194]: Revisão da Política de Banco de Horas
                                        - paragraph [ref=e195]: A política atual de banco de horas está gerando co...
                        - generic [ref=e198]:
                            - img [ref=e200]
                            - heading "Portal de Comunicação" [level=2] [ref=e202]
                            - paragraph [ref=e203]:
                                - text: Selecione uma conversa na lista ao lado para visualizar os detalhes, ou clique no botão
                                - strong [ref=e204]: +
                                - text: para iniciar um novo Protocolo ou Chamado.
                            - generic [ref=e205]:
                                - generic [ref=e206]:
                                    - img [ref=e207]
                                    - heading "Protocolos" [level=3] [ref=e210]
                                    - paragraph [ref=e211]: Comunicação oficial e rastreável com outros gestores.
                                - generic [ref=e212]:
                                    - img [ref=e213]
                                    - heading "Chamados" [level=3] [ref=e215]
                                    - paragraph [ref=e216]: Solicitações formais para o RH ou Diretoria.
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
