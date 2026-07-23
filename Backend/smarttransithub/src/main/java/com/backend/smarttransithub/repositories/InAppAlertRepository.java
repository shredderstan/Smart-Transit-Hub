package com.backend.smarttransithub.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.backend.smarttransithub.entities.InAppAlerts;

import java.util.List;


public interface InAppAlertRepository extends JpaRepository<InAppAlerts, Long> {

    List<InAppAlerts> findByUserId(Long userId);
    
}