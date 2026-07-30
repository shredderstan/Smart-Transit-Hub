package com.backend.smarttransithub.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.backend.smarttransithub.entities.Trip;
import com.backend.smarttransithub.enums.TripStatus;

public interface TripRepository extends JpaRepository<Trip, Long> {
    Optional<Trip> findById(Long tripId);

    Optional<Trip> findByBusId(Long busId);

    boolean existsByBusIdAndStatus(Long busId, TripStatus status);

    Optional<Trip> findFirstByBusIdAndStatus(Long busId, TripStatus status);

    Optional<Trip> findFirstByRouteIdAndStatus(Long routeId, TripStatus status);
    
    @Query("""
    	    SELECT DISTINCT t
    	    FROM Trip t
    	    JOIN FETCH t.bus b
    	    LEFT JOIN FETCH b.driver
    	    LEFT JOIN FETCH t.route
    	    WHERE t.status = :status
    	""")
    	List<Trip> findActiveTripsWithDetails(@Param("status") TripStatus status);
}
