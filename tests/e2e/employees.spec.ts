import { expect, test } from '@playwright/test';

test.describe('Fluxos de Colaboradores', () => {
  test.beforeEach(async ({ page }) => {
    // Mock específico para funcionários para evitar interferência com outras tabelas
    await page.route('**/rest/v1/employees*', async (route) => {
      const method = route.request().method();
      if (method === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify([{ id: '123', name: 'Maria Silva' }])
        });
      } else {
        await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
      }
    });

    // Mock genérico para outras tabelas (settings, etc) para evitar que a UI trave em loading
    await page.route('**/rest/v1/*', async (route) => {
      if (route.request().url().includes('employees')) return;
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
    });

    await page.addInitScript(() => {
      window.localStorage.setItem('mock_logged_in', 'true');
    });
  });

  test('cadastrar novo colaborador com sucesso', async ({ page }) => {
    // Removido networkidle para evitar timeouts causados por conexões persistentes do Supabase
    await page.goto('/employees');

    // Aguarda o carregamento do botão principal antes de interagir
    const addButton = page.getByRole('button', { name: /novo colaborador/i });
    await addButton.waitFor({ state: 'visible' });
    await addButton.click();

    // Garante que o modal de cadastro está visível
    const modal = page.getByRole('dialog');
    await expect(modal).toBeVisible();

    await modal.getByLabel(/nome completo/i).fill('Maria Silva');
    await modal.getByLabel(/email/i).fill('maria@teste.com');
    await modal.getByLabel(/telefone/i).fill('11999999999');
    await modal.getByLabel(/cargo/i).fill('Desenvolvedora');

    // Preenche as datas obrigatórias
    await modal.getByLabel(/data de admissão/i).fill('2024-01-01');
    await modal.getByLabel(/data de nascimento/i).fill('1990-01-01');

    // Preenche o PIN (Obrigatório para o ponto)
    await modal.getByLabel(/senha do ponto/i).fill('1234');

    // Seleciona o Departamento (usando o placeholder específico do formulário para evitar conflito com filtros)
    const departmentSelect = modal.getByRole('combobox', { name: /selecione/i });
    await departmentSelect.click();

    // Localiza a opção no portal do Select (renderizado fora do DOM do dialog)
    await page.getByRole('option', { name: 'TI', exact: true }).click();

    await modal.getByRole('button', { name: /cadastrar colaborador/i }).click();

    // Validação final por texto de sucesso no toast
    await expect(page.getByText(/cadastrado com sucesso/i).first()).toBeVisible();
  });
});
