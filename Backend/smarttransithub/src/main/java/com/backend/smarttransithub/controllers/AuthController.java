package com.backend.smarttransithub.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.backend.smarttransithub.dtos.request.LoginDto;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
	private final AuthService authService;
	
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginDto request) {
        return ResponseEntity.ok(authService.authenticateUser(request));
    }
    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        // Implement logout logic here
    	//and add refresh token invalidation
        return ResponseEntity.ok("Logout successful");
    }
}