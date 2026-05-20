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
Received string:  "http://127.0.0.1:3000/login"
Timeout: 5000ms

Call log:
  - Expect "toHaveURL" with timeout 5000ms
    9 × unexpected value "http://127.0.0.1:3000/login"

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
        - generic [ref=e7]:
          - img "logo da empresa" [ref=e9]
          - heading "Bem-vindo de volta" [level=4] [ref=e10]
          - paragraph [ref=e11]: Acesse sua conta para gerenciar o RH
        - generic [ref=e12]:
          - generic [ref=e13]:
            - text: E-mail Corporativo
            - generic [ref=e14]:
              - img [ref=e15]
              - textbox "exemplo@rededmi.com.br" [ref=e18]: admin@teste.com
          - generic [ref=e19]:
            - generic [ref=e21]: Senha
            - generic [ref=e22]:
              - img [ref=e23]
              - textbox "••••••••" [ref=e26]: "123456"
          - button "Autenticando..." [disabled] [ref=e28]
        - generic [ref=e32]: Acesso Rápido
        - generic [ref=e33]:
          - button "Área do Funcionário" [ref=e34] [cursor=pointer]:
            - img [ref=e36]
            - text: Área do Funcionário
          - generic [ref=e39]:
            - button "Manual do Usuário" [ref=e40] [cursor=pointer]:
              - img
              - text: Manual do Usuário
            - generic [ref=e42]:
              - img [ref=e43]
              - generic [ref=e46]: Segurança Verificada
      - generic [ref=e47]:
        - paragraph [ref=e48]: © 2026 Hospital DMI. Todos os direitos reservados.
        - paragraph [ref=e49]: Desenvolvido e Auditado por Marcos Guilherme
    - generic [ref=e50]:
      - img "Hospital DMI" [ref=e53]
      - generic [ref=e54]:
        - generic [ref=e55]:
          - img [ref=e56]
          - generic [ref=e59]: Sistema Operacional
        - heading "Seja bem vindo a Gestão de Pessoas da Rede DMI" [level=2] [ref=e60]
        - paragraph [ref=e61]: Plataforma integrada para otimizar os processos de RH da Hospital DMI, garantindo eficiência e cuidado com nossos colaboradores.
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