package com.backend.smarttransithub.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.backend.smarttransithub.dtos.request.LoginDto;
import com.backend.smarttransithub.services.AuthService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth")
public class AuthController {

	private final AuthService authService;
	
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginDto loginDto) {
        // Implement login logic here
        return ResponseEntity.ok(authService.authenticateUser(loginDto));
    }
    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        // Implement logout logic here
    	//especially for refresh token
        return ResponseEntity.ok("Logout successful");
    }
}