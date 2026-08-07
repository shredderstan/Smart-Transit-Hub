package com.backend.smarttransithub.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.backend.smarttransithub.dtos.request.NotificationTokenDto;
import com.backend.smarttransithub.services.DriverService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final DriverService driverService;

    @PostMapping("/register-token")
    public ResponseEntity<?> registerToken(@AuthenticationPrincipal Long userId, @RequestBody NotificationTokenDto dto) {

        return ResponseEntity.ok(driverService.registerNotificationToken(userId, dto));
    }

    @PostMapping("/remove-token")
    public ResponseEntity<?> removeToken(@AuthenticationPrincipal Long userId, @RequestBody NotificationTokenDto dto) {

        return ResponseEntity.ok(driverService.removeNotificationToken(userId, dto));
    }
}