package com.backend.smarttransithub.services;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.modelmapper.ModelMapper;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import com.backend.smarttransithub.dtos.response.StudentResponse;
import com.backend.smarttransithub.dtos.response.TripDataResponse;
import com.backend.smarttransithub.entities.Bus;
import com.backend.smarttransithub.entities.Student;
import com.backend.smarttransithub.entities.Trip;
import com.backend.smarttransithub.exceptions.ResourceNotFoundException;
import com.backend.smarttransithub.repositories.BusRepository;
import com.backend.smarttransithub.repositories.StudentRepository;
import com.backend.smarttransithub.repositories.TripRepository;
import com.backend.smarttransithub.repositories.UserRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@Transactional
@RequiredArgsConstructor
public class ParentServiceImpl implements ParentService {

	private final UserRepository userRepo;
	private final StudentRepository studentRepository;
	private final ModelMapper mapper;
	private final RedisTrackingService redisService;
	private final TripRepository tripRepository;
	private final BusRepository busRepository;
	
	@Override
	public List<StudentResponse> getStudents(Long id) {
		List<Student> studentList = studentRepository.findByParentId(id);
		List<StudentResponse> responseList = new ArrayList<>();
		
		for(Student student : studentList) {
			responseList.add(mapper.map(student, StudentResponse.class));
		}
		return responseList;
	}

	@Override
	public TripDataResponse getLatestTripData(Long tripId) {
		Map<String, String> location = redisService.getLatestLocation(tripId);
		Double latitude = Double.parseDouble(location.get("latitude"));
		Double longitude = Double.parseDouble(location.get("longitude"));
		Double speed = Double.parseDouble(location.get("speed"));
		String timestampStr = location.get("timestamp"); // e.g., "2026-07-24T04:14:00Z"

		// Convert back to Instant
		Instant instant = Instant.parse(timestampStr);
		LocalDateTime timestamp = LocalDateTime.ofInstant(instant, ZoneId.systemDefault());
		
		Long nextStopId = redisService.getNextStopId(tripId);
		String nextStopName = redisService.getNextStopName(nextStopId, tripId);
		
		
		Trip trip = tripRepository.findById(tripId).orElseThrow(()-> new ResourceNotFoundException("trip not found"));
		Long routeId = trip.getRoute().getId();		
		Long busId = trip.getBus().getId();
		
		Bus bus = busRepository.findById(busId).orElseThrow(()-> new ResourceNotFoundException("bus not found"));
		String busNumber = bus.getBusNumber();
		
		Double distance = redisService.checkGeofence(tripId, routeId, busNumber);
		
		
		return new TripDataResponse(latitude, longitude, speed, timestamp, nextStopId, nextStopName, distance);
	}

}














