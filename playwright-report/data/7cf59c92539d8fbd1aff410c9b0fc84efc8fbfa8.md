# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: employees.spec.ts >> Fluxos de Colaboradores >> cadastrar novo colaborador com sucesso
- Location: tests\e2e\employees.spec.ts:14:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: /novo colaborador/i })

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
              - textbox "exemplo@rededmi.com.br" [ref=e18]
          - generic [ref=e19]:
            - generic [ref=e21]: Senha
            - generic [ref=e22]:
              - img [ref=e23]
              - textbox "••••••••" [ref=e26]
          - button "Entrar no Sistema" [ref=e28] [cursor=pointer]:
            - text: Entrar no Sistema
            - img [ref=e29]
        - generic [ref=e34]: Acesso Rápido
        - generic [ref=e35]:
          - button "Área do Funcionário" [ref=e36] [cursor=pointer]:
            - img [ref=e38]
            - text: Área do Funcionário
          - generic [ref=e41]:
            - button "Manual do Usuário" [ref=e42] [cursor=pointer]:
              - img
              - text: Manual do Usuário
            - generic [ref=e44]:
              - img [ref=e45]
              - generic [ref=e48]: Segurança Verificada
      - generic [ref=e49]:
        - paragraph [ref=e50]: © 2026 Rede DMI. Todos os direitos reservados.
        - paragraph [ref=e51]: Desenvolvido e Auditado por Marcos Guilherme
    - generic [ref=e52]:
      - img "Hospital DMI" [ref=e55]
      - generic [ref=e56]:
        - generic [ref=e57]:
          - img [ref=e58]
          - generic [ref=e61]: Sistema Operacional
        - heading "Excelência em Gestão de Pessoas" [level=2] [ref=e62]
        - paragraph [ref=e63]: Plataforma integrada para otimizar os processos de RH da REDE DMI, garantindo eficiência e cuidado com nossos colaboradores.
```

# Test source

```ts
  1  | import { expect, test } from '@playwright/test';
  2  | 
  3  | test.describe('Fluxos de Colaboradores', () => {
  4  |   test.beforeEach(async ({ page }) => {
  5  |     await page.route('**/rest/v1/**', async (route) => {
  6  |       await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
  7  |     });
  8  | 
  9  |     await page.addInitScript(() => {
  10 |       window.localStorage.setItem('mock_logged_in', 'true');
  11 |     });
  12 |   });
  13 | 
  14 |   test('cadastrar novo colaborador com sucesso', async ({ page }) => {
  15 |     await page.goto('/employees', { waitUntil: 'domcontentloaded' });
  16 | 
> 17 |     await page.getByRole('button', { name: /novo colaborador/i }).click();
     |                                                                   ^ Error: locator.click: Test timeout of 30000ms exceeded.
  18 | 
  19 |     await page.getByLabel(/nome completo/i).fill('Maria Silva');
  20 |     await page.getByLabel(/e-mail/i).fill('maria@teste.com');
  21 |     await page.getByLabel(/cargo/i).fill('Desenvolvedora');
  22 | 
  23 |     await page.getByRole('button', { name: /salvar colaborador/i }).click();
  24 | 
  25 |     await expect(page.getByText(/Colaborador criado/i).first()).toBeVisible();
  26 |   });
  27 | });
  28 | 
```