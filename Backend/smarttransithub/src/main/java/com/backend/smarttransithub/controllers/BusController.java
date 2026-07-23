package com.backend.smarttransithub.controllers;

import java.util.ArrayList;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.backend.smarttransithub.dtos.request.BusRequest;
import com.backend.smarttransithub.dtos.response.BusResponse;
import com.backend.smarttransithub.entities.Bus;
import com.backend.smarttransithub.services.AdminService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin")
public class BusController {
	
	private final AdminService adminService;
	
	@GetMapping("/buses")
	public ResponseEntity<?> getBuses() {

		List<BusResponse> response = new ArrayList<>();

	    for (Bus bus : adminService.getBuses()) {

	        BusResponse dto = new BusResponse();

	        dto.setId(bus.getId());
	        dto.setBusNumber(bus.getBusNumber());
	        dto.setPlateNumber(bus.getPlateNumber());
	        dto.setCapacity(bus.getCapacity());

	        if (bus.getDriver() != null) {
	            dto.setDriverId(bus.getDriver().getId());
	            dto.setDriverName(bus.getDriver().getFullName());
	        }

	        response.add(dto);
	    }

	    return ResponseEntity.ok(response);
	
	}
	
	@PostMapping("/buses")
	public ResponseEntity<BusResponse> createBus(@RequestBody BusRequest request) {

	    Bus bus = adminService.createbus(request);

	    BusResponse response = new BusResponse();

	    response.setId(bus.getId());
	    response.setBusNumber(bus.getBusNumber());
	    response.setPlateNumber(bus.getPlateNumber());
	    response.setCapacity(bus.getCapacity());

	    if (bus.getDriver() != null) {
	        response.setDriverId(bus.getDriver().getId());
	        response.setDriverName(bus.getDriver().getFullName());
	    }

	    return ResponseEntity.status(HttpStatus.CREATED).body(response);
	}
	
	@PutMapping("/buses/{id}")
	public ResponseEntity<BusResponse> updateBus(@PathVariable Long id, @RequestBody BusRequest request) {

	    Bus bus = adminService.updateBus(id, request);

	    BusResponse response = new BusResponse();

	    response.setId(bus.getId());
	    response.setBusNumber(bus.getBusNumber());
	    response.setPlateNumber(bus.getPlateNumber());
	    response.setCapacity(bus.getCapacity());

	    if (bus.getDriver() != null) {
	        response.setDriverId(bus.getDriver().getId());
	        response.setDriverName(bus.getDriver().getFullName());
	    }

	    return ResponseEntity.ok(response);
	}
	
	

}
