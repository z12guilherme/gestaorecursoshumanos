import { expect, test } from '@playwright/test';

test.describe('Fluxos de Login', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.clear();
    });
  });

  test('usuário sem sessão é redirecionado para o login', async ({ page }) => {
    await page.goto('/');
    // Aumentamos o timeout para o redirect; browsers como Safari podem demorar na hidratação do Auth
    await expect(page).toHaveURL(/\/login$/, { timeout: 10000 });
    await expect(page.getByRole('heading', { name: /bem-vindo de volta/i })).toBeVisible();
  });

  test('acesso rápido do colaborador abre o portal e permite voltar ao login', async ({ page }) => {
    await page.goto('/login');

    // Garantimos que o botão está estável antes do clique (essencial para Mobile Safari)
    const employeeAreaBtn = page.getByRole('button', { name: /área do funcionário/i });
    await employeeAreaBtn.waitFor({ state: 'visible' });
    await employeeAreaBtn.click();

    await expect(page).toHaveURL(/\/clock-in$/);
    await expect(page.getByText(/portal do colaborador/i).first()).toBeVisible();

    await page.getByRole('button', { name: /acesso administrativo/i }).click();
    await expect(page).toHaveURL(/\/login$/);
  });

  test('login com sucesso redireciona para o dashboard', async ({ page }) => {
    // Interceptamos a chamada de login do Supabase para garantir sucesso sem depender do banco real
    await page.route('**/auth/v1/token*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          access_token: 'fake-token',
          token_type: 'bearer',
          expires_in: 3600,
          refresh_token: 'fake-refresh',
          user: { id: 'test-user', email: 'admin@teste.com' }
        })
      });
    });

    await page.goto('/login');

    await page.locator('input[type="email"]').fill('admin@teste.com');
    await page.locator('input[type="password"]').fill('123456');
    await page.getByRole('button', { name: /entrar no sistema/i }).click();

    await expect(page).toHaveURL(/\/(dashboard)?$/);
  });
});
