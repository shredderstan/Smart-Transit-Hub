package com.backend.smarttransithub.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.backend.smarttransithub.entities.Stop;
import java.util.List;


public interface StopRepository extends JpaRepository<Stop, Long> {
	
	List<Stop> findByRouteIdOrderBySequenceOrderAsc(Long routeId);
	void deleteByRouteId(Long routeId);

}
