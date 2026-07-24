package com.backend.smarttransithub.controllers;

import java.util.ArrayList;
import java.util.List;

import org.modelmapper.ModelMapper;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.backend.smarttransithub.dtos.request.StopRequest;
import com.backend.smarttransithub.dtos.request.StudentRequest;
import com.backend.smarttransithub.dtos.request.UserRequest;
import com.backend.smarttransithub.dtos.response.StopResponse;
import com.backend.smarttransithub.dtos.response.StudentResponse;
import com.backend.smarttransithub.dtos.response.UserResponse;
import com.backend.smarttransithub.entities.Stop;
import com.backend.smarttransithub.entities.Student;
import com.backend.smarttransithub.entities.User;
import com.backend.smarttransithub.enums.Role;
import com.backend.smarttransithub.services.AdminService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;
    private final ModelMapper modelMapper;

    @GetMapping("/users")
    public ResponseEntity<?> getUsers(@RequestParam Role role) {
    	
    	List<UserResponse> response = adminService.getUsers(role)
    	        .stream()
    	        .map(user -> modelMapper.map(user, UserResponse.class))
    	        .toList();
    	
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/users")
    public ResponseEntity<?> createUser(@RequestBody UserRequest request)
    {
    	User user = adminService.createUser(request);
    	UserResponse response = modelMapper.map(user, UserResponse.class);
    	
    	return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    @PutMapping("/users/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody UserRequest request)
    {
    	User user = adminService.updateUser(id, request);
    	UserResponse response = modelMapper.map(user, UserResponse.class);

    	return ResponseEntity.ok(response);
    }
    
    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id)
    {
    	adminService.deleteUser(id);
    	
    	return ResponseEntity.status(HttpStatus.NO_CONTENT).body("User deleted");
    }
    
    @GetMapping("/routes/{routeId}/stops")
    public ResponseEntity<?> getStops(@PathVariable Long routeId) {

        List<StopResponse> response = adminService.getStops(routeId).stream().map(stop -> modelMapper.map(routeId, StopResponse.class)).toList();

        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/routes/{routeId}/stops")
    public ResponseEntity<?> saveStops(@PathVariable Long routeId, @RequestBody List<StopRequest> request) {

    	List<StopResponse> response =
    	        adminService.saveStops(routeId, request)
    	        .stream()
    	        .map(stop -> modelMapper.map(stop, StopResponse.class))
    	        .toList();

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    @GetMapping("/students")
    public ResponseEntity<?> getStudents() {

        List<StudentResponse> response = new ArrayList<>();

        for (Student student : adminService.getStudents()) {

            StudentResponse dto = new StudentResponse();

            dto.setId(student.getId());
            dto.setFirstName(student.getFirstName());
            dto.setLastName(student.getLastName());
            dto.setRollNumber(student.getRollNumber());

            dto.setParentId(student.getParent().getId());
            dto.setParentName(student.getParent().getFullName());

            dto.setStopId(student.getStop().getId());
            dto.setStopName(student.getStop().getStopName());

            response.add(dto);
        }

        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/students")
    public ResponseEntity<?> createStudent(@RequestBody StudentRequest request) {

        Student student = adminService.createStudent(request);

        StudentResponse response = new StudentResponse();

        response.setId(student.getId());
        response.setFirstName(student.getFirstName());
        response.setLastName(student.getLastName());
        response.setRollNumber(student.getRollNumber());

        response.setParentId(student.getParent().getId());
        response.setParentName(student.getParent().getFullName());

        response.setStopId(student.getStop().getId());
        response.setStopName(student.getStop().getStopName());

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    @PutMapping("/students/{id}")
    public ResponseEntity<StudentResponse> updateStudent(@PathVariable Long id, @RequestBody StudentRequest request) {

        Student student = adminService.updateStudent(id, request);

        StudentResponse response = new StudentResponse();

        response.setId(student.getId());
        response.setFirstName(student.getFirstName());
        response.setLastName(student.getLastName());
        response.setRollNumber(student.getRollNumber());

        response.setParentId(student.getParent().getId());
        response.setParentName(student.getParent().getFullName());

        response.setStopId(student.getStop().getId());
        response.setStopName(student.getStop().getStopName());

        return ResponseEntity.ok(response);
    }
    
    @DeleteMapping("/students/{id}")
    public ResponseEntity<Void> deleteStudent(@PathVariable Long id) {

        adminService.deleteStudent(id);

        return ResponseEntity.noContent().build();
    }

}
