// supabase/functions/hash-password/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import * as bcrypt from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { record } = await req.json();

    // Se uma nova senha foi fornecida, gere o hash
    if (record.password && record.password.length > 0) {
      const salt = await bcrypt.genSalt(10);
      record.password = await bcrypt.hash(record.password, salt);
    } else {
      // Se a senha estiver vazia, remova-a para não sobrescrever um hash existente com null
      delete record.password;
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? '',
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ''
    );

    // Faz o upsert (cria ou atualiza) do funcionário com a senha hasheada
    const { data: employee, error } = await supabaseAdmin
      .from('employees')
      .upsert(record)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return new Response(JSON.stringify({ employee: employee }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});