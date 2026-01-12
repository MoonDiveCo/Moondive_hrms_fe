importScripts(
  "https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js"
);

firebase.initializeApp({
  apiKey: "AIzaSyAEmKulLR-sE0bogP3gvLxhAtxtBjImwxM",
  authDomain: "hrmsmd.firebaseapp.com",
  projectId: "hrmsmd",
  storageBucket: "hrmsmd.firebasestorage.app",
  messagingSenderId: "631338594096",
  appId: "1:631338594096:web:bcc13b617ed6b5652962f5",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("🌙 Background message received in SW:", payload);

  try {
    self.clients
      .matchAll({
        type: "window",
        includeUncontrolled: true,
      })
      .then((clients) => {
        const visibleClients = clients.filter(
          (client) => client.visibilityState === "visible"
        );
        
        console.log(`Found ${clients.length} clients, ${visibleClients.length} visible`);

        // ONLY show notification if NO client is visible
        if (visibleClients.length === 0) {
          console.log("No visible clients - showing notification");

          const notificationTitle = payload.data.notificationTitle || "New Notification";
          const notificationOptions = {
            body: payload.data.notificationMessage || "You have a new message",
            icon: `${self.location.origin}/logo-icon.svg`,
            badge: `${self.location.origin}/badge.png`,
            tag: payload.data._id || Date.now().toString(),
            data: {
              ...payload.data,
            },
          };

          // self.registration.showNotification(
          //   notificationTitle,
          //   notificationOptions
          // );
        } else {
          console.log("Client is visible - notification handled by foreground listener");
        }

        // Notify all clients about the background message
        clients.forEach((client) => {
          client.postMessage({
            firebaseMessaging: true,
            payload: payload,
            isBackground: true,
            targetUserId: payload.data.receiverId, // Make sure your backend sends this
          });
        });
      })
      .catch((err) => {
        console.error("Error in clients.matchAll:", err);
      });
  } catch (err) {
    console.error("Error in background handler:", err);
  }
});

self.addEventListener("notificationclick", (event) => {
  console.log("🖱️ Notification clicked:", event.notification);

  try {
    event.notification.close();

    event.waitUntil(
      self.clients
        .matchAll({ type: "window", includeUncontrolled: true })
        .then((clientList) => {
          const targetUrl =
            event.notification.data?.click_action || self.location.origin;

          const existingClient = clientList.find((client) =>
            client.url.startsWith(self.location.origin)
          );

          if (existingClient) {
            existingClient.focus();
            existingClient.postMessage({
              firebaseMessaging: true,
              payload: event.notification.data,
              notificationClick: true,
              targetUrl: targetUrl,
            });
          } else {
            self.clients.openWindow(targetUrl);
          }
        })
    );
  } catch (error) {
    console.error("Error in notification click handler:", error);
  }
});