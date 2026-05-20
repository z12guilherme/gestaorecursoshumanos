import { expect, test } from '@playwright/test';

test.describe('Fluxos de Colaboradores', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/rest/v1/**', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
    });

    await page.addInitScript(() => {
      window.localStorage.setItem('mock_logged_in', 'true');
    });
  });

  test('cadastrar novo colaborador com sucesso', async ({ page }) => {
    await page.goto('/employees', { waitUntil: 'domcontentloaded' });

    await page.getByRole('button', { name: /novo colaborador/i }).click();

    await page.getByLabel(/nome completo/i).fill('Maria Silva');
    await page.getByLabel(/e-mail/i).fill('maria@teste.com');
    await page.getByLabel(/cargo/i).fill('Desenvolvedora');

    await page.getByRole('button', { name: /salvar colaborador/i }).click();

    await expect(page.getByText(/Colaborador criado/i).first()).toBeVisible();
  });
});
