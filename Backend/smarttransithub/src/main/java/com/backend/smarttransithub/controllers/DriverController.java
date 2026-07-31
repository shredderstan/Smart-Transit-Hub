package com.backend.smarttransithub.controllers;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.backend.smarttransithub.dtos.request.NotificationTokenDto;
import com.backend.smarttransithub.dtos.request.TelemetryDataDto;
import com.backend.smarttransithub.dtos.response.ActiveTripResponseDto;
import com.backend.smarttransithub.dtos.response.BusResponse;
import com.backend.smarttransithub.dtos.response.StopResponse;
import com.backend.smarttransithub.dtos.response.TripInitDto;
import com.backend.smarttransithub.services.DriverService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/driver")
@RequiredArgsConstructor
public class DriverController {

    private final DriverService driverService;

    @GetMapping("/assigned-bus")
    public ResponseEntity<?> getAssignedBus(@AuthenticationPrincipal Long driverId) {
        BusResponse response = driverService.getAssignedBus(driverId);
        if (response == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(response);
    }
    //Changed From Map to dto for better reading. Complete Logic was written in Controller
    @GetMapping("/active-trip")
    public ResponseEntity<?> getActiveTrip(@AuthenticationPrincipal Long driverId) {
        ActiveTripResponseDto responseDto = driverService.getActiveTrip(driverId);
        if (responseDto == null)
        {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(responseDto);
    }

    @PostMapping("/trips/initialize")
    public ResponseEntity<?> tripInitialization(@AuthenticationPrincipal Long driverId) {
        TripInitDto responseDto=driverService.initializeTrip(driverId);
        if (responseDto == null)
        {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(responseDto);
    }

    @PostMapping("/trips/{tripId}/terminate")
    public ResponseEntity<?> terminateTrip(@PathVariable Long tripId) {
        return ResponseEntity.ok(driverService.terminateTrip(tripId));
    }

    @GetMapping("/trips/{tripId}/stops")
    public ResponseEntity<?> getTripStops(@PathVariable Long tripId) {
        List<StopResponse> responseListDto =driverService.getTripStops(tripId);
        if (responseListDto == null)
        {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(responseListDto);
    }
    @PostMapping("/notifications/register-token")
    public ResponseEntity<?> registerNotificationToken(@AuthenticationPrincipal Long userId,
            @RequestBody NotificationTokenDto notificationTokenDto) {
        return ResponseEntity.ok(driverService.registerNotificationToken(userId, notificationTokenDto));
    }

    @PostMapping("/notifications/remove-token")
    public ResponseEntity<?> removeNotificationToken(@AuthenticationPrincipal Long userId, @RequestBody NotificationTokenDto notificationTokenDto) {
        return ResponseEntity.ok(driverService.removeNotificationToken(userId, notificationTokenDto));
    }

    @PostMapping("/telemetry/stream")
    public ResponseEntity<?> streamTelemetryData(@RequestBody TelemetryDataDto telemetryDataDto) {
        return ResponseEntity.ok(driverService.streamTelemetryData(telemetryDataDto));
    }
}
