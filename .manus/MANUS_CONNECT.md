# Conectando o Manus ao Seu Projeto via MCP

> **O que é isso?** Este guia explica como conectar o Manus (o agente de IA) diretamente ao sistema de arquivos do seu computador, permitindo que ele leia, crie e edite arquivos em qualquer projeto local — como este aqui.

---

## Como Funciona

O Manus se conecta ao seu computador através do protocolo **MCP (Model Context Protocol)**, um padrão aberto criado pela Anthropic. A arquitetura é simples:

```
Manus (nuvem)  ←──── HTTPS/MCP ────→  Cloudflare Tunnel  ←──→  supergateway (porta 8080)  ←──→  Servidor MCP  ←──→  Arquivos locais
```

O servidor MCP roda localmente na sua máquina e expõe uma pasta específica. O `supergateway` converte esse servidor (que usa stdio) em um endpoint HTTP. O Cloudflare Tunnel cria uma URL pública segura. O Manus usa essa URL para se comunicar.

---

## Pré-requisitos

| Ferramenta | Instalação | Para que serve |
| :--- | :--- | :--- |
| **Node.js** (v18+) | [nodejs.org](https://nodejs.org) | Rodar o servidor MCP |
| **npx** | Incluído com Node.js | Executar pacotes sem instalar |
| **supergateway** | `npm install -g supergateway` | Converter stdio → HTTP (Streamable HTTP) |
| **cloudflared** | [Baixar aqui](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/) | Criar URL pública gratuita, sem conta |

> **Sobre o cloudflared:** Não requer criação de conta. Basta baixar o executável, colocar em qualquer pasta do PATH e executar. A URL gerada é estável durante toda a sessão do terminal.

---

## Passo a Passo

### 1. Instalar o supergateway

```bash
npm install -g supergateway
```

O `supergateway` converte o servidor MCP (que usa stdio) em um servidor HTTP com suporte a Streamable HTTP e SSE — os dois protocolos que o Manus aceita.

### 2. Iniciar o servidor MCP com supergateway

Abra um terminal e execute:

```cmd
supergateway --stdio "npx @modelcontextprotocol/server-filesystem ..\.." --port 8080 --baseUrl http://localhost:8080
```

**Substitua** `C:\Caminho\Para\Seu\Projeto` pelo caminho real da pasta que deseja expor.

> **Dica de segurança:** Exponha apenas a pasta do projeto, nunca `C:\` ou `C:\Users`. O servidor MCP restringe o acesso ao diretório informado.

> **Caminhos com espaços:** Se o caminho contiver espaços (ex: `C:\Users\santa fe\...`), use o formato curto do Windows (`SANTAF~1`) ou coloque o caminho entre aspas simples dentro do comando PowerShell.

### 3. Criar o túnel público com Cloudflare

Em um **segundo terminal**, execute:

```bash
cloudflared tunnel --url http://localhost:8080
```

Aguarde até aparecer uma linha como:

```
Your quick Tunnel has been created! Visit it at (it may take some time to be reachable):
https://nome-aleatorio.trycloudflare.com
```

Copie essa URL.

### 4. Configurar o Manus

1. No Manus, vá em **Configurações → Conectores → + Adicionar → Custom MCP**.
2. Preencha:
   - **Nome:** Nome do seu projeto (ex: `Meu Projeto React`)
   - **URL:** A URL do túnel + `/mcp` → `https://nome-aleatorio.trycloudflare.com/mcp`
   - **Transporte:** `Streamable HTTP`
3. Salve e ative o conector.

> **Atenção:** A URL deve terminar com `/mcp`. Sem esse sufixo, o Manus receberá erro `405 Method Not Allowed`.

### 5. Testar a conexão

No Manus, peça: *"Liste os arquivos do meu projeto"*. O Manus deverá responder com o conteúdo da pasta que você expôs.

---

## Script de Inicialização Rápida (Windows)

Este projeto já inclui o arquivo `iniciar-manus-mcp.bat` na pasta `.manus` que automatiza os passos 2 e 3. Basta dar duplo clique nele:

```bat
@echo off
echo Iniciando servidor MCP para o Manus...

REM Passo 1: Inicia o MCP Filesystem Server via supergateway na porta 8080
start "MCP Filesystem Server" powershell -ExecutionPolicy Bypass -Command ^
  "supergateway --stdio 'npx @modelcontextprotocol/server-filesystem C:\Users\SANTAF~1\Desktop\GESTAO~3' --port 8080 --baseUrl http://localhost:8080"

timeout /t 5 /nobreak >nul

REM Passo 2: Inicia o Cloudflare Tunnel — a URL aparece no terminal desta janela
start "Cloudflare Tunnel" powershell -ExecutionPolicy Bypass -Command ^
  "cloudflared tunnel --url http://localhost:8080"
```

Após executar, copie a URL `https://....trycloudflare.com` que aparecer na janela **"Cloudflare Tunnel"** e adicione `/mcp` no final ao configurar no Manus.

---

## Adaptando para Outro Projeto

Para conectar o Manus a um projeto diferente:

1. **Copie** o arquivo `iniciar-manus-mcp.bat` para a pasta `.manus` do novo projeto.
2. **Edite** a linha do `supergateway`, trocando o caminho pelo do novo projeto:
   ```bat
   supergateway --stdio 'npx @modelcontextprotocol/server-filesystem C:\Caminho\Novo\Projeto' --port 8080 --baseUrl http://localhost:8080
   ```
3. **Execute** o `.bat` e copie a URL do Cloudflare Tunnel para o Manus.

Cada projeto pode ter seu próprio conector no Manus — basta adicionar um novo servidor MCP com a URL correspondente.

---

## Solução de Problemas

| Problema | Causa provável | Solução |
| :--- | :--- | :--- |
| `405 Method Not Allowed` | URL sem `/mcp` no final | Adicione `/mcp` ao final da URL no conector |
| `502 Bad Gateway` | O servidor local ou o túnel foi encerrado | Reinicie o `iniciar-manus-mcp.bat` |
| `Bad Request: No valid session ID` | Sessão MCP não inicializada | O Manus gerencia isso automaticamente; se persistir, reinicie o conector |
| Caminhos com espaços não funcionam | Windows não aceita espaços em alguns contextos | Use o formato curto (`NOME~1`) ou aspas simples dentro do PowerShell |
| URL do túnel mudou | O Cloudflare Tunnel gera nova URL a cada reinício | Atualize a URL no conector do Manus após reiniciar |
| `cloudflared` não encontrado | Executável não está no PATH | Coloque o `cloudflared.exe` em `C:\Windows\System32` ou adicione ao PATH |

---

## Referências

- [Model Context Protocol — Documentação Oficial](https://modelcontextprotocol.io)
- [supergateway no npm](https://www.npmjs.com/package/supergateway)
- [MCP Filesystem Server no GitHub](https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem)
- [Cloudflare Tunnel — Download](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/)

---

*Atualizado pelo Manus em 18 de junho de 2026.*
