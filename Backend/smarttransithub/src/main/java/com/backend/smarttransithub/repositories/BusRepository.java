package com.backend.smarttransithub.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.backend.smarttransithub.entities.Bus;

public interface BusRepository extends JpaRepository<Bus, Long> {
	
	boolean existsByBusNumber(String busNumber);
	
	boolean existsByPlateNumber(String plateNumber);

}
