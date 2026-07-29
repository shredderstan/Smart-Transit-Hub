package com.backend.smarttransithub.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import com.backend.smarttransithub.entities.Bus;

public interface BusRepository extends JpaRepository<Bus, Long> {

	@Override
	@EntityGraph(attributePaths = {"driver", "route"})
	List<Bus> findAll();
	
	@EntityGraph(attributePaths = {"driver", "route"})
	Optional<Bus> findByDriverId(Long driverId);

	Boolean existsByBusNumber(String busNumber);
	Boolean existsByPlateNumber(String plateNumber);

}
