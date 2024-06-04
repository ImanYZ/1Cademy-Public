importScripts("https://www.gstatic.com/firebasejs/8.2.0/firebase-app.js");
importScripts("https://www.gstatic.com/firebasejs/8.2.0/firebase-messaging.js");

const defaultConfig = {
  apiKey: "AIzaSyAyfoXvWQIsK1_BTzoTaPMPnBhjr6ZtZpY",
  projectId: "onecademy-dev",
  messagingSenderId: "735079871954",
  appId: "1:735079871954:web:d7de111435f188126e840b",
};

firebase.initializeApp(defaultConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage(payload => {
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
