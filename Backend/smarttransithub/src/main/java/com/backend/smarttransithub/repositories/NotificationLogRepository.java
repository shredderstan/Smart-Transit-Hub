package com.backend.smarttransithub.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.backend.smarttransithub.entities.NotificationLog;

public interface NotificationLogRepository extends JpaRepository<NotificationLog, Long> {

}
