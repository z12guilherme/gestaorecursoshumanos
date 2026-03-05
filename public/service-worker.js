self.addEventListener('push', function(event) {
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/pwa-192x192.png', // Certifique-se de ter este ícone ou ajuste o nome
    badge: '/pwa-192x192.png',
  };
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});