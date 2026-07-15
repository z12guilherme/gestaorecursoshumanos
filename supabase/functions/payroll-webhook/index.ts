import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * Edge Function: payroll-webhook
 *
 * Dispara um webhook HTTP POST para o ERP/sistema contábil configurado
 * quando uma folha de pagamento é fechada.
 *
 * Payload enviado ao ERP:
 *   - Competência (mês/ano)
 *   - Empresa (nome, CNPJ)
 *   - Lista de colaboradores com valores calculados
 *   - Timestamp de fechamento
 *
 * Como usar:
 *   POST /functions/v1/payroll-webhook
 *   Body: { competencia: "2026-06", employees: [...], totals: {...} }
 *
 * Deploy:
 *   supabase functions deploy payroll-webhook
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Cria cliente Supabase com service role para acessar settings
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Lê o payload enviado pelo frontend
    const payload = await req.json();
    const { competencia, employees, totals, companyInfo } = payload;

    if (!competencia || !employees || !Array.isArray(employees)) {
      return new Response(
        JSON.stringify({ error: "Payload inválido. Campos obrigatórios: competencia, employees." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Busca URL do webhook configurada nas settings
    const { data: settings } = await supabase
      .from("settings")
      .select("webhook_url, company_name, cnpj")
      .maybeSingle();

    const webhookUrl = settings?.webhook_url;

    // Monta o payload padrão de integração contábil
    const erpPayload = {
      evento: "FOLHA_FECHADA",
      timestamp: new Date().toISOString(),
      competencia, // ex: "2026-06"
      empresa: {
        nome: companyInfo?.company_name || settings?.company_name || "N/A",
        cnpj: companyInfo?.cnpj || settings?.cnpj || "N/A",
      },
      resumo: {
        total_colaboradores: employees.length,
        total_bruto: totals?.totalBruto ?? 0,
        total_descontos: totals?.totalDescontos ?? 0,
        total_liquido: totals?.totalLiquido ?? 0,
        total_inss: totals?.totalInss ?? 0,
      },
      colaboradores: employees.map((emp: any) => ({
        id: emp.id,
        nome: emp.name,
        cargo: emp.role,
        departamento: emp.department,
        cpf_pis: emp.pis_pasep || null,
        chave_pix: emp.pix_key || null,
        salario_base: emp.baseSalary ?? 0,
        adicionais: emp.totalAdicionais ?? 0,
        descontos: emp.totalDescontos ?? 0,
        inss: emp.estimatedTax ?? 0,
        liquido: emp.netSalary ?? 0,
      })),
    };

    let webhookStatus = "SKIPPED";
    let webhookResponse = null;

    // Envia ao ERP apenas se a URL estiver configurada
    if (webhookUrl) {
      try {
        const response = await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(erpPayload),
          signal: AbortSignal.timeout(10000), // timeout de 10s
        });

        webhookStatus = response.ok ? "SUCCESS" : `ERROR_${response.status}`;
        webhookResponse = { status: response.status, ok: response.ok };
      } catch (fetchErr: any) {
        webhookStatus = `FETCH_ERROR: ${fetchErr.message}`;
        webhookResponse = { error: fetchErr.message };
      }
    }

    // Registra o fechamento na tabela de audit_logs (se existir)
    await supabase
      .from("audit_logs")
      .insert({
        table_name: "payroll",
        action: "FOLHA_FECHADA",
        new_data: {
          competencia,
          total_liquido: totals?.totalLiquido,
          webhook_status: webhookStatus,
        },
      })
      .maybeSingle(); // Ignora erro caso a tabela não tenha as colunas certas

    return new Response(
      JSON.stringify({
        success: true,
        competencia,
        webhook_url: webhookUrl ? "configured" : "not_configured",
        webhook_status: webhookStatus,
        webhook_response: webhookResponse,
        payload_sent: erpPayload,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("Erro na Edge Function payroll-webhook:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
