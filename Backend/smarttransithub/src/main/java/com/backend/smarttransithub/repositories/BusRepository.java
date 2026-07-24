package com.backend.smarttransithub.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.backend.smarttransithub.entities.Bus;

public interface BusRepository extends JpaRepository<Bus, Long> {
	
	Optional<Bus> findByDriverId(Long driverId);
	Boolean existsByBusNumber(String busNumber);
	Boolean existsByPlateNumber(String plateNumber);

}
