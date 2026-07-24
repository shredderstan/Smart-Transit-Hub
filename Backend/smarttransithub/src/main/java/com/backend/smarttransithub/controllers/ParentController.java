package com.backend.smarttransithub.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.backend.smarttransithub.services.ParentService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/parent")
public class ParentController {
    
	private final ParentService parentService;
	
    @GetMapping("/student/profile")
    public ResponseEntity<?> getStudents(@AuthenticationPrincipal Long userId) {
        
        return ResponseEntity.ok(parentService.getStudents(userId));
    }

    @GetMapping("/trips/{tripId}/latest")
    public ResponseEntity<?> getLatestTripData(@PathVariable Long tripId) {
        return ResponseEntity.ok(parentService.getLatestTripData(tripId));
    }

    @PostMapping("/notifications/register-token")
    public ResponseEntity<?> registerNotificationToken(@RequestBody NotificationTokenDto notificationTokenDto) {
        // Implement logic to register notification token for the parent
        return ResponseEntity.ok("Notification token registered successfully");
    }

    @PostMapping("/notifications/remove-token")
    public ResponseEntity<?> removeNotificationToken(@RequestBody NotificationTokenDto notificationTokenDto) {
        // Implement logic to remove notification token for the parent
        return ResponseEntity.ok("Notification token removed successfully");
    }
}
