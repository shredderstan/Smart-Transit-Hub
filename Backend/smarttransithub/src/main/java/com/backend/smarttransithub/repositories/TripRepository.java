package com.backend.smarttransithub.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.backend.smarttransithub.entities.Trip;
import com.backend.smarttransithub.enums.TripStatus;

public interface TripRepository extends JpaRepository<Trip, Long> {
    Optional<Trip> findById(Long tripId);

    Optional<Trip> findByBusId(Long busId);

    boolean existsByBusIdAndStatus(Long busId, TripStatus status);

    Optional<Trip> findFirstByBusIdAndStatus(Long busId, TripStatus status);

    Optional<Trip> findFirstByRouteIdAndStatus(Long routeId, TripStatus status);
}
