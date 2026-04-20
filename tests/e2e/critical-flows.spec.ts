import { expect, test } from '@playwright/test';

test.describe('Fluxos Críticos de RH', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/rest/v1/**', async (route) => {
      const url = new URL(route.request().url());

      if (url.pathname.includes('/settings')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            company_name: 'Hospital DMI',
            cnpj: '04.232.442/0001-14',
          }),
        });
        return;
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });
  });

  test('usuário sem sessão é redirecionado para o login', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole('heading', { name: /bem-vindo de volta/i })).toBeVisible();
  });

  test('acesso rápido do colaborador abre o portal e permite voltar ao login', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'domcontentloaded' });

    await page.getByRole('button', { name: /área do funcionário/i }).click();

    await expect(page).toHaveURL(/\/clock-in$/);
    await expect(page.getByText(/portal do colaborador/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /registrar entrada/i })).toBeVisible();

    await page.getByRole('button', { name: /suporte/i }).click();
    const supportDialog = page.getByRole('dialog');
    await expect(supportDialog).toContainText(/central de atendimento ao colaborador/i);
    await page.keyboard.press('Escape');
    await expect(supportDialog).not.toBeVisible();

    await page.getByRole('button', { name: /acesso administrativo/i }).click();
    await expect(page).toHaveURL(/\/login$/);
  });
});
