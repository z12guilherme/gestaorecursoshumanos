- [x] **Meta:** Atingir 80% de cobertura nas regras de negócio.
Vamos fazer o pentest: 🛡️ Pentest Checklist - RH Rede DMI

Autenticação e Gestão de Sessão [x] Broken Object Level Authorization (BOLA): Verificar se um funcionário consegue acessar dados de outro alterando o UUID na URL ou na requisição.
[ ] MFA Bypass: Se implementado, testar se é possível forçar a API do Supabase a aceitar login sem o segundo fator.

[x] JWT Inspection: Decodificar o token gerado pelo Supabase para garantir que não há dados sensíveis expostos desnecessariamente no payload.

[x] Session Fixation: Validar se o token antigo é invalidado corretamente após o logout.
    > **Observação:** O `access_token` (JWT) permanece válido até sua expiração (1h), mesmo após o logout. No entanto, o `refresh_token` é invalidado no servidor, impedindo a renovação da sessão. Este é um comportamento padrão e seguro para arquiteturas baseadas em JWT.

Supabase & Segurança de Dados (Crítico) [ ] Row Level Security (RLS):
[x] Tentar realizar um select * em tabelas sensíveis via console do navegador sem estar logado.

[x] Tentar dar update ou delete em registros que não pertencem ao usuário autenticado.

[x] Exposição de chaves: Confirmar que apenas a anon_key está no frontend e que a service_role_key (que ignora o RLS) nunca saiu do ambiente de servidor/edge functions.

[x] Políticas de Storage: Verificar se documentos (currículos, exames) enviados para os buckets do Supabase possuem políticas de acesso restritas.

Vulnerabilidades de Frontend (React/TS) [x] Cross-Site Scripting (XSS): Injetar scripts em campos de formulário (nome do funcionário, observações) para ver se o React renderiza o script ou o sanitiza.
[x] Componentes de Terceiros: Rodar npm audit para verificar se bibliotecas instaladas possuem CVEs conhecidas.
    > **Vulnerabilidades Encontradas:** 5 vulnerabilidades altas (em `devDependencies`).
    > **Análise:** As vulnerabilidades restantes estão em pacotes de desenvolvimento (`supabase` CLI e `vite-plugin-pwa`). Elas não afetam o código de produção e as correções sugeridas (downgrade) quebrariam o projeto. Risco aceito.

[x] Client-Side Logic: Verificar se informações sensíveis (como salários ou bônus) estão sendo filtradas no frontend em vez de virem filtradas diretamente da query do Supabase.
    > **Vulnerabilidade Confirmada:** A API retornou os valores reais no campo `base_salary` (ex: 1621, 3507.03), mesmo que o campo `salary` antigo esteja zerado. Isso prova que a proteção é apenas visual (frontend), expondo dados financeiros na resposta da API.
    > **Correção Aplicada:** Criada View `employees_public` no banco de dados que exclui colunas financeiras. O frontend foi atualizado para consultar esta view em listagens públicas.

Segurança da API e Edge Functions [x] Rate Limiting: Tentar realizar centenas de requisições rápidas para as Edge Functions para verificar se há bloqueio de brute force.
    > **Resultado:** 50 requisições consecutivas foram aceitas (Status 200).
    > **Análise:** O Rate Limiting padrão é permissivo para usuários autenticados. Recomendado monitoramento se houver suspeita de scraping.

[x] Input Validation: Testar as Edge Functions com payloads malformados ou tipos de dados inesperados (ex: enviar string onde se espera número).
    > **Resultado:** A API retornou erro `22P02` ("invalid input syntax for type numeric").
    > **Análise:** O PostgreSQL validou o tipo de dado e rejeitou a entrada incorreta. Comportamento seguro.

[x] Sensitive Data Exposure: Verificar se logs de erro da API retornam stack traces ou informações sobre a estrutura interna do banco. (Audit Logs sanitizados)

Infraestrutura e Domínio (rhrededmi.com.br) [x] Configuração SSL/TLS: Verificar se o site força HTTPS e se utiliza protocolos modernos (TLS 1.2+).
    > **Resultado:** Redirecionamento automático para HTTPS confirmado.
[x] Security Headers: Checar a presença de headers de segurança:

Content-Security-Policy (CSP)

X-Frame-Options (contra Clickjacking)

Strict-Transport-Security (HSTS)

[x] CORS Policy: Garantir que o Supabase e suas funções só aceitem requisições vindas do domínio oficial.
    > **Resultado:** `Access-Control-Allow-Origin: *`.
    > **Análise:** A API é pública por padrão. Como a autenticação usa Bearer Tokens (não cookies) e RLS está ativo, o risco é mitigado. Para restringir a origem, seria necessário usar um Proxy ou Edge Functions.