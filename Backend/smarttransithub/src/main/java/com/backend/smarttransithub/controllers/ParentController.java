package com.backend.smarttransithub.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;
import com.backend.smarttransithub.services.ParentService;

import com.backend.smarttransithub.dtos.request.NotificationTokenDto;
import com.backend.smarttransithub.services.ParentService;

@RestController
@RequestMapping("/api/parent")
@RequiredArgsConstructor
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
    public ResponseEntity<?> registerNotificationToken(@AuthenticationPrincipal Long userId, @RequestBody NotificationTokenDto notificationTokenDto) {
        return ResponseEntity.ok(parentService.registerNotificationToken(userId, notificationTokenDto));
    }

    @PostMapping("/notifications/remove-token")
    public ResponseEntity<?> removeNotificationToken(@RequestBody NotificationTokenDto notificationTokenDto) {
       return ResponseEntity.ok(parentService.removeNotificationToken(userId, notificationTokenDto));
    }
}
