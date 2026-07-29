package com.backend.smarttransithub.services;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.data.geo.Distance;
import org.springframework.data.geo.Point;
import org.springframework.data.redis.connection.RedisGeoCommands;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import com.backend.smarttransithub.entities.InAppAlerts;
import com.backend.smarttransithub.entities.NotificationLog;
import com.backend.smarttransithub.entities.Stop;
import com.backend.smarttransithub.entities.Student;
import com.backend.smarttransithub.entities.Trip;
import com.backend.smarttransithub.entities.User;
import com.backend.smarttransithub.entities.UserDevice;
import com.backend.smarttransithub.repositories.InAppAlertRepository;
import com.backend.smarttransithub.repositories.NotificationLogRepository;
import com.backend.smarttransithub.repositories.StopRepository;
import com.backend.smarttransithub.repositories.StudentRepository;
import com.backend.smarttransithub.repositories.TripRepository;
import com.backend.smarttransithub.repositories.UserDeviceRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RedisTrackingService {

	private final RedisTemplate<String, String> redisTemplate;
	private final FcmService fcmService;
	private final UserDeviceRepository userDeviceRepository;
	private final InAppAlertRepository inAppAlertsRepository;
	private final StudentRepository studentRepository;
	private final StopRepository stopRepository;
	private final TripRepository tripRepository;
	private final NotificationLogRepository notificationLogRepository;

	private static final Duration TRIP_KEYS_TTL = Duration.ofHours(6);

	// In-memory fallback caches if Redis is offline
	private final Map<Long, Map<String, String>> memoryLocations = new ConcurrentHashMap<>();
	private final Map<Long, Integer> memoryNextStopIndexes = new ConcurrentHashMap<>();
	private final Map<Long, Long> memoryBusActiveTrips = new ConcurrentHashMap<>();
	private final Map<Long, Long> memoryTripRouteIds = new ConcurrentHashMap<>();
	private final Map<Long, List<Stop>> memoryRouteStops = new ConcurrentHashMap<>();

	/**
	 * 1. Initialize Trip Tracking: Loads stops to GeoSet, sequence List, name Hash,
	 * and routeId String in Redis (with in-memory fallback).
	 */
	public void initializeTripTracking(Long tripId, Long busId, Long routeId) {
		memoryBusActiveTrips.put(busId, tripId);
		memoryNextStopIndexes.put(tripId, 0);
		memoryTripRouteIds.put(tripId, routeId);

		List<Stop> stops = stopRepository.findByRouteIdOrderBySequenceOrderAsc(routeId);
		memoryRouteStops.put(routeId, stops);

		try {
			redisTemplate.opsForValue().set("bus:active-trip:" + busId, tripId.toString(), TRIP_KEYS_TTL);
			redisTemplate.opsForValue().set("trip:next-stop-index:" + tripId, "0", TRIP_KEYS_TTL);
			redisTemplate.opsForValue().set("trip:route-id:" + tripId, routeId.toString(), TRIP_KEYS_TTL);

			String geoKey = "route:stops:geo:" + routeId;
			String listKey = "trip:stops:sequence:" + tripId;
			String namesKey = "trip:stop-names:" + tripId;

			for (Stop s : stops) {
				redisTemplate.opsForGeo().add(
						geoKey,
						new Point(s.getLongitude(), s.getLatitude()),
						s.getId().toString());

				redisTemplate.opsForList().rightPush(listKey, s.getId().toString());
				redisTemplate.opsForHash().put(namesKey, s.getId().toString(), s.getStopName());
			}

			redisTemplate.expire(listKey, TRIP_KEYS_TTL);
			redisTemplate.expire(namesKey, TRIP_KEYS_TTL);
		} catch (Exception e) {
			System.err.println("Redis unavailable during initializeTripTracking. Using in-memory fallback: " + e.getMessage());
		}

		if (!stops.isEmpty()) {
			Stop firstStop = stops.get(0);
			updateBusLocation(tripId, firstStop.getLatitude(), firstStop.getLongitude(), 0.0);
		}
	}

	/**
	 * 2. Update Bus Location: Overwrites coordinates in Redis Hash (with in-memory fallback).
	 */
	public void updateBusLocation(Long tripId, double latitude, double longitude, double speed) {
		Map<String, String> coordinates = new HashMap<>();
		coordinates.put("latitude", String.valueOf(latitude));
		coordinates.put("longitude", String.valueOf(longitude));
		coordinates.put("speed", String.valueOf(speed));
		coordinates.put("timestamp", Instant.now().toString());
		
		System.out.println("========================");
	    System.out.println("Updating Redis");
	    System.out.println("Trip : " + tripId);
	    System.out.println("Lat  : " + latitude);
	    System.out.println("Lng  : " + longitude);
	    System.out.println("========================");

		memoryLocations.put(tripId, coordinates);

		try {
			String locKey = "bus:loc:" + tripId;
			redisTemplate.opsForHash().putAll(locKey, coordinates);
			redisTemplate.expire(locKey, TRIP_KEYS_TTL);

			String pubsubMsg = String.format("{\"tripId\":%d,\"latitude\":%f,\"longitude\":%f,\"speed\":%f}",
					tripId, latitude, longitude, speed);
			redisTemplate.convertAndSend("bus-location-events", pubsubMsg);
		} catch (Exception e) {
			System.err.println("Redis unavailable during updateBusLocation. Fallback to memory: " + e.getMessage());
		}
	}

	/**
	 * Helper: Fetch current nextStopId from Redis list or memory cache.
	 */
	public Long getNextStopId(Long tripId) {
		try {
			String indexStr = redisTemplate.opsForValue().get("trip:next-stop-index:" + tripId);
			if (indexStr != null) {
				long index = Long.parseLong(indexStr);
				String listKey = "trip:stops:sequence:" + tripId;
				String stopIdStr = redisTemplate.opsForList().index(listKey, index);
				if (stopIdStr != null) {
					return Long.parseLong(stopIdStr);
				}
			}
		} catch (Exception e) {
			System.err.println("Redis getNextStopId fallback: " + e.getMessage());
		}

		// Fallback lookup from memory
		Long routeId = memoryTripRouteIds.get(tripId);
		Integer idx = memoryNextStopIndexes.getOrDefault(tripId, 0);
		if (routeId != null) {
			List<Stop> stops = memoryRouteStops.computeIfAbsent(routeId,
					rId -> stopRepository.findByRouteIdOrderBySequenceOrderAsc(rId));
			if (stops != null && idx < stops.size()) {
				return stops.get(idx).getId();
			}
		}
		return null;
	}

	public String getNextStopName(Long nextStopId, Long tripId) {
		try {
			String namesKey = "trip:stop-names:" + tripId;
			Object nameObj = redisTemplate.opsForHash().get(namesKey, nextStopId.toString());
			if (nameObj != null) {
				return nameObj.toString();
			}
		} catch (Exception e) {
			System.err.println("Redis getNextStopName fallback: " + e.getMessage());
		}

		// Fallback lookup from database
		return stopRepository.findById(nextStopId).map(Stop::getStopName).orElse("Next Stop");
	}
	
	public Long getRouteIdForTrip(Long tripId) {
		try {
			String routeIdStr = redisTemplate.opsForValue().get("trip:route-id:" + tripId);
			if (routeIdStr != null) return Long.parseLong(routeIdStr);
		} catch (Exception e) {
			System.err.println("Redis getRouteIdForTrip fallback: " + e.getMessage());
		}
		return memoryTripRouteIds.get(tripId);
	}

	/**
	 * 3. Check Geofence & Proximity (Redis primary with Haversine distance fallback).
	 */
	public Double checkGeofence(Long tripId, String busNumber) {
		Long nextStopId = getNextStopId(tripId);
		Long routeId = getRouteIdForTrip(tripId);

		if (nextStopId == null || routeId == null) {
			return null;
		}

		Map<String, String> busLocation = getLatestLocation(tripId);
		if (busLocation == null || busLocation.isEmpty() || !busLocation.containsKey("latitude")) {
			return null;
		}

		double buslat = Double.parseDouble(busLocation.get("latitude"));
		double buslng = Double.parseDouble(busLocation.get("longitude"));

		String stopName = getNextStopName(nextStopId, tripId);
		Double distance = null;

		// Try Redis Geo distance calculation first
		try {
			String geoKey = "route:stops:geo:" + routeId;
			redisTemplate.opsForGeo().add(geoKey, new Point(buslng, buslat), "bus");

			Distance distanceObj = redisTemplate.opsForGeo().distance(
					geoKey,
					"bus",
					nextStopId.toString(),
					RedisGeoCommands.DistanceUnit.METERS);

			if (distanceObj != null) {
				distance = distanceObj.getValue();
			}
		} catch (Exception e) {
			System.err.println("Redis Geo distance error, using Haversine calculation: " + e.getMessage());
		}

		// Fallback distance calculation using Haversine formula
		if (distance == null) {
			Stop targetStop = stopRepository.findById(nextStopId).orElse(null);
			if (targetStop != null) {
				distance = calculateHaversineDistance(buslat, buslng, targetStop.getLatitude(), targetStop.getLongitude());
			}
		}

		if (distance == null) return null;

		// Trigger notifications if within 500m geofence
		if (distance <= 500.0) {
			handleProximityNotifications(tripId, nextStopId, busNumber, stopName, distance);
		}

		// Increment stop index if within 50m (Arrival detection)
		if (distance <= 50.0) {
			try {
				redisTemplate.opsForValue().increment("trip:next-stop-index:" + tripId);
			} catch (Exception e) {
				// Memory fallback increment
				memoryNextStopIndexes.put(tripId, memoryNextStopIndexes.getOrDefault(tripId, 0) + 1);
			}
		}

		return distance;
	}

	private double calculateHaversineDistance(double lat1, double lon1, double lat2, double lon2) {
		final int R = 6371000; // Radius of Earth in meters
		double latDistance = Math.toRadians(lat2 - lat1);
		double lonDistance = Math.toRadians(lon2 - lon1);
		double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
				+ Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
				* Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
		double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
		return R * c;
	}

	private void handleProximityNotifications(Long tripId, Long nextStopId, String busNumber, String stopName,
			double distance) {
		boolean alreadyNotified = false;
		String notifiedKey = "trips:notified-stops:" + tripId;

		try {
			Boolean check = redisTemplate.opsForSet().isMember(notifiedKey, nextStopId.toString());
			alreadyNotified = Boolean.TRUE.equals(check);
		} catch (Exception e) {
			System.err.println("Redis notified set check fallback: " + e.getMessage());
		}

		if (!alreadyNotified) {
			try {
				redisTemplate.opsForSet().add(notifiedKey, nextStopId.toString());
				redisTemplate.expire(notifiedKey, TRIP_KEYS_TTL);
			} catch (Exception e) {
				// Ignore if Redis set fails
			}

			Trip currentTrip = tripRepository.findById(tripId).orElse(null);
			Stop currentStop = stopRepository.findById(nextStopId).orElse(null);
			if (currentTrip != null && currentStop != null) {
				notificationLogRepository.save(new NotificationLog(currentTrip, currentStop));
			}

			List<Student> students = studentRepository.findByStopId(nextStopId);
			String message = String.format("Bus %s is arriving at stop %s. (Distance: %.2f meters)", 
					busNumber, stopName, distance);

			for (Student student : students) {
				User parent = student.getParent();
				InAppAlerts alert = new InAppAlerts(parent, message);
				inAppAlertsRepository.save(alert);

				List<UserDevice> devices = userDeviceRepository.findByUserId(parent.getId());
				for (UserDevice device : devices) {
					fcmService.sendNotification(device.getFcmToken(), "Bus Approaching!", message);
				}
			}
		}
	}

	public Map<String, String> getLatestLocation(Long tripId) {
		try {
			String locKey = "bus:loc:" + tripId;
			Map<String, String> redisLoc = this.redisTemplate.<String, String>opsForHash().entries(locKey);
			if (redisLoc != null && !redisLoc.isEmpty() && redisLoc.containsKey("latitude")) {
				return redisLoc;
			}
		} catch (Exception e) {
			System.err.println("Redis getLatestLocation fallback: " + e.getMessage());
		}
		Map<String, String> memLoc = memoryLocations.get(tripId);
		if (memLoc != null && !memLoc.isEmpty() && memLoc.containsKey("latitude")) {
			return memLoc;
		}
		return getAnyActiveLocation();
	}

	public Map<String, String> getAnyActiveLocation() {
		if (!memoryLocations.isEmpty()) {
			for (Map<String, String> loc : memoryLocations.values()) {
				if (loc != null && loc.containsKey("latitude")) {
					return loc;
				}
			}
		}
		return null;
	}

	public Integer getNextStopIndex(Long tripId) {
		try {
			String indexStr = redisTemplate.opsForValue().get("trip:next-stop-index:" + tripId);
			if (indexStr != null) return Integer.parseInt(indexStr);
		} catch (Exception e) {
			System.err.println("Redis getNextStopIndex fallback: " + e.getMessage());
		}
		return memoryNextStopIndexes.get(tripId);
	}

	public Long getActiveTripId(Long busId) {
		try {
			String value = redisTemplate.opsForValue().get("bus:active-trip:" + busId);
			if (value != null) return Long.parseLong(value);
		} catch (Exception e) {
			System.err.println("Redis getActiveTripId fallback: " + e.getMessage());
		}
		return memoryBusActiveTrips.get(busId);
	}

	/**
	 * 4. Terminate Trip Tracking: Clean up Redis keys and memory cache.
	 */
	public void terminateTripTracking(Long tripId, Long busId) {
		memoryLocations.remove(tripId);
		memoryNextStopIndexes.remove(tripId);
		memoryBusActiveTrips.remove(busId);
		memoryTripRouteIds.remove(tripId);

		try {
			redisTemplate.delete("bus:active-trip:" + busId);
			redisTemplate.delete("trip:next-stop-index:" + tripId);
			redisTemplate.delete("bus:loc:" + tripId);
			redisTemplate.delete("trips:notified-stops:" + tripId);
			redisTemplate.delete("trip:stops:sequence:" + tripId);
			redisTemplate.delete("trip:stop-names:" + tripId);
			redisTemplate.delete("trip:route-id:" + tripId);
		} catch (Exception e) {
			System.err.println("Redis terminateTripTracking fallback: " + e.getMessage());
		}
	}
}