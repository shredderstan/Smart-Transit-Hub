package com.backend.smarttransithub.controllers;

import java.util.ArrayList;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.backend.smarttransithub.dtos.request.RouteRequest;
import com.backend.smarttransithub.dtos.response.RouteResponse;
import com.backend.smarttransithub.entities.Route;
import com.backend.smarttransithub.services.AdminService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin")
public class RouteController {
	
	private final AdminService adminService;
	
	@GetMapping("/routes")
	public ResponseEntity<?> getRoutes() {

	    List<RouteResponse> response = new ArrayList<>();

	    for (Route route : adminService.getRoutes()) {

	        RouteResponse dto = new RouteResponse();

	        dto.setId(route.getId());
	        dto.setRouteName(route.getRouteName());

	        response.add(dto);
	    }

	    return ResponseEntity.ok(response);
	}
	
	@PostMapping("/routes")
	public ResponseEntity<RouteResponse> createRoute(@RequestBody RouteRequest request) {

	    Route route = adminService.createRoute(request);

	    RouteResponse response = new RouteResponse();

	    response.setId(route.getId());
	    response.setRouteName(route.getRouteName());

	    return ResponseEntity.status(HttpStatus.CREATED).body(response);
	}
	
	@PutMapping("/routes/{id}")
	public ResponseEntity<RouteResponse> updateRoute(@PathVariable Long id, @RequestBody RouteRequest request) {

	    Route route = adminService.updateRoute(id, request);

	    RouteResponse response = new RouteResponse();

	    response.setId(route.getId());
	    response.setRouteName(route.getRouteName());

	    return ResponseEntity.ok(response);
	}
	
	@DeleteMapping("/routes/{id}")
	public ResponseEntity<Void> deleteRoute(@PathVariable Long id) {

	    adminService.deleteRoute(id);

	    return ResponseEntity.noContent().build();
	}
}
