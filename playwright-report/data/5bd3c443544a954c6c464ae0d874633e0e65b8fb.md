# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: clock-in.spec.ts >> Fluxos de Registro de Ponto >> registro de entrada com sucesso via PIN
- Location: tests\e2e\clock-in.spec.ts:4:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText(/Ponto Salvo Offline/i).first()
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByText(/Ponto Salvo Offline/i).first()

```

# Page snapshot

```yaml
- generic [ref=e2]:
    - region "Notifications (F8)":
        - list
    - region "Notifications alt+T"
    - generic [ref=e3]:
        - banner [ref=e4]:
            - generic [ref=e5]:
                - generic [ref=e6]: HOS
                - generic [ref=e7]:
                    - heading "Hospital DMI" [level=1] [ref=e8]
                    - paragraph [ref=e9]: Portal do Colaborador
        - main [ref=e10]:
            - generic [ref=e11]:
                - generic [ref=e12]:
                    - img [ref=e14]
                    - generic [ref=e17]:
                        - paragraph [ref=e18]: Bem-vindo ao seu portal
                        - heading "O que você deseja fazer hoje?" [level=2] [ref=e19]
                        - generic [ref=e20]:
                            - generic [ref=e21]:
                                - img [ref=e22]
                                - generic [ref=e24]:
                                    - paragraph [ref=e25]: Data de Hoje
                                    - paragraph [ref=e26]: 23/06/2026
                            - generic [ref=e27]:
                                - img [ref=e28]
                                - generic [ref=e31]:
                                    - paragraph [ref=e32]: Hora Atual
                                    - paragraph [ref=e33]: 14:20:53
                - generic [ref=e34]:
                    - generic [ref=e35]:
                        - heading "Acesso Rápido" [level=3] [ref=e36]
                        - paragraph [ref=e37]: Digite seu PIN para liberar as ações
                    - generic [ref=e38]:
                        - generic [ref=e40]:
                            - generic:
                                - img
                            - textbox "Digite seu PIN (4 dígitos)" [ref=e41]
                        - generic [ref=e42]:
                            - button "Registrar Entrada" [ref=e43] [cursor=pointer]:
                                - img
                                - generic [ref=e44]: Registrar Entrada
                            - button "Registrar Saída" [ref=e45] [cursor=pointer]:
                                - img
                                - generic [ref=e46]: Registrar Saída
                        - generic [ref=e47]:
                            - button "Documentos" [ref=e48] [cursor=pointer]:
                                - img
                                - text: Documentos
                            - button "Crachá" [ref=e49] [cursor=pointer]:
                                - img
                                - text: Crachá
                            - button "Suporte" [ref=e50] [cursor=pointer]:
                                - img
                                - text: Suporte
            - generic [ref=e51]:
                - generic [ref=e52]:
                    - generic [ref=e54]:
                        - heading "Mural de Avisos" [level=3] [ref=e55]:
                            - img [ref=e56]
                            - text: Mural de Avisos
                        - generic [ref=e59]: 3 Novos
                    - generic [ref=e64]:
                        - generic [ref=e65]:
                            - img [ref=e67]
                            - heading "Como acessar seu Holerite?" [level=4] [ref=e69]
                            - paragraph [ref=e70]: Digite sua senha no painel ao lado e clique em "Meus Documentos". Você poderá visualizar, assinar e baixar seu contra cheque do mês anterior instantaneamente (Verifique com o RH se foram feitas as atualizações mensais).
                        - generic [ref=e71]:
                            - heading "Manutenção no Sistema" [level=4] [ref=e73]
                            - paragraph [ref=e74]: O sistema ficará indisponível no sábado das 22h às 02h para manutenção programada.
                            - generic [ref=e75]:
                                - generic [ref=e76]: 22 de jun
                                - generic [ref=e77]: TI
                        - generic [ref=e78]:
                            - generic [ref=e79]:
                                - heading "Confraternização de Fim de Ano" [level=4] [ref=e80]
                                - generic "Alta Prioridade" [ref=e81]
                            - paragraph [ref=e82]: Nossa confraternização será no dia 20/12 às 19h no Restaurante Sabores do Chef. Confirmem presença até sexta-feira!
                            - generic [ref=e83]:
                                - generic [ref=e84]: 21 de jun
                                - generic [ref=e85]: Fernanda RH
                        - generic [ref=e86]:
                            - heading "Novo Plano de Saúde" [level=4] [ref=e88]
                            - paragraph [ref=e89]: A partir do próximo mês, teremos um novo convênio médico com cobertura ampliada. Detalhes serão enviados por e-mail.
                            - generic [ref=e90]:
                                - generic [ref=e91]: 18 de jun
                                - generic [ref=e92]: Diretoria
                - button "Acesso Administrativo" [ref=e94] [cursor=pointer]:
                    - img
                    - text: Acesso Administrativo
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
  8  |     await page.goto('/clock-in');
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
> 23 |     await expect(page.getByText(/Ponto Salvo Offline/i).first()).toBeVisible();
     |                                                                  ^ Error: expect(locator).toBeVisible() failed
  24 |   });
  25 | });
  26 |
```
