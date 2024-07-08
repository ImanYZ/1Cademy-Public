importScripts("https://www.gstatic.com/firebasejs/8.2.0/firebase-app.js");
importScripts("https://www.gstatic.com/firebasejs/8.2.0/firebase-messaging.js");

const firebaseConfig = {
  apiKey: "AIzaSyBh12u1NPq2__vRScwn6oeqnWerjGm4ZEg",
  authDomain: "onecademy-1.firebaseapp.com",
  databaseURL: "https://onecademy-1.firebaseio.com",
  projectId: "onecademy-1",
  storageBucket: "onecademy-1.appspot.com",
  messagingSenderId: "731671946677",
  appId: "1:731671946677:web:75dc8935cee89bd4",
};

firebase.initializeApp(firebaseConfig);

// Retrieve firebase messaging
const messaging = firebase.messaging();

messaging.onBackgroundMessage(payload => {
  console.log("Received background message ", payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    data: {
      click_action: "https://1cademy.com/notebook",
      ...payload.data,
    },
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  const urlToOpen = event.notification.data.click_action;
  event.waitUntil(
    clients
      .matchAll({
        type: "window",
        includeUncontrolled: true,
      })
      .then(function (clientList) {
        let matchingClient = null;
        console.log(clientList, "clientList");

        // Check if the specific tab is already open
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url.includes(urlToOpen)) {
            matchingClient = client;
            break;
          }
        }

        // Focus the matching client if found
        if (matchingClient) {
          return matchingClient.focus();
        } else {
          // If the URL is not open, open it in a new tab
          if (clients.openWindow) {
            return clients.openWindow(urlToOpen);
          }
        }
      })
      .then(client => {
        if (client) {
          client.postMessage({
            type: "NOTIFICATION_CLICKED",
            url: urlToOpen,
            ...event.notification.data,
          });
        }
      })
  );
});

self.addEventListener("message", event => {
  if (event.data && event.data.type === "FOCUS_TAB") {
    const urlToFocus = event.data.url;
    clients
      .matchAll({
        type: "window",
        includeUncontrolled: true,
      })
      .then(clientList => {
        let matchingClient = null;

        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url.includes(urlToFocus)) {
            matchingClient = client;
            break;
          }
        }

        if (matchingClient) {
          matchingClient.focus();
        } else {
          if (clients.openWindow) {
            clients.openWindow(urlToFocus);
          }
        }
      });
  }
});
