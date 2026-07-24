package com.backend.smarttransithub.services;

import java.time.Duration;
import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.data.geo.Distance;
import org.springframework.data.geo.Point;
import org.springframework.data.redis.connection.RedisGeoCommands;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import com.backend.smarttransithub.entities.InAppAlerts;
import com.backend.smarttransithub.entities.Stop;
import com.backend.smarttransithub.entities.Student;
import com.backend.smarttransithub.entities.User;
import com.backend.smarttransithub.entities.UserDevice;
import com.backend.smarttransithub.repositories.UserDeviceRepository;
import com.backend.smarttransithub.repositories.InAppAlertRepository;
import com.backend.smarttransithub.repositories.StudentRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RedisTrackingService {

	private final RedisTemplate<String, String> redisTemplate;
	private final FcmService fcmService;
	private final UserDeviceRepository userDeviceRepository;
	private final InAppAlertRepository inAppAlertsRepository;
	private final StudentRepository studentRepository;

	private static final Duration TRIP_KEYS_TTL = Duration.ofHours(6);

	/**
	 * 1. Initialize Trip Tracking: Loads stops to GeoSet, sequence List, and name Hash in Redis.
	 */
	public void initializeTripTracking(Long tripId, Long busId, Long routeId, List<Stop> stops) {
		redisTemplate.opsForValue().set("bus:active-trip:" + busId, tripId.toString(), TRIP_KEYS_TTL);
		redisTemplate.opsForValue().set("trip:next-stop-index:" + tripId, "0", TRIP_KEYS_TTL);

		String geoKey = "route:stops:geo:" + routeId;
		String listKey = "trip:stops:sequence:" + tripId;
		String namesKey = "trip:stop-names:" + tripId;

		for (Stop s : stops) {
			// A. Load stop into Geospatial Set
			redisTemplate.opsForGeo().add(
					geoKey,
					new Point(s.getLongitude(), s.getLatitude()),
					s.getId().toString());

			// B. Push stop ID to sequence list (essential for getNextStopId)
			redisTemplate.opsForList().rightPush(listKey, s.getId().toString());

			// C. Cache stop name mapping (essential for checkGeofence)
			redisTemplate.opsForHash().put(namesKey, s.getId().toString(), s.getStopName());
		}

		redisTemplate.expire(listKey, TRIP_KEYS_TTL);
		redisTemplate.expire(namesKey, TRIP_KEYS_TTL);
	}

	/**
	 * 2. Update Bus Location: Overwrites the latest coordinates in the Redis Hash.
	 */
	public void updateBusLocation(Long tripId, double latitude, double longitude, double speed) {
		String locKey = "bus:loc:" + tripId;

		Map<String, String> coordinates = new HashMap<>();
		coordinates.put("latitude", String.valueOf(latitude));
		coordinates.put("longitude", String.valueOf(longitude));
		coordinates.put("speed", String.valueOf(speed));
		coordinates.put("timestamp", Instant.now().toString());

		redisTemplate.opsForHash().putAll(locKey, coordinates);
		redisTemplate.expire(locKey, TRIP_KEYS_TTL);
	}

	/**
	 * Helper: Fetch the current nextStopId from the Redis sequence list.
	 */
	public Long getNextStopId(Long tripId) {
		String indexStr = redisTemplate.opsForValue().get("trip:next-stop-index:" + tripId);
		if (indexStr == null) return null;
		long index = Long.parseLong(indexStr);

		String listKey = "trip:stops:sequence:" + tripId;
		String stopIdStr = redisTemplate.opsForList().index(listKey, index);

		return stopIdStr != null ? Long.parseLong(stopIdStr) : null;
	}

	/**
	 * 3. Check Geofence: Resolves stop details from Redis, updates bus position in index,
	 * calculates distance, triggers push/in-app notifications, and increments next stop index.
	 */
	public Double checkGeofence(Long tripId, Long routeId, String busNumber) {
		String geoKey = "route:stops:geo:" + routeId;

		// A. Fetch current nextStopId directly from Redis sequence list
		Long nextStopId = getNextStopId(tripId);
		
		// B. Fetch latest bus location coordinates from Redis Hash
		Map<String, String> busLocation = getLatestLocation(tripId);
		
		if (busLocation == null || busLocation.isEmpty() || nextStopId == null) {
			System.out.println("Bus location coordinates or next stop ID is missing in Redis.");
			return null;
		}

		double buslat = Double.parseDouble(busLocation.get("latitude"));
		double buslng = Double.parseDouble(busLocation.get("longitude"));

		// C. Fetch stop name from Redis hash
		String namesKey = "trip:stop-names:" + tripId;
		String stopName = (String) redisTemplate.opsForHash().get(namesKey, nextStopId.toString());

		// D. Add/Update bus position as member "bus" in the route's geospatial index
		redisTemplate.opsForGeo().add(geoKey, new Point(buslng, buslat), "bus");

		// E. Calculate distance in meters between member "bus" and member "nextStopId"
		Distance distanceObj = redisTemplate.opsForGeo().distance(
			geoKey,
			"bus",
			nextStopId.toString(),
			RedisGeoCommands.DistanceUnit.METERS
		);

		if (distanceObj == null) {
			System.out.println("Distance could not be calculated.");
			return null;
		}

		double distance = distanceObj.getValue();

		// F. Trigger notifications if within 500m geofence
		if (distance <= 500.0) {
			String notifiedKey = "trips:notified-stops:" + tripId;
			Boolean alreadyNotified = redisTemplate.opsForSet().isMember(notifiedKey, nextStopId.toString());

			if (Boolean.FALSE.equals(alreadyNotified)) {
				redisTemplate.opsForSet().add(notifiedKey, nextStopId.toString());
				redisTemplate.expire(notifiedKey, TRIP_KEYS_TTL);

				// Retrieve students assigned to this stop from MySQL database
				List<Student> students = studentRepository.findByStopId(nextStopId);

				for (Student student : students) {
					User parent = student.getParent();
					String message = String.format("Bus %s is arriving at stop %s. (Distance: %.2f meters)", 
							busNumber, stopName, distance);

					// Save In-App Alert
					InAppAlerts alert = new InAppAlerts(parent, message);
					inAppAlertsRepository.save(alert);

					// Get FCM device registration tokens for the parent
					List<UserDevice> devices = userDeviceRepository.findByUserId(parent.getId());

					// Dispatch push notification to all parent devices
					for (UserDevice device : devices) {
						fcmService.sendNotification(device.getFcmToken(), "Bus Approaching!!!!", message);
					}
				}
			}
		}

		// G. Increment stop index if within 50m (Arrival detection)
		if (distance <= 50.0) {
			redisTemplate.opsForValue().increment("trip:next-stop-index:" + tripId);
		}

		return distance;
	}

	public Map<String, String> getLatestLocation(Long tripId) {
		String locKey = "bus:loc:" + tripId;
		return this.redisTemplate.<String, String>opsForHash().entries(locKey);
	}

	public Integer getNextStopIndex(Long tripId) {
		String indexStr = redisTemplate.opsForValue().get("trip:next-stop-index:" + tripId);
		return indexStr != null ? Integer.parseInt(indexStr) : null;
	}

	public Long getActiveTripId(Long busId) {
		String value = redisTemplate.opsForValue().get("bus:active-trip:" + busId);
		return value == null ? null : Long.parseLong(value);
	}

	/**
	 * 4. Terminate Trip Tracking: Clean up all trip-specific keys from Redis memory.
	 */
	public void terminateTripTracking(Long tripId, Long busId) {
		redisTemplate.delete("bus:active-trip:" + busId);
		redisTemplate.delete("trip:next-stop-index:" + tripId);
		redisTemplate.delete("bus:loc:" + tripId);
		redisTemplate.delete("trips:notified-stops:" + tripId);
		redisTemplate.delete("trip:stops:sequence:" + tripId); // Delete sequence list
		redisTemplate.delete("trip:stop-names:" + tripId);      // Delete cached stop names
	}
}
