package com.backend.smarttransithub.entities;

import java.time.Instant;

import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "notification_logs")
@Getter
@Setter
public class NotificationLog {

	@Id
	@Column(name = "notification_log")
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne
	@JoinColumn(name = "trip_id")
	private Trip trip;
	@ManyToOne
	@JoinColumn(name = "stop_id")
	private Stop stop;
	@Column(name = "notify_time")
	@CreationTimestamp
	private Instant notifieDateTime;

	public NotificationLog(Trip trip, Stop stop) {
		this.trip = trip;
		this.stop = stop;

	}
}
