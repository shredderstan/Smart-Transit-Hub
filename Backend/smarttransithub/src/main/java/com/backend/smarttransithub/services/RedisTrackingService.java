package com.backend.smarttransithub.services;

import com.backend.smarttransithub.controllers.AdminController;
import com.backend.smarttransithub.controllers.AuthController;
import java.time.Duration;
import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.data.geo.Point;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import com.backend.smarttransithub.entities.Stop;
import org.springframework.data.geo.Distance;
import org.springframework.data.geo.Point;
import org.springframework.data.redis.connection.RedisGeoCommands;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.authentication.AuthenticationManager;
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
	
	private static final Duration TRIP_KEYS_TTL = Duration.ofHours(6);
	
	public void initializeTripTracking(Long tripId, Long busId, Long routeId, List<Stop> stops) {
		redisTemplate.opsForValue().set("bus:active-trip:"+busId, tripId.toString(), TRIP_KEYS_TTL);
		redisTemplate.opsForValue()
.set("trip:next-stop-index:"+tripId, "0", TRIP_KEYS_TTL);	
		
		
		String geoKey = "route:stops:geo:"+routeId;
		
		for(Stop s : stops) {
			redisTemplate.opsForGeo().add(
					geoKey,
					new Point(s.getLongitude(), s.getLatitude()),
					s.getId().toString()
					);
		}
		
	}
	
	
	public void updateBusLocation(Long tripId, double latitude, double longitude, double speed) {
		
		String locKey = "bus:loc:"+ tripId;
		
		Map<String, String> coordinates= new HashMap<>();

	private final RedisTemplate<String, String> redisTemplate;
	private final FcmService fcmService;
	private final UserDeviceRepository userDeviceRepository;
	private final InAppAlertRepository inAppAlertsRepository;
	private final StudentRepository studentRepository;

	private static final Duration TRIP_KEYS_TTL = Duration.ofHours(6);

	public void initializeTripTracking(Long tripId, Long busId, Long routeId, List<Stop> stops) {
		redisTemplate.opsForValue().set("bus:active-trip:" + busId, tripId.toString(), TRIP_KEYS_TTL);
		redisTemplate.opsForValue()
				.set("trip:next-stop-index:" + tripId, "0", TRIP_KEYS_TTL);

		String geoKey = "route:stops:geo:" + routeId;

		for (Stop s : stops) {
			redisTemplate.opsForGeo().add(
					geoKey,
					new Point(s.getLongitude(), s.getLatitude()),
					s.getId().toString());
		}

	}

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
	
	
	
//	public Double checkGeofence
	
	
	public Map<String, String> getLatestLocation(Long tripId){
		String locKey = "bus:loc:" + tripId;
		
		return this.redisTemplate.<String,String>opsForHash().entries(locKey);
	}
	
	public Integer getNextStopIndex(Long tripId) {
		String indexStr = redisTemplate.opsForValue().get("trip:next-stop-index:"+tripId);
		return indexStr != null ? Integer.parseInt(indexStr) : null;
	}
	
	public Long getActiveTripId(Long busId) {
		String value =
		        redisTemplate.opsForValue()
		                     .get("bus:active-trip:" + busId);

		    return value == null ? null : Long.parseLong(value);
	}
	
	public void terminateTripTracking(Long tripId, Long busId) {
		redisTemplate.delete("bus:active-trip:"+ busId);
		redisTemplate.delete("trip:next-stop-index:"+tripId);
		redisTemplate.delete("bus:loc:" + tripId);
		redisTemplate.delete("trip:notified-stops:" + tripId);
	}
	
}















		redisTemplate.opsForHash().putAll(locKey, coordinates);
		redisTemplate.expire(locKey, TRIP_KEYS_TTL);

	}
	// public Double checkGeofence

	public Double checkGeofence(Long tripId, Long routeId, Long nextStopId, String stopName, String busNumber, double buslat, double buslng)
	{
		String geoKey="route:stops:geo:"+routeId;
		

		// Calculate the distance in meters between bus and the next stop using Redis GEO commands.
		Distance distanceObj =redisTemplate.opsForGeo().distance(
			geoKey.toString(),
			nextStopId.toString(),
			new Point(buslng, buslat).toString(),
			RedisGeoCommands.DistanceUnit.METERS
		);

		if(distanceObj == null) {
			System.out.println("Distance could not be calculated. Either the stop or bus location is missing.");
			return null;
		}

		double distance = distanceObj.getValue();

		if(distance<= 500.0)
		{
			String notifiedKey = "trips:notified-stops"+tripId;
			Boolean alreadyNotified = redisTemplate.opsForSet()
					.isMember(notifiedKey,nextStopId.toString());

			if(Boolean.FALSE.equals(alreadyNotified))
			{
				redisTemplate.opsForSet().add(notifiedKey, nextStopId.toString());
				redisTemplate.expire(notifiedKey, TRIP_KEYS_TTL);

				List<Student> students = studentRepository.findByStop(nextStopId);

				for(Student student : students)
				{
					User parent = student.getParent();

					String message= String.format("Bus %s is arriving at stop %s.( Distance: %.2f meters)", busNumber, stopName, distance);

					InAppAlerts alert = new InAppAlerts(parent, message);
					inAppAlertsRepository.save(alert);
					List<UserDevice> devices = userDeviceRepository.findByUserId(parent.getId());

					for(UserDevice device : devices)
					{
						fcmService.sendNotification(device.getFcmToken(), "Bus Approaching!!!!", message);
					}
				}
			}
		}
		if(distance<= 50.0)
		{
			redisTemplate.opsForValue().increment("trip:next-stop-index:"+tripId);
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
		return Long.parseLong(redisTemplate.opsForValue().get("bus:active-trip:" + busId));
	}

	public void terminateTripTracking(Long tripId, Long busId) {
		redisTemplate.delete("bus:active-trip:" + busId);
		redisTemplate.delete("trip:next-stop-index:" + tripId);
		redisTemplate.delete("bus:loc:" + tripId);
		redisTemplate.delete("trip:notified-stops:" + tripId);
	}

}
