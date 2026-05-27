import { expect, test } from '@playwright/test';

test.describe('Fluxos de Registro de Ponto', () => {
  test('registro de entrada com sucesso via PIN', async ({ page, context }) => {
    await context.grantPermissions(['geolocation']);
    await context.setGeolocation({ latitude: -23.5505, longitude: -46.6333 });

    await page.goto('/clock-in');

    // Localizamos o input de PIN usando Regex para ignorar o sufixo "(4 dígitos)"
    const pinInput = page.getByPlaceholder(/Digite seu PIN/i);

    // Garantimos que o input está visível antes de simular a queda de internet
    await pinInput.waitFor({ state: 'visible' });
    await context.setOffline(true);

    await pinInput.fill('1234');

    // Clica em registrar entrada
    await page.getByRole('button', { name: /registrar entrada/i }).click();

    // Valida o toast de sucesso
    await expect(page.getByText(/Ponto Salvo Offline/i).first()).toBeVisible();
  });
});
