package com.backend.smarttransithub.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;



@Controller
@RequestMapping("/api/admin")
public class AdminController {

    // Users 
    @GetMapping("/users")   
    public ResponseEntity<?> getAllUsers() {
        // Implement logic to retrieve all users
        return ResponseEntity.ok("Retrieved all users");
    }

    @PostMapping("/users")
    public ResponseEntity<?> createUser(@RequestBody UserDto userDto) {
        // Implement logic to create a new user
        return ResponseEntity.ok("User created successfully");
    }

    // Buses 
    @GetMapping("/buses")
    public ResponseEntity<?> getAllBuses() {
        // Implement logic to retrieve all buses
        return ResponseEntity.ok("Retrieved all buses");
    }

    @PostMapping("/buses")
    public ResponseEntity<?> createBus(@RequestBody BusDto busDto) {
        // Implement logic to create a new bus
        return ResponseEntity.ok("Bus created successfully");
    }

    // Routes
    @GetMapping("/routes")
    public ResponseEntity<?> getAllRoutes() {
        // Implement logic to retrieve all routes
        return ResponseEntity.ok("Retrieved all routes");
    }
    
    @PostMapping("/routes")
    public ResponseEntity<?> createRoute(@RequestBody RouteDto routeDto) {
        // Implement logic to create a new route
        return ResponseEntity.ok("Route created successfully");
    }

    // Stops
    @GetMapping("/routes/{routeId}/stops")
    public ResponseEntity<?> getAllStopsForRoute(@PathVariable Long routeId) {
        // Implement logic to retrieve all stops for a specific route
        return ResponseEntity.ok("Retrieved all stops for route with ID: " + routeId);
    }

    @PostMapping("/routes/{routeId}/stops")
    public ResponseEntity<?> createStopForRoute(@PathVariable Long routeId, @RequestBody StopDto stopDto) {
        // Implement logic to create a new stop for a specific route
        return ResponseEntity.ok("Stop created successfully for route with ID: " + routeId);
    }

    
    // Students
    @GetMapping("/students")
    public ResponseEntity<?> getAllStudents() {
        // Implement logic to retrieve all students
        return ResponseEntity.ok("Retrieved all students");
    }

    @PostMapping("/students")
    public ResponseEntity<?> createStudent(@RequestBody StudentDto studentDto) {
        // Implement logic to create a new student
        return ResponseEntity.ok("Student created successfully");
    }

    @GetMapping("/students/{studentId}")
    public ResponseEntity<?> getStudentById(@PathVariable Long studentId) {
        // Implement logic to retrieve a student by ID
        return ResponseEntity.ok("Retrieved student with ID: " + studentId);
    }

    @GetMapping("/trips/active")
    public ResponseEntity<?> getActiveTrips()
    {
        // Implement logic to retrieve active trips
        return ResponseEntity.ok("Retrieved active trips");
    }

    @GetMapping("/trips/{tripId}/latest")
    public ResponseEntity<?> getLatestTripData(@PathVariable Long tripId) {
        // Implement logic to retrieve the latest trip data for a specific trip
        return ResponseEntity.ok("Retrieved latest trip data for trip with ID: " + tripId);
    }

}
