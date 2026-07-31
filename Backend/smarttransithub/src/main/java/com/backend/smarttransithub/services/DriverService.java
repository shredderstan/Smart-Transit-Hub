package com.backend.smarttransithub.services;

import java.util.List;

import com.backend.smarttransithub.dtos.request.NotificationTokenDto;
import com.backend.smarttransithub.dtos.request.TelemetryDataDto;
import com.backend.smarttransithub.dtos.response.ActiveTripResponseDto;
import com.backend.smarttransithub.dtos.response.ApiResponse;
import com.backend.smarttransithub.dtos.response.BusResponse;
import com.backend.smarttransithub.dtos.response.StopResponse;
import com.backend.smarttransithub.dtos.response.TelemetryResponseDto;
import com.backend.smarttransithub.dtos.response.TripInitDto;


public interface DriverService {

    BusResponse getAssignedBus(Long driverId);
    TripInitDto initializeTrip(Long driverId);
    ActiveTripResponseDto getActiveTrip(Long driverId);
    Boolean terminateTrip(Long tripId);
    List<StopResponse> getTripStops(Long tripId);
	ApiResponse registerNotificationToken(Long userId, NotificationTokenDto request);
	ApiResponse removeNotificationToken(Long userId, NotificationTokenDto request);
    TelemetryResponseDto streamTelemetryData(TelemetryDataDto dto);
}
