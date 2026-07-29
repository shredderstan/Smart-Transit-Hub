package com.backend.smarttransithub.controllers;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.backend.smarttransithub.dtos.request.NotificationTokenDto;
import com.backend.smarttransithub.services.ParentService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/parent")
@RequiredArgsConstructor
public class ParentController {

    private final ParentService parentService;

    @GetMapping("/student/profile")
    public ResponseEntity<?> getStudents(@AuthenticationPrincipal Long userId) {
        return ResponseEntity.ok(parentService.getStudents(userId));
    }

    @GetMapping("/active-trip")
    public ResponseEntity<?> getActiveTrip(@AuthenticationPrincipal Long userId) {
        Map<String, Object> data = parentService.getActiveTripForParent(userId);
        if (data == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(data);
    }

    @GetMapping("/trips/{tripId}/latest")
    public ResponseEntity<?> getLatestTripData(@PathVariable Long tripId) {
        var data = parentService.getLatestTripData(tripId);
        if (data == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(data);
    }

    @GetMapping("/trips/{tripId}/stops")
    public ResponseEntity<?> getTripStops(@PathVariable Long tripId) {
        return ResponseEntity.ok(parentService.getTripStops(tripId));
    }

    @GetMapping("/routes/{routeId}/stops")
    public ResponseEntity<?> getRouteStops(@PathVariable Long routeId) {
        return ResponseEntity.ok(parentService.getRouteStops(routeId));
    }

    @PostMapping("/notifications/register-token")
    public ResponseEntity<?> registerNotificationToken(@AuthenticationPrincipal Long userId,
            @RequestBody NotificationTokenDto notificationTokenDto) {
        return ResponseEntity.ok(parentService.registerNotificationToken(userId, notificationTokenDto));
    }

    @PostMapping("/notifications/remove-token")
    public ResponseEntity<?> removeNotificationToken(@AuthenticationPrincipal Long userId, @RequestBody NotificationTokenDto notificationTokenDto) {
        return ResponseEntity.ok(parentService.removeNotificationToken(userId, notificationTokenDto));
    }
}
