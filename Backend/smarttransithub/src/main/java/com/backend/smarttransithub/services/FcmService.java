package com.backend.smarttransithub.services;


import org.springframework.stereotype.Service;

import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;



@Service

public class FcmService {
    public void sendNotification(String token, String title, String body)
    {
        if(token==null || token.isBlank())
        {
            System.out.println("Token is null or blank. Cannot send notification.");
            return;
        }
        //Build the notification in Notification Class.
        Notification notification=Notification.builder()
            .setTitle(title)
            .setBody(body)
            .build();

        //Message Creation.
        Message message=Message.builder()
            .setToken(token)
            .setNotification(notification)
            .build();


        FirebaseMessaging.getInstance().sendAsync(message);
    }
}
