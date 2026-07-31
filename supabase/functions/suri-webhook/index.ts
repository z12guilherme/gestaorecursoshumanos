import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-suri-identifier",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    const eventType = payload.event || payload.type || "message-received";

    console.log(`[SURI Webhook Received] Event: ${eventType}`, JSON.stringify(payload));

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Registra o evento nos logs de auditoria
    await supabase
      .from("audit_logs")
      .insert([
        {
          action: "INSERT",
          table_name: "suri_webhooks",
          record_id: payload.id || payload.message_id || `suri-${Date.now()}`,
          old_data: null,
          new_data: {
            event: eventType,
            payload: payload,
            received_at: new Date().toISOString(),
          },
        },
      ])
      .catch((err) => console.warn("Audit log record skipped:", err));

    return new Response(
      JSON.stringify({ success: true, message: "Webhook SURI recebido e processado." }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error: any) {
    console.error("Erro no processamento do webhook SURI:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
