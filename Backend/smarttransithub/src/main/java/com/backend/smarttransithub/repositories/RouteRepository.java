package com.backend.smarttransithub.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.backend.smarttransithub.entities.Route;

public interface RouteRepository extends JpaRepository<Route, Long> {
	boolean existsByRouteName(String routeName);
}
