package com.backend.smarttransithub.controllers;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.backend.smarttransithub.dtos.request.TelemetryDataDto;
import com.backend.smarttransithub.dtos.response.BusResponse;
import com.backend.smarttransithub.dtos.response.StopResponse;
import com.backend.smarttransithub.entities.Bus;
import com.backend.smarttransithub.entities.Stop;
import com.backend.smarttransithub.entities.Trip;
import com.backend.smarttransithub.enums.TripStatus;
import com.backend.smarttransithub.repositories.TripRepository;
import com.backend.smarttransithub.services.DriverService;
import com.backend.smarttransithub.services.RedisTrackingService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/driver")
@RequiredArgsConstructor
public class DriverController {

    private final DriverService driverService;
    private final TripRepository tripRepository;
    private final RedisTrackingService redisTrackingService;

    @GetMapping("/assigned-bus")
    public ResponseEntity<?> getAssignedBus(@AuthenticationPrincipal Long driverId) {
        Bus bus = driverService.getAssignedBus(driverId);
        if (bus == null) {
            return ResponseEntity.notFound().build();
        }

        BusResponse dto = new BusResponse();
        dto.setId(bus.getId());
        dto.setBusNumber(bus.getBusNumber());
        dto.setPlateNumber(bus.getPlateNumber());
        dto.setCapacity(bus.getCapacity());

        if (bus.getDriver() != null) {
            dto.setDriverId(bus.getDriver().getId());
            dto.setDriverName(bus.getDriver().getFullName());
        }

        if (bus.getRoute() != null) {
            dto.setRouteId(bus.getRoute().getId());
            dto.setRouteName(bus.getRoute().getRouteName());
        }

        return ResponseEntity.ok(dto);
    }

    @GetMapping("/active-trip")
    public ResponseEntity<?> getActiveTrip(@AuthenticationPrincipal Long driverId) {
        try {
            Bus bus = driverService.getAssignedBus(driverId);
            if (bus == null) return ResponseEntity.noContent().build();

            Long activeTripId = redisTrackingService.getActiveTripId(bus.getId());
            if (activeTripId != null) {
                return ResponseEntity.ok(Map.of("tripId", activeTripId, "busId", bus.getId(), "busNumber", bus.getBusNumber()));
            }

            Trip activeTrip = tripRepository.findFirstByBusIdAndStatus(bus.getId(), TripStatus.IN_PROGRESS).orElse(null);
            if (activeTrip != null) {
                return ResponseEntity.ok(Map.of("tripId", activeTrip.getId(), "busId", bus.getId(), "busNumber", bus.getBusNumber()));
            }
        } catch (Exception e) {
            System.err.println("getActiveTrip error: " + e.getMessage());
        }
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/trips/initialize")
    public ResponseEntity<?> tripInitialization(@AuthenticationPrincipal Long driverId) {
        return ResponseEntity.ok(driverService.initializeTrip(driverId));
    }

    @PostMapping("/trips/{tripId}/terminate")
    public ResponseEntity<?> terminateTrip(@PathVariable Long tripId) {
        return ResponseEntity.ok(driverService.terminateTrip(tripId));
    }

    @GetMapping("/trips/{tripId}/stops")
    public ResponseEntity<?> getTripStops(@PathVariable Long tripId) {
        List<Stop> stops = driverService.getTripStops(tripId);
        List<StopResponse> response = stops.stream().map(s -> new StopResponse(
            s.getId(),
            s.getStopName(),
            s.getLatitude(),
            s.getLongitude(),
            s.getSequenceOrder()
        )).toList();
        return ResponseEntity.ok(response);
    }

    @PostMapping("/telemetry/stream")
    public ResponseEntity<?> streamTelemetryData(@RequestBody TelemetryDataDto telemetryDataDto) {
        return ResponseEntity.ok(driverService.streamTelemetryData(telemetryDataDto));
    }
}
