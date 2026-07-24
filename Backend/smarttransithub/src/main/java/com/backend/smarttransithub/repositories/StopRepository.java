package com.backend.smarttransithub.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.backend.smarttransithub.entities.Stop;
import java.util.List;
import com.backend.smarttransithub.entities.Route;


public interface StopRepository extends JpaRepository<Stop, Long> {
	
	List<Stop> findByRouteOrderBySequenceOrder(Route route);

}
