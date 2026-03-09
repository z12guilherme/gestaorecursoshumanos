// supabase/functions/validate-pin/index.ts
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
    const { employee_id, pin } = await req.json();

    if (!employee_id || !pin) {
      throw new Error("ID do funcionário e PIN são obrigatórios.");
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? '',
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ''
    );

    // 1. Busca o hash da senha do funcionário no banco
    const { data: employee, error } = await supabaseAdmin
      .from('employees')
      .select('password')
      .eq('id', employee_id)
      .single();

    if (error || !employee || !employee.password) {
      throw new Error("Funcionário não encontrado ou sem senha cadastrada.");
    }

    // 2. Compara o PIN digitado com o hash salvo
    const isValid = await bcrypt.compare(pin, employee.password);

    return new Response(JSON.stringify({ isValid }), {
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