import { initializeApp } from "firebase/app";
import { getMessaging, getToken } from "firebase/messaging";
import api from "../api/client";

const VAPID_KEY =
"BJsWWJYM0u5lM93gDDtuMMgXWLcE-zpPS7xbs3eSoxars-rVfXXx72y0sGpoEnjBHYmI3FQTh3AsbVEqaib0wYw";

const firebaseConfig = {
    apiKey: "AIzaSyA5cPnc1rYo-Mg0J_kR46UsVcU17opuHsc",
    authDomain: "smarttransithub-aaf9a.firebaseapp.com",
    projectId: "smarttransithub-aaf9a",
    storageBucket: "smarttransithub-aaf9a.firebasestorage.app",
    messagingSenderId: "648916569463",
    appId: "1:648916569463:web:92a2d846a000f9561c6572"
};

const app = initializeApp(firebaseConfig);

export const messaging = getMessaging(app);

export async function registerFCMToken() {

    console.log("Inside registerFCMToken");

    const permission = await Notification.requestPermission();

    console.log("Permission =", permission);

    if (permission !== "granted") {
        console.log("Notification permission denied.");
        return;
    }

    const token = await getToken(messaging, {
        vapidKey: VAPID_KEY
    });

    console.log("FCM Token:", token);

    if (!token) {
        console.log("No FCM token generated.");
        return;
    }

    const response = await api.post(
        "/parent/notifications/register-token",
        {
            fcmToken: token,
            platform: "WEB"
        }
    );

    console.log(response.data);
}