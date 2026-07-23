package com.backend.smarttransithub.config;

import java.io.IOException;
import java.io.InputStream;

import org.springframework.core.io.ClassPathResource;

import com.google.api.client.util.Value;
import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;

import jakarta.annotation.PostConstruct;

public class FcmConfig {

    @Value("${firebase.config.file}")
    private String firebaseConfigFile;
    @PostConstruct
    public void initializeFirebase(){
        try{
            InputStream serviceAccount = new ClassPathResource(firebaseConfigFile).getInputStream();

            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                    .build();
            if(FirebaseApp.getApps().isEmpty()){
                FirebaseApp.initializeApp(options);
                System.out.println("Firebase Application has been initialized successfully.");
            }
        }
        catch (IOException e) {
            System.out.println("Error initializing Firebase: " + e.getMessage());
        }
    }
    
}
