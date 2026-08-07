package com.backend.smarttransithub.services;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.backend.smarttransithub.dtos.request.NotificationRequestDto;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class NotificationClient {

	private final RestTemplate restTemplate;

    public void sendNotification(String token, String title,String body) {

    	System.out.println("==================================");
        System.out.println("FCM SERVICE CALLED");
        System.out.println("Title : " + title);
        System.out.println("Body  : " + body);
        System.out.println("Token : " + token);
        System.out.println("==================================");
    	
        NotificationRequestDto request = new NotificationRequestDto(token,title,body);

        restTemplate.postForEntity(
            "http://localhost:5000/api/notifications/send",
            request,
            Void.class);
    }
}
