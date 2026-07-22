package com.backend.smarttransithub.controllers;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.backend.smarttransithub.dtos.request.UserRequest;
import com.backend.smarttransithub.dtos.response.UserResponse;
import com.backend.smarttransithub.entities.User;
import com.backend.smarttransithub.enums.Role;
import com.backend.smarttransithub.services.AdminService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/users")
    public ResponseEntity<?> getUsers(@RequestParam Role role) {
    	
    	List<UserResponse> response = adminService.getUsers(role).stream()
    			.map(user -> new UserResponse(user.getId(), user.getUsername(), user.getFullName(), user.getPhoneNumber(), user.getRole(), user.getIsActive())).toList();
    	
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/users")
    public ResponseEntity<?> createUser(@RequestBody UserRequest request)
    {
    	User user = adminService.createUser(request);
    	UserResponse response = new UserResponse();
    	
    	response.setId(user.getId());
    	response.setUsername(user.getUsername());
    	response.setFullName(user.getFullName());
    	response.setPhoneNumber(user.getPhoneNumber());
    	response.setRole(user.getRole());
    	response.setIsActive(user.getIsActive());
    	
    	return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    

}
