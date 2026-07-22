package com.backend.smarttransithub.services;

import java.time.Duration;
import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.data.geo.Point;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import com.backend.smarttransithub.entities.Stop;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RedusTrackingService {
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
		return Long.parseLong(redisTemplate.opsForValue().get("bus:active-trip:"+ busId));
	}
	
	public void terminateTripTracking(Long tripId, Long busId) {
		redisTemplate.delete("bus:active-trip:"+ busId);
		redisTemplate.delete("trip:next-stop-index:"+tripId);
		redisTemplate.delete("bus:loc:" + tripId);
		redisTemplate.delete("trip:notified-stops:" + tripId);
	}
	
}














