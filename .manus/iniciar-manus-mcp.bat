@echo off
echo ========================================
echo  Iniciando servidor MCP para o Manus...
echo ========================================
echo.

REM Inicia o supergateway na porta 8080 usando caminho curto (sem espacos)
echo [1/2] Iniciando MCP Filesystem Server na porta 8080...
start "MCP Filesystem Server" powershell -ExecutionPolicy Bypass -Command "supergateway --stdio 'npx @modelcontextprotocol/server-filesystem C:\Users\SANTAF~1\Desktop\GESTAO~3' --port 8080 --baseUrl http://localhost:8080"

timeout /t 5 /nobreak >nul

REM Inicia o Cloudflare Tunnel para expor a porta 8080 publicamente
REM A URL gerada e estavel durante toda a sessao e aparece no proprio terminal
echo [2/2] Iniciando tunel Cloudflare...
echo.
start "Cloudflare Tunnel" powershell -ExecutionPolicy Bypass -Command "cloudflared tunnel --url http://localhost:8080"

echo.
echo ========================================
echo  Proximos passos:
echo ========================================
echo.
echo 1. Aguarde a URL aparecer na janela "Cloudflare Tunnel"
echo    Ela tera o formato: https://nome-aleatorio.trycloudflare.com
echo.
echo 2. Copie essa URL e adicione /mcp no final:
echo    Exemplo: https://nome-aleatorio.trycloudflare.com/mcp
echo.
echo 3. No Manus, va em: Configuracoes > Conectores > + Adicionar > Custom MCP
echo    - Nome: gestaorecursoshumanos (ou o nome que preferir)
echo    - URL: a URL copiada acima (com /mcp no final)
echo    - Transporte: Streamable HTTP
echo.
pause
