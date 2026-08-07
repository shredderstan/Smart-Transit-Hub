import { useEffect } from "react";
import { getToken, onMessage } from "firebase/messaging";
import { messaging } from "../firebase/firebase";
import {
    registerNotificationToken,
    removeNotificationToken
} from "../services/notificationService";

const VAPID_KEY =
    "BJsWWJYM0u5lM93gDDtuMMgXWLcE-zpPS7xbs3eSoxars-rVfXXx72y0sGpoEnjBHYmI3FQTh3AsbVEqaib0wYw"; 
    
export default function useFCM(user) {

    useEffect(() => {

        if (!user)
            return;

        if (user.role !== "ROLE_PARENT")
            return;

        initializeFCM();

        return () => {
            // Cleanup if needed later
        };

    }, [user]);

    async function initializeFCM() {

        try {

            const permission =
                await Notification.requestPermission();

            if (permission !== "granted") {

                console.log("Notification permission denied.");

                return;
            }

            const token =
                await getToken(messaging, {
                    vapidKey: VAPID_KEY
                });

            if (!token) {

                console.log("Unable to generate token.");

                return;
            }

            console.log("FCM Token:", token);

            localStorage.setItem("fcmToken", token);

            await registerNotificationToken(token);

        }
        catch (err) {

            console.error(err);

        }
    }

    useEffect(() => {

        const unsubscribe =
            onMessage(messaging, (payload) => {

                console.log("Foreground Notification");

                console.log(payload);

                if (Notification.permission === "granted") {

                    new Notification(
                        payload.notification.title,
                        {
                            body: payload.notification.body
                        }
                    );

                }

            });

        return unsubscribe;

    }, []);

    async function unregisterToken() {

        const token =
            localStorage.getItem("fcmToken");

        if (!token)
            return;

        await removeNotificationToken(token);

        localStorage.removeItem("fcmToken");

    }

    return {

        unregisterToken

    };

}