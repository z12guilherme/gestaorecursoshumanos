import { supabase } from '@/lib/supabase';

// IMPORTANTE: Gere suas chaves rodando "npx web-push generate-vapid-keys" no terminal
// e substitua a string abaixo pela sua Public Key gerada.
const VAPID_PUBLIC_KEY = 'BGbuc-h62SxsxUA1aVyFnS17o6iFav6CXBokh9xM1kZb1JV_HCH4dFKYhUue6tVWLMfdduQkdcqA4wYCBWtyNFo'; 

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function subscribeToPushNotifications() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('Push notifications are not supported by this browser.');
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register('/service-worker.js');
    let subscription = await registration.pushManager.getSubscription();

    if (subscription === null) {
      console.log('User is not subscribed. Subscribing...');
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      // Envia a inscrição para o seu backend (Supabase)
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('push_subscriptions').insert({
          user_id: user.id,
          subscription_details: subscription,
        });
        console.log('User subscribed successfully.');
      }
    } else {
      console.log('User is already subscribed.');
    }
  } catch (error) {
    console.error('Failed to subscribe to push notifications:', error);
  }
}