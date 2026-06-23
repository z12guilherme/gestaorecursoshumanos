# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: clock-in.spec.ts >> Fluxos de Registro de Ponto >> registro de entrada com sucesso via PIN
- Location: tests\e2e\clock-in.spec.ts:4:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.goto: Test timeout of 30000ms exceeded.
Call log:
  - navigating to "http://127.0.0.1:3000/clock-in", waiting until "load"

```

# Test source

```ts
  1  | import { expect, test } from '@playwright/test';
  2  |
  3  | test.describe('Fluxos de Registro de Ponto', () => {
  4  |   test('registro de entrada com sucesso via PIN', async ({ page, context }) => {
  5  |     await context.grantPermissions(['geolocation']);
  6  |     await context.setGeolocation({ latitude: -23.5505, longitude: -46.6333 });
  7  |
> 8  |     await page.goto('/clock-in');
     |                ^ Error: page.goto: Test timeout of 30000ms exceeded.
  9  |
  10 |     // Localizamos o input de PIN usando Regex para ignorar o sufixo "(4 dígitos)"
  11 |     const pinInput = page.getByPlaceholder(/Digite seu PIN/i);
  12 |
  13 |     // Garantimos que o input está visível antes de simular a queda de internet
  14 |     await pinInput.waitFor({ state: 'visible' });
  15 |     await context.setOffline(true);
  16 |
  17 |     await pinInput.fill('1234');
  18 |
  19 |     // Clica em registrar entrada
  20 |     await page.getByRole('button', { name: /registrar entrada/i }).click();
  21 |
  22 |     // Valida o toast de sucesso
  23 |     await expect(page.getByText(/Ponto Salvo Offline/i).first()).toBeVisible();
  24 |   });
  25 | });
  26 |
```
