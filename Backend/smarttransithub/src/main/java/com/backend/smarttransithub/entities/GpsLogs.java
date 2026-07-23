package com.backend.smarttransithub.entities;

// will be implemented when we want to store buses gps logs in the database for analytics and other purposes
public class GpsLogs {
	private Long id;
	private Trip trip;
	private double latitude;
	private double longitude;
}
