package com.backend.smarttransithub.controllers;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.backend.smarttransithub.dtos.request.LoginDto;
import com.backend.smarttransithub.dtos.request.RegisterDto;
import com.backend.smarttransithub.dtos.response.ApiResponse;
import com.backend.smarttransithub.services.AuthService;
import com.backend.smarttransithub.services.RegisterService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;
    private final RegisterService registerService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginDto request) {
        return ResponseEntity.ok(authService.authenticateUser(request));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterDto request) {
        ApiResponse response = registerService.addUser(request);
        if ("failed".equalsIgnoreCase(response.getStatus())) {
            return ResponseEntity.badRequest().body(response);
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        return ResponseEntity.ok("Logout successful");
    }
}