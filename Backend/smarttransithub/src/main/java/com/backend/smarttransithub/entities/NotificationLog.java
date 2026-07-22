package com.backend.smarttransithub.entities;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

public class NotificationLog {
	
	@Id
	@Column(name="notification_log")
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	@ManyToOne
	@JoinColumn(name = "trip_id")
	private Trip trip;
	@ManyToOne
	@JoinColumn(name = "stop_id")
	private Stop stop;
	@Column(name = "notify_time")
	private LocalDateTime notifieDateTime;
}
