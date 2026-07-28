package com.backend.smarttransithub.services;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import com.backend.smarttransithub.dtos.request.NotificationTokenDto;
import com.backend.smarttransithub.dtos.response.ApiResponse;
import com.backend.smarttransithub.dtos.response.StudentResponse;
import com.backend.smarttransithub.dtos.response.TripDataResponse;
import com.backend.smarttransithub.entities.Bus;
import com.backend.smarttransithub.entities.Stop;
import com.backend.smarttransithub.entities.Student;
import com.backend.smarttransithub.entities.Trip;
import com.backend.smarttransithub.entities.User;
import com.backend.smarttransithub.entities.UserDevice;
import com.backend.smarttransithub.enums.DevicePlatform;
import com.backend.smarttransithub.exceptions.ResourceNotFoundException;
import com.backend.smarttransithub.repositories.BusRepository;
import com.backend.smarttransithub.repositories.StudentRepository;
import com.backend.smarttransithub.repositories.TripRepository;
import com.backend.smarttransithub.repositories.UserDeviceRepository;
import com.backend.smarttransithub.repositories.UserRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@Transactional
@RequiredArgsConstructor
public class ParentServiceImpl implements ParentService {

	private final StudentRepository studentRepository;
	private final ModelMapper mapper;
	private final RedisTrackingService redisService;
	private final TripRepository tripRepository;
	private final BusRepository busRepository;
	private final UserDeviceRepository userDeviceRepository;
	private final UserRepository userRepository;

	@Override
	public List<StudentResponse> getStudents(Long id) {
		List<Student> studentList = studentRepository.findByParentId(id);
		List<StudentResponse> responseList = new ArrayList<>();

		for (Student student : studentList) {
			User parent = student.getParent();
			Stop stop = student.getStop();
			StudentResponse studentResponse = mapper.map(student, StudentResponse.class);
			studentResponse.setParentId(parent.getId());
			studentResponse.setParentName(parent.getFullName());
			studentResponse.setStopId(stop.getId());
			studentResponse.setStopName(stop.getStopName());
			responseList.add(studentResponse);
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

		Trip trip = tripRepository.findById(tripId).orElseThrow(() -> new ResourceNotFoundException("trip not found"));
		Long busId = trip.getBus().getId();

		Bus bus = busRepository.findById(busId).orElseThrow(() -> new ResourceNotFoundException("bus not found"));
		String busNumber = bus.getBusNumber();

		Double distance = redisService.checkGeofence(tripId, busNumber);

		return new TripDataResponse(latitude, longitude, speed, timestamp, nextStopId, nextStopName, distance);
	}

	@Override
	public ApiResponse registerNotificationToken(Long userId, NotificationTokenDto request) {
		String fcmToken = request.getFcmToken();
		DevicePlatform devicePlatform = request.getPlatform();
		LocalDateTime dateTime = LocalDateTime.now();
		User user = userRepository.findById(userId).orElseThrow(()-> new ResourceNotFoundException("invalid user id"));

		List<UserDevice> userDeviceList = userDeviceRepository.findByFcmToken(fcmToken);
		if(userDeviceList.isEmpty()){
			UserDevice userDevice = new UserDevice(null, user, fcmToken, devicePlatform, dateTime);
			userDeviceRepository.save(userDevice);
			return new ApiResponse("success", "fcm token stored in db");
		}
		return new ApiResponse("success", "fcmToken already registered");
	}

	@Override
	public ApiResponse removeNotificationToken(Long userId, NotificationTokenDto request) {
		String fcmToken = request.getFcmToken();
		DevicePlatform devicePlatform = request.getPlatform();
		User user = userRepository.findById(userId).orElseThrow(()-> new ResourceNotFoundException("invalid user id"));

		UserDevice userDevice = userDeviceRepository.findByFcmTokenAndUserAndDeviceType(fcmToken, user, devicePlatform).orElseThrow(()-> new ResourceNotFoundException("token related to given user not found"));
		userDeviceRepository.delete(userDevice);
		return new ApiResponse("success", "token removed for user : " + user.getId());
	}

}
