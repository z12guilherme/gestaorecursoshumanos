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
    - main [ref=e5]:
        - generic [ref=e6]:
            - generic [ref=e7]:
                - button "Toggle Sidebar" [ref=e8] [cursor=pointer]:
                    - img
                    - generic [ref=e9]: Toggle Sidebar
                - generic:
                    - heading [level=1]
            - button "3" [ref=e11] [cursor=pointer]:
                - img
                - generic [ref=e12]: "3"
        - main [ref=e13]:
            - generic [ref=e15]:
                - generic [ref=e16]:
                    - button "Portal de Comunicação" [ref=e17] [cursor=pointer]:
                        - img
                        - text: Portal de Comunicação
                    - button "Trocar Senha" [ref=e18] [cursor=pointer]:
                        - img
                        - text: Trocar Senha
                - generic [ref=e20]:
                    - generic [ref=e21]:
                        - generic [ref=e22]:
                            - heading "Portal" [level=1] [ref=e23]:
                                - img [ref=e24]
                                - text: Portal
                            - button [ref=e26] [cursor=pointer]:
                                - img
                        - generic [ref=e27]:
                            - img [ref=e28]
                            - textbox "Buscar conversas..." [ref=e31]
                    - generic [ref=e33]:
                        - 'button "A Administrador Demo 22/06/26 Solicitação de Aprovação: Contratação Urgente - Setor Financeiro RH Estratégico, Solicito aprovação para abertura ..." [ref=e34] [cursor=pointer]':
                            - generic [ref=e35]: A
                            - generic [ref=e36]:
                                - generic [ref=e37]:
                                    - generic [ref=e38]: Administrador Demo
                                    - generic [ref=e39]: 22/06/26
                                - paragraph [ref=e40]: "Solicitação de Aprovação: Contratação Urgente - Setor Financeiro"
                                - paragraph [ref=e41]: RH Estratégico, Solicito aprovação para abertura ...
                        - 'button "Chamado: Diretoria 22/06/26 Autorização para Horas Extras - Projeto Especial Solicito autorização formal para banco de horas ex..." [ref=e43] [cursor=pointer]':
                            - img [ref=e45]
                            - generic [ref=e47]:
                                - generic [ref=e48]:
                                    - generic [ref=e49]: "Chamado: Diretoria"
                                    - generic [ref=e50]: 22/06/26
                                - paragraph [ref=e51]: Autorização para Horas Extras - Projeto Especial
                                - paragraph [ref=e52]: Solicito autorização formal para banco de horas ex...
                        - button "A Administrador Demo 20/06/26 Reunião de Alinhamento Q3 - Metas e KPIs Prezados gestores, Convoco reunião de alinhamento..." [ref=e54] [cursor=pointer]:
                            - generic [ref=e55]: A
                            - generic [ref=e56]:
                                - generic [ref=e57]:
                                    - generic [ref=e58]: Administrador Demo
                                    - generic [ref=e59]: 20/06/26
                                - paragraph [ref=e60]: Reunião de Alinhamento Q3 - Metas e KPIs
                                - paragraph [ref=e61]: Prezados gestores, Convoco reunião de alinhamento...
                        - 'button "Chamado: RH Estratégico 16/06/26 Revisão da Política de Banco de Horas A política atual de banco de horas está gerando co..." [ref=e62] [cursor=pointer]':
                            - img [ref=e64]
                            - generic [ref=e66]:
                                - generic [ref=e67]:
                                    - generic [ref=e68]: "Chamado: RH Estratégico"
                                    - generic [ref=e69]: 16/06/26
                                - paragraph [ref=e70]: Revisão da Política de Banco de Horas
                                - paragraph [ref=e71]: A política atual de banco de horas está gerando co...
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
