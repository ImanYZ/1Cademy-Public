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
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
