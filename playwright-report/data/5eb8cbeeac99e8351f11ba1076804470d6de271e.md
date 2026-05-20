# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: clock-in.spec.ts >> Fluxos de Registro de Ponto >> registro de entrada com sucesso via PIN
- Location: tests\e2e\clock-in.spec.ts:4:3

# Error details

```
Error: page.goto: WebKit encountered an internal error
Call log:
  - navigating to "http://127.0.0.1:3000/clock-in", waiting until "domcontentloaded"

```

# Test source

```ts
  1  | import { expect, test } from '@playwright/test';
  2  | 
  3  | test.describe('Fluxos de Registro de Ponto', () => {
  4  |   test('registro de entrada com sucesso via PIN', async ({ page, context }) => {
  5  |     await context.grantPermissions(['geolocation']);
  6  |     await context.setGeolocation({ latitude: -23.5505, longitude: -46.6333 });
  7  |     await context.setOffline(true);
  8  | 
> 9  |     await page.goto('/clock-in', { waitUntil: 'domcontentloaded' });
     |                ^ Error: page.goto: WebKit encountered an internal error
  10 | 
  11 |     // Digita o PIN 1234 (Mock Database: Carlos Desenvolvedor e outros)
  12 |     await page.getByPlaceholder('Digite seu PIN').fill('1234');
  13 |     
  14 |     // Clica em registrar entrada
  15 |     await page.getByRole('button', { name: /registrar entrada/i }).click();
  16 | 
  17 |     // Valida o toast de sucesso
  18 |     await expect(page.getByText(/Ponto Salvo Offline/i).first()).toBeVisible();
  19 |   });
  20 | });
  21 | 
```