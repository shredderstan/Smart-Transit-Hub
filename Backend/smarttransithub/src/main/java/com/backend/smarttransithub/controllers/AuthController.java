package com.backend.smarttransithub.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/api/auth")
public class AuthController {

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginDto loginDto) {
        // Implement login logic here
        return ResponseEntity.ok("Login successful");
    }
    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        // Implement logout logic here
        return ResponseEntity.ok("Logout successful");
    }
}