/* global self */
// Firebase Messaging service worker for web push notifications
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

// The app config is embedded at build. For local dev you can inline or fetch.
self.firebaseConfig = self.firebaseConfig || {
  apiKey: "AIzaSyD9mzyGX0GMeS_ASyVawUf6lpV1h97gt_0",
  authDomain: "depsure-a9b61.firebaseapp.com",
  projectId: "depsure-a9b61",
  storageBucket: "depsure-a9b61.firebasestorage.app",
  messagingSenderId: "656713548553",
  appId: "1:656713548553:web:8ce67c5c807bcab02709d8"
};

firebase.initializeApp(self.firebaseConfig);
const messaging = firebase.messaging();

// Optional: handle background messages for data-only payloads to avoid duplicates.
// If the payload already contains a `notification`, most browsers will show it automatically.
messaging.onBackgroundMessage((payload) => {
  try {
    if (payload && payload.notification) {
      // Let the browser/FCM show the notification to prevent double popups
      return;
    }
    const data = payload?.data || {};
    const title = data.title || 'New message';
    const body = data.body || '';
    self.registration.showNotification(title, {
      body,
      data,
      icon: '/favicon.ico'
    });
  } catch (e) {}
});

// Click handler to focus/open app
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  const target = (event.notification && event.notification.data && event.notification.data.click_action) || '/chat';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      for (const client of clientList) {
        try {
          const url = new URL(client.url);
          if (url && url.pathname && url.pathname.startsWith(target)) {
            return client.focus();
          }
        } catch {}
      }
      return self.clients.openWindow(target);
    })
  );
});
