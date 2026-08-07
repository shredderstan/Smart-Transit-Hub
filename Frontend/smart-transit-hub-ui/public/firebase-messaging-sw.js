importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyCCQ1SULBqHncnv-piABHbJ2ETb5YI-U1I",
  authDomain: "smarttransithub-215eb.firebaseapp.com",
  projectId: "smarttransithub-215eb",
  storageBucket: "smarttransithub-215eb.firebasestorage.app",
  messagingSenderId: "333039506149",
  appId: "1:333039506149:web:c99de89e7c71c1b8333a0c",
  measurementId: "G-HLKRECZ76Z"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification?.title || "Smart Transit Hub Alert";
  const notificationOptions = {
    body: payload.notification?.body || "New bus update received.",
    icon: '/favicon.ico'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
