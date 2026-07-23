package com.backend.smarttransithub.services;

import java.util.List;

import com.backend.smarttransithub.entities.Stop;
import com.backend.smarttransithub.entities.Student;

public interface DriverService {

    List<Student> getAssignedStudents(Long driverId);
    Boolean initializeTrip(Long driverId, Long busId, Long routeId, String tripType);
    Boolean terminateTrip(Long tripId);
    List<Stop> getTripStops(Long tripId);
    
    

}
