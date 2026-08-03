import { initializeApp } from "firebase/app";
import { getMessaging, getToken } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyCCQ1SULBqHncnv-piABHbJ2ETb5YI-U1I",
  authDomain: "smarttransithub-215eb.firebaseapp.com",
  projectId: "smarttransithub-215eb",
  storageBucket: "smarttransithub-215eb.firebasestorage.app",
  messagingSenderId: "333039506149",
  appId: "1:333039506149:web:c99de89e7c71c1b8333a0c",
  measurementId: "G-HLKRECZ76Z"
};

const app = initializeApp(firebaseConfig);
let messaging = null;

try {
  messaging = getMessaging(app);
} catch (error) {
  console.warn("Firebase Messaging is not supported in this environment.", error);
}

export { app, messaging };

export const requestFcmToken = async () => {
  if (typeof window === "undefined" || !("Notification" in window)) {
    console.warn("This browser does not support notifications.");
    return null;
  }

  if (!messaging) {
    console.warn("Messaging is not initialized.");
    return null;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      const token = await getToken(messaging);
      return token;
    } else {
      console.warn("Notification permission not granted.");
      return null;
    }
  } catch (error) {
    console.error("An error occurred while retrieving FCM token:", error);
    return null;
  }
};
