package com.backend.smarttransithub.services;

import java.util.List;

import com.backend.smarttransithub.dtos.response.TripInitDto;
import com.backend.smarttransithub.entities.Bus;
import com.backend.smarttransithub.entities.Stop;

public interface DriverService {

    Bus getAssignedBus(Long driverId);
    TripInitDto initializeTrip(Long driverId);
    Boolean terminateTrip(Long tripId);
    List<Stop> getTripStops(Long tripId);
}
