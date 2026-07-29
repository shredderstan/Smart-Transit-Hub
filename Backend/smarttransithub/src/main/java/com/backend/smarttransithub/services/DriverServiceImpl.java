package com.backend.smarttransithub.services;

import java.time.Instant;
import java.util.List;

import org.springframework.stereotype.Service;

import com.backend.smarttransithub.dtos.request.TelemetryDataDto;
import com.backend.smarttransithub.dtos.response.TelemetryResponseDto;
import com.backend.smarttransithub.dtos.response.TripInitDto;
import com.backend.smarttransithub.entities.Bus;
import com.backend.smarttransithub.entities.Route;
import com.backend.smarttransithub.entities.Stop;
import com.backend.smarttransithub.entities.Trip;
import com.backend.smarttransithub.enums.TripStatus;
import com.backend.smarttransithub.repositories.BusRepository;
import com.backend.smarttransithub.repositories.StopRepository;
import com.backend.smarttransithub.repositories.TripRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@Transactional
@RequiredArgsConstructor
public class DriverServiceImpl implements DriverService {

    private final RedisTrackingService redisTrackingService;
    private final BusRepository busRepository;
    private final TripRepository tripRepository;
    private final StopRepository stopRepository;

    @Override
    public Bus getAssignedBus(Long driverId) {

        return busRepository.findByDriverId(driverId)
                .orElseThrow(() -> new RuntimeException("No bus assigned to this driver"));
    }

    @Override
    public TripInitDto initializeTrip(Long driverId) {
        // 1. Fetch assigned bus
        Bus assignedBus = getAssignedBus(driverId);
        if (assignedBus == null) {
            throw new RuntimeException("No bus assigned to this driver");
        }

        // 2. Check for existing active trip
        if (tripRepository.existsByBusIdAndStatus(assignedBus.getId(), TripStatus.IN_PROGRESS)) {
            throw new RuntimeException("A trip is already active for this bus");
        }

        Route route = assignedBus.getRoute();
        if (route == null) {
            throw new RuntimeException("This bus has no assigned route");
        }

        // 3. Create and save new trip
        Trip trip = tripRepository.save(new Trip(assignedBus, route, TripStatus.IN_PROGRESS));

        // 5. Load telemetry caching to Redis
        redisTrackingService.initializeTripTracking(
                trip.getId(),
                assignedBus.getId(),
                route.getId());

        // 6. Return success DTO with generated trip ID and start message
        return new TripInitDto(trip.getId(), "Trip has started successfully.");
    }

    @Override
    public Boolean terminateTrip(Long tripId) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new RuntimeException("Trip not found"));
        trip.setStatus(TripStatus.COMPLETED);
        trip.setEndTime(Instant.now());
        tripRepository.flush();
        redisTrackingService.terminateTripTracking(trip.getId(), trip.getBus().getId());
        return true; // Replace with actual implementation
    }

    @Override
    public List<Stop> getTripStops(Long tripId) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new RuntimeException("Trip not found"));
        return stopRepository.findByRouteIdOrderBySequenceOrderAsc(trip.getRoute().getId());
    }

    @Override
    public TelemetryResponseDto streamTelemetryData(TelemetryDataDto dto)
    {
        // 1. Updating the current location of Bus
        redisTrackingService.updateBusLocation(
            dto.getTripId(),
            dto.getLatitude(), 
            dto.getLongitude(),
            dto.getSpeed()
        );
         // 2. Perform geofence checks and capture the calculated distance to the next stop
        Double distance = redisTrackingService.checkGeofence(dto.getTripId(), dto.getBusNumber());
        // 3. Resolve the next stop ID from Redis cache
        Long nextStopId = redisTrackingService.getNextStopId(dto.getTripId());
        
        // 4. Build a meaningful response payload
        if (nextStopId == null) {
            // Case: All stops on the route are completed
            return new TelemetryResponseDto(
                "All Stops Completed",
                0.0,
                redisTrackingService.getNextStopIndex(dto.getTripId()),
                "Route completed. Please terminate the trip."
            );
        }
        // Case: Driving towards the next stop
        String nextStopName = redisTrackingService.getNextStopName(nextStopId, dto.getTripId());
        Integer nextStopIndex = redisTrackingService.getNextStopIndex(dto.getTripId());
        String statusMessage = (distance <= 50.0) 
                ? "Arrived at stop. Advancing sequence..." 
                : (distance <= 500.0) ? "Approaching stop (Proximity Alert Sent)" : "En Route";
        return new TelemetryResponseDto(
            nextStopName,
            distance,
            nextStopIndex,
            statusMessage
        );
    }

}
