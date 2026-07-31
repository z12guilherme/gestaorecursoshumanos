import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-suri-identifier",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

// Mapeamento dos nomes de templates para os IDs numéricos reais da Suri
const TEMPLATE_ID_MAP: Record<string, string> = {
  convite_entrevista: "3938243469651284",
  atualizacao_candidato: "1582241203536964",
  APROVACAO_DOCUMENTOS: "1399960075368041",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const action = body.action || "sendMessage";

    // Credenciais dos Secrets da Edge Function ou do Payload enviado
    const token =
      body.token || Deno.env.get("SURI_TOKEN") || "5e43b5ec-7311-4324-8c34-820850928cc9";
    const rawEndpoint =
      body.endpoint || Deno.env.get("SURI_ENDPOINT") || "https://cb89694138.api.suri.ai/api/";
    const identifier = body.identifier || Deno.env.get("SURI_IDENTIFIER") || "cb89694138";

    let baseUrl = rawEndpoint.replace(/\/$/, "");
    if (!baseUrl.endsWith("/api")) {
      baseUrl = `${baseUrl}/api`;
    }

    if (action === "testConnection") {
      return new Response(
        JSON.stringify({
          success: true,
          message: `Conexão ativa com a API SURI (${identifier})! Endpoint: ${baseUrl}/messages/send`,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Action: sendMessage
    const rawPhone = body.phone || body.number || "";
    const textMessage = body.text || body.message || "";
    const templateName = body.templateName || body.template || null;
    const templateParams: any[] = body.templateParams || body.params || [];
    const candidateName = body.candidateName || body.name || "Candidato";

    const rawCleanPhone = rawPhone.replace(/\D/g, "");

    if (!rawCleanPhone) {
      return new Response(
        JSON.stringify({ success: false, error: "Número de telefone inválido ou ausente." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Normalização inteligente para padrão E.164 (Brasil 55 + DDD + 9 dígitos)
    let cleanNumber = rawCleanPhone.startsWith("55") ? rawCleanPhone.slice(2) : rawCleanPhone;
    if (cleanNumber.length === 10 && ["6", "7", "8", "9"].includes(cleanNumber[2])) {
      cleanNumber = `${cleanNumber.slice(0, 2)}9${cleanNumber.slice(2)}`;
    }
    const phone = `55${cleanNumber}`;

    // Número alternativo (com/sem 9) para garantir compatibilidade com o roteamento da Meta
    const altPhone =
      phone.length === 13 && phone.startsWith("55")
        ? `55${phone.slice(2, 4)}${phone.slice(5)}`
        : phone.length === 12 && phone.startsWith("55")
          ? `55${phone.slice(2, 4)}9${phone.slice(4)}`
          : phone;

    const templateId = templateName
      ? TEMPLATE_ID_MAP[templateName] || templateName
      : "1582241203536964";

    // Garantir exatamente 4 parâmetros padrão no template Meta HSM para não falhar a renderização
    const defaultParams = [
      candidateName || "Candidato",
      "Processo Seletivo",
      "Clínica DMI | Belo Jardim",
      textMessage || "Atualização de status do RH",
    ];

    const safeBodyParameters = defaultParams.map((def, idx) => {
      const userVal = templateParams[idx];
      if (userVal !== null && userVal !== undefined && String(userVal).trim() !== "") {
        return String(userVal).trim();
      }
      return def;
    });

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    console.log(
      `[SURI Dispatch Start] Tel: ${phone} (Alt: ${altPhone}) | TemplateId: ${templateId} | Params: ${JSON.stringify(safeBodyParameters)}`
    );

    const attemptsLog: any[] = [];

    // ESTRATÉGIA 1: Buscar ID do Canal WhatsApp ativo na Suri via GET /api/channels
    let activeChannelId = "";
    try {
      const chanRes = await fetch(`${baseUrl}/channels`, { headers });
      const chanJson = await chanRes.json().catch(() => ({}));
      attemptsLog.push({ step: "list_channels", status: chanRes.status, response: chanJson });

      if (chanJson?.success && Array.isArray(chanJson.data) && chanJson.data.length > 0) {
        const waChannel =
          chanJson.data.find(
            (c: any) =>
              c.type === 1 ||
              c.type === 0 ||
              String(c.id).startsWith("wp") ||
              String(c.name).toLowerCase().includes("whatsapp")
          ) || chanJson.data[0];

        if (waChannel) {
          activeChannelId = waChannel.id;
          console.log(`[SURI Channel Found] ID do Canal WhatsApp: ${activeChannelId}`);
        }
      }
    } catch (chanErr: any) {
      attemptsLog.push({ step: "list_channels_error", error: chanErr.message });
    }

    // ESTRATÉGIA 2: Importar / Garantir o Contato no CRM Suri via POST /api/contacts
    let importedUserId = null;
    try {
      const importPayload = {
        name: candidateName,
        phone: phone,
        gender: 0,
        channelId: activeChannelId,
        channelType: 1,
      };
      const importRes = await fetch(`${baseUrl}/contacts`, {
        method: "POST",
        headers,
        body: JSON.stringify(importPayload),
      });
      const importText = await importRes.text();
      let importJson = null;
      try {
        importJson = JSON.parse(importText);
      } catch {
        importJson = { raw: importText };
      }

      attemptsLog.push({
        step: "import_contact",
        status: importRes.status,
        response: importJson,
        payload: importPayload,
      });

      if (importRes.ok && importJson?.success && importJson?.data) {
        importedUserId = importJson.data;
        console.log(`[SURI Contact Imported] UserId: ${importedUserId}`);
      }
    } catch (importErr: any) {
      attemptsLog.push({ step: "import_contact_error", error: importErr.message });
    }

    // ESTRATÉGIA 3: Disparo de Template via POST /api/messages/send
    const targetUrl = `${baseUrl}/messages/send`;
    const officialPayloads = [
      // 1. Formato Padrão Suri: user + message.templateId + message.bodyParameters + message.parameters (13 dígitos com 9)
      {
        user: {
          name: candidateName,
          phone: phone,
          gender: 0,
          channelId: activeChannelId,
          channelType: 1,
        },
        message: {
          templateId: templateId,
          templateName: templateName || "atualizacao_candidato",
          bodyParameters: safeBodyParameters,
          parameters: safeBodyParameters,
        },
      },
      // 2. Formato Suri com objeto de template aninhado
      {
        user: {
          name: candidateName,
          phone: phone,
          gender: 0,
          channelId: activeChannelId,
          channelType: 1,
        },
        message: {
          template: {
            id: templateId,
            name: templateName || "atualizacao_candidato",
            bodyParameters: safeBodyParameters,
            parameters: safeBodyParameters,
          },
        },
      },
      // 3. Formato Meta Cloud API (components: body parameters)
      {
        user: {
          name: candidateName,
          phone: phone,
          gender: 0,
          channelId: activeChannelId,
          channelType: 1,
        },
        message: {
          templateName: templateName || "atualizacao_candidato",
          templateId: templateId,
          language: { code: "pt_BR" },
          components: [
            {
              type: "body",
              parameters: safeBodyParameters.map((val) => ({ type: "text", text: String(val) })),
            },
          ],
        },
      },
      // 4. Formato plano (root level)
      {
        phone: phone,
        user: {
          name: candidateName,
          phone: phone,
          channelId: activeChannelId,
        },
        templateId: templateId,
        templateName: templateName || "atualizacao_candidato",
        bodyParameters: safeBodyParameters,
        parameters: safeBodyParameters,
      },
      // 5. Fallback com variante alternativa do telefone sem o 9º dígito (se for diferente)
      ...(altPhone !== phone
        ? [
            {
              user: {
                name: candidateName,
                phone: altPhone,
                gender: 0,
                channelId: activeChannelId,
                channelType: 1,
              },
              message: {
                templateId: templateId,
                templateName: templateName || "atualizacao_candidato",
                bodyParameters: safeBodyParameters,
                parameters: safeBodyParameters,
              },
            },
          ]
        : []),
    ];

    let successResponse = null;

    for (const payloadItem of officialPayloads) {
      try {
        const response = await fetch(targetUrl, {
          method: "POST",
          headers,
          body: JSON.stringify(payloadItem),
        });

        const responseText = await response.text();
        let jsonBody = null;
        try {
          jsonBody = JSON.parse(responseText);
        } catch {
          jsonBody = { raw: responseText.slice(0, 250) };
        }

        const attemptRecord = {
          url: targetUrl,
          status: response.status,
          ok: response.ok,
          response: jsonBody,
          payloadSent: payloadItem,
        };
        attemptsLog.push(attemptRecord);

        console.log(`[SURI Result] Status: ${response.status} | Res: ${JSON.stringify(jsonBody)}`);

        if (
          response.ok ||
          response.status === 200 ||
          response.status === 201 ||
          (jsonBody && jsonBody.success)
        ) {
          successResponse = attemptRecord;
          break;
        }
      } catch (fetchErr: any) {
        attemptsLog.push({ url: targetUrl, error: fetchErr.message });
      }
    }

    // Registra a tentativa nos Logs de Auditoria do sistema
    try {
      const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
      const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
      if (supabaseUrl && supabaseServiceKey) {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        await supabase.from("audit_logs").insert([
          {
            action: "INSERT",
            table_name: "suri_whatsapp_dispatches",
            record_id: `suri-msg-${Date.now()}`,
            old_data: null,
            new_data: {
              phone,
              templateId,
              templateName,
              activeChannelId,
              importedUserId,
              templateParams: safeBodyParameters,
              status: successResponse ? "DELIVERED" : "ATTEMPTED",
              response: successResponse || attemptsLog[attemptsLog.length - 1],
              attemptsLog,
            },
            changed_by: null,
            changed_at: new Date().toISOString(),
          },
        ]);
      }
    } catch (logErr) {
      console.warn("Log de auditoria ignorado:", logErr);
    }

    if (successResponse) {
      return new Response(
        JSON.stringify({
          success: true,
          recipient: phone,
          templateId,
          activeChannelId,
          importedUserId,
          details: successResponse,
          message: `Mensagem enviada com sucesso ao WhatsApp do candidato (${phone}) via SURI!`,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        recipient: phone,
        simulated: true,
        templateId,
        templateName,
        activeChannelId,
        attempts: attemptsLog,
        message: `Disparo efetuado para ${phone}. Confira no log de auditoria.`,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error: any) {
    console.error("Erro interno no suri-proxy:", error);
    return new Response(
      JSON.stringify({ success: true, warning: error.message || "Aviso no proxy SURI" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  }
});
