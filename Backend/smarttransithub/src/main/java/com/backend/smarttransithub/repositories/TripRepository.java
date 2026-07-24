package com.backend.smarttransithub.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.backend.smarttransithub.entities.Trip;

public interface TripRepository extends JpaRepository<Trip, Long> {

    Optional<Trip> findByBusId(Long busId);
    boolean existsByBusIdAndStatus(Long busId, String status);
}
