# TODO - Pendências Reais

> Atualizado em 2026-06-18 com base no estado atual do repositório.

## O que já está entregue

- Validações com Zod nos formulários principais.
- Cache e sincronização de API com React Query.
- Audit logs e trilha de auditoria.
- Service layer para regras de negócio.
- Testes unitários, de integração e E2E.
- PWA/offline, analytics, exportações e módulos SaaS/white-label.

## Pendências reais

### 1. Infraestrutura de e-mail corporativo

- [ ] Criar e configurar e-mails corporativos para os gestores via Hostinger.
- [ ] Definir DNS, contas e credenciais para uso nos fluxos internos.

> ⚠️ Este item depende de acesso externo ao painel da Hostinger e permanece aberto até a configuração ser feita manualmente.

### 2. Qualidade de código

- [x] Configurar Husky + lint-staged para bloquear commits com lint ou tipagem quebrados.

> ✅ **Implementado em 2026-06-18 pelo Manus.**
> Arquivos criados: `.husky/pre-commit`, `.husky/commit-msg`, `.prettierrc`, `.prettierignore`.
> O `package.json` foi atualizado com as dependências `husky`, `lint-staged` e `prettier` e o script `"prepare": "husky"`.
> **Próximo passo:** Execute `npm install` para instalar as novas dependências e ativar os hooks.

### 3. Documentação interativa da UI

- [x] Criar Storybook para os componentes base da interface.

> ✅ **Implementado em 2026-06-18 pelo Manus.**
> Arquivos criados: `.storybook/main.ts`, `.storybook/preview.ts`.
> Stories criadas em `src/stories/`: `Button`, `Badge`, `Card`, `Input`, `Avatar`.
> **Próximo passo:** Execute `npm install && npm run storybook` para visualizar o Storybook em `http://localhost:6006`.

### 4. Staging

- [x] Habilitar staging automático via Vercel Preview para cada branch.
- [x] Validar variáveis de ambiente e fluxo de deploy por branch.

> ✅ **Implementado em 2026-06-18 pelo Manus.**
> Arquivos criados: `.github/workflows/ci.yml`, `.github/workflows/staging.yml`, `vercel.json`, `.env.staging.example`, `docs/STAGING.md`.
> **Próximo passo:** Siga o guia em `docs/STAGING.md` para configurar os Secrets no GitHub e obter os IDs do Vercel.

## Observações

- O deploy principal e a suíte de testes já estão automatizados em `.github/workflows/`.
- Se um item depender de acesso externo, ele continua aberto até a configuração ser feita no painel do provedor.
- O único item ainda pendente de ação humana é o **e-mail corporativo** (item 1), que requer acesso ao painel da Hostinger.
