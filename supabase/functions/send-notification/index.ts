import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import webpush from 'https://esm.sh/web-push@3.6.7';

// Configure as chaves VAPID (use os segredos do Supabase para isso)
// npx supabase secrets set VAPID_PUBLIC_KEY=...
// npx supabase secrets set VAPID_PRIVATE_KEY=...
webpush.setVapidDetails(
  'mailto:admin@gestaorh.com',
  Deno.env.get('VAPID_PUBLIC_KEY')!,
  Deno.env.get('VAPID_PRIVATE_KEY')!
);

Deno.serve(async (req) => {
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
  );

  // Payload: { user_ids: string[], payload: { title: string, body: string } }
  const { user_ids, payload } = await req.json();

  // 1. Buscar as inscrições dos usuários alvo
  const { data: subscriptions, error } = await supabaseClient
    .from('push_subscriptions')
    .select('subscription_details')
    .in('user_id', user_ids);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  // 2. Enviar a notificação para cada inscrição
  const promises = subscriptions.map(s =>
    webpush.sendNotification(
      s.subscription_details,
      JSON.stringify(payload)
    ).catch(err => console.error(`Failed to send to endpoint`, err.statusCode))
  );

  await Promise.all(promises);

  return new Response(JSON.stringify({ message: 'Notifications sent!' }), {
    headers: { 'Content-Type': 'application/json' },
  });
});