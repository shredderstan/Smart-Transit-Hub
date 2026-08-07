import api from "../api/client";

export async function registerNotificationToken(token) {
    try {

        const response = await api.post(
            "/notifications/register-token",
            {
                fcmToken: token,
                platform: "WEB"
            }
        );

        console.log("FCM token registered", response.data);

        return response.data;

    } catch (err) {

        console.error("Failed to register FCM token", err);

        throw err;
    }
}

export async function removeNotificationToken(token) {

    try {

        const response = await api.post(
            "/notifications/remove-token",
            {
                fcmToken: token,
                platform: "WEB"
            }
        );

        return response.data;

    } catch (err) {

        console.error(err);

        throw err;
    }
}