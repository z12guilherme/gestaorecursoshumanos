import { expect, test } from '@playwright/test';

test.describe('Fluxos de Registro de Ponto', () => {
  test('registro de entrada com sucesso via PIN', async ({ page, context }) => {
    await context.grantPermissions(['geolocation']);
    await context.setGeolocation({ latitude: -23.5505, longitude: -46.6333 });
    await context.setOffline(true);

    await page.goto('/clock-in', { waitUntil: 'domcontentloaded' });

    // Digita o PIN 1234 (Mock Database: Carlos Desenvolvedor e outros)
    await page.getByPlaceholder('Digite seu PIN').fill('1234');
    
    // Clica em registrar entrada
    await page.getByRole('button', { name: /registrar entrada/i }).click();

    // Valida o toast de sucesso
    await expect(page.getByText(/Ponto Salvo Offline/i).first()).toBeVisible();
  });
});
