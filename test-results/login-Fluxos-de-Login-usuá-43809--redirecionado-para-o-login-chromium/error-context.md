# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: login.spec.ts >> Fluxos de Login >> usuário sem sessão é redirecionado para o login
- Location: tests\e2e\login.spec.ts:10:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.goto: Test timeout of 30000ms exceeded.
Call log:
  - navigating to "http://127.0.0.1:3000/", waiting until "load"

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
> 11 |     await page.goto('/');
     |                ^ Error: page.goto: Test timeout of 30000ms exceeded.
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
  54 |     await expect(page).toHaveURL(/\/(dashboard)?$/);
  55 |   });
  56 | });
  57 |
```
