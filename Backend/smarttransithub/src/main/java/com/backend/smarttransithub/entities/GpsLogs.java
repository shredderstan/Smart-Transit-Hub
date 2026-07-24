package com.backend.smarttransithub.entities;

import lombok.Getter;

// will be implemented when we want to store buses gps logs in the database for analytics and other purposes
@Getter
public class GpsLogs {
	private Long id;
	private Trip trip;
	private double latitude;
	private double longitude;
}
