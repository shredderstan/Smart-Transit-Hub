package com.backend.smarttransithub.services;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import com.backend.smarttransithub.dtos.request.NotificationTokenDto;
import com.backend.smarttransithub.dtos.response.ApiResponse;
import com.backend.smarttransithub.dtos.response.StopResponse;
import com.backend.smarttransithub.dtos.response.StudentResponse;
import com.backend.smarttransithub.dtos.response.TripDataResponse;
import com.backend.smarttransithub.entities.Bus;
import com.backend.smarttransithub.entities.Stop;
import com.backend.smarttransithub.entities.Student;
import com.backend.smarttransithub.entities.Trip;
import com.backend.smarttransithub.entities.User;
import com.backend.smarttransithub.entities.UserDevice;
import com.backend.smarttransithub.enums.DevicePlatform;
import com.backend.smarttransithub.enums.TripStatus;
import com.backend.smarttransithub.exceptions.ResourceNotFoundException;
import com.backend.smarttransithub.repositories.BusRepository;
import com.backend.smarttransithub.repositories.StopRepository;
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
	private final StopRepository stopRepository;
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
			if (parent != null) {
				studentResponse.setParentId(parent.getId());
				studentResponse.setParentName(parent.getFullName());
			}
			if (stop != null) {
				studentResponse.setStopId(stop.getId());
				studentResponse.setStopName(stop.getStopName());
				if (stop.getRoute() != null) {
					studentResponse.setRouteId(stop.getRoute().getId());
					studentResponse.setRouteName(stop.getRoute().getRouteName());
				}
			}
			responseList.add(studentResponse);
		}
		return responseList;
	}

	@Override
	public TripDataResponse getLatestTripData(Long tripId) {
		Map<String, String> location = redisService.getLatestLocation(tripId);
		if (location == null || location.isEmpty() || !location.containsKey("latitude")) {
			location = redisService.getAnyActiveLocation();
			if (location == null || location.isEmpty() || !location.containsKey("latitude")) {
				return null;
			}
		}

		Double latitude = Double.parseDouble(location.get("latitude"));
		Double longitude = Double.parseDouble(location.get("longitude"));
		Double speed = (location.containsKey("speed") && location.get("speed") != null)
				? Double.parseDouble(location.get("speed"))
				: 0.0;
		String timestampStr = location.get("timestamp");

		LocalDateTime timestamp = LocalDateTime.now();
		if (timestampStr != null) {
			try {
				Instant instant = Instant.parse(timestampStr);
				timestamp = LocalDateTime.ofInstant(instant, ZoneId.systemDefault());
			} catch (Exception e) {
				// fallback to current time
			}
		}

		Long nextStopId = redisService.getNextStopId(tripId);
		String nextStopName = nextStopId != null ? redisService.getNextStopName(nextStopId, tripId) : null;

		String busNumber = "BUS";
		try {
			Trip trip = tripRepository.findById(tripId).orElse(null);
			if (trip != null && trip.getBus() != null) {
				busNumber = trip.getBus().getBusNumber();
			}
		} catch (Exception e) {
			System.err.println("Bus number lookup fallback: " + e.getMessage());
		}

		Double distance = null;
		try {
			distance = redisService.checkGeofence(tripId, busNumber);
		} catch (Exception e) {
			System.err.println("Geofence check fallback: " + e.getMessage());
		}

		return new TripDataResponse(latitude, longitude, speed, timestamp, nextStopId, nextStopName, distance);
	}

	@Override
	public List<StopResponse> getTripStops(Long tripId) {
		Trip trip = tripRepository.findById(tripId)
				.orElseThrow(() -> new ResourceNotFoundException("Trip not found"));
		com.backend.smarttransithub.entities.Route route = trip.getRoute() != null ? trip.getRoute() : (trip.getBus() != null ? trip.getBus().getRoute() : null);
		if (route == null) {
			return List.of();
		}
		List<Stop> stops = stopRepository.findByRouteIdOrderBySequenceOrderAsc(route.getId());
		return stops.stream().map(s -> new StopResponse(
				s.getId(),
				s.getStopName(),
				s.getLatitude(),
				s.getLongitude(),
				s.getSequenceOrder()
		)).toList();
	}

	@Override
	public List<StopResponse> getRouteStops(Long routeId) {
		List<Stop> stops = stopRepository.findByRouteIdOrderBySequenceOrderAsc(routeId);
		return stops.stream().map(s -> new StopResponse(
				s.getId(),
				s.getStopName(),
				s.getLatitude(),
				s.getLongitude(),
				s.getSequenceOrder()
		)).toList();
	}

	@Override
	public Map<String, Object> getActiveTripForParent(Long parentUserId) {
		List<Student> students = studentRepository.findByParentId(parentUserId);
		if (students != null && !students.isEmpty()) {
			for (Student s : students) {
				if (s.getStop() != null && s.getStop().getRoute() != null) {
					Long routeId = s.getStop().getRoute().getId();
					Trip activeTrip = tripRepository.findFirstByRouteIdAndStatus(routeId, TripStatus.IN_PROGRESS).orElse(null);
					if (activeTrip != null) {
						Map<String, Object> res = new HashMap<>();
						res.put("tripId", activeTrip.getId());
						res.put("busId", activeTrip.getBus().getId());
						res.put("busNumber", activeTrip.getBus().getBusNumber());
						res.put("routeName", activeTrip.getRoute() != null ? activeTrip.getRoute().getRouteName() : "Route");
						res.put("studentName", s.getFirstName() + " " + s.getLastName());
						res.put("routeId", routeId);
						return res;
					}
				}
			}
		}

		// Fallback: check any in-progress trip in system
		List<Trip> allTrips = tripRepository.findAll();
		for (Trip t : allTrips) {
			if (t.getStatus() == TripStatus.IN_PROGRESS) {
				Map<String, Object> res = new HashMap<>();
				res.put("tripId", t.getId());
				res.put("busId", t.getBus().getId());
				res.put("busNumber", t.getBus().getBusNumber());
				res.put("routeName", t.getRoute() != null ? t.getRoute().getRouteName() : "Main Route");
				res.put("routeId", t.getRoute() != null ? t.getRoute().getId() : null);
				return res;
			}
		}

		// Secondary Fallback: check Redis active trip keys directly
		for (Long busId : List.of(1L, 2L, 3L, 4L, 5L)) {
			Long activeTripId = redisService.getActiveTripId(busId);
			if (activeTripId != null) {
				Map<String, Object> res = new HashMap<>();
				res.put("tripId", activeTripId);
				res.put("busId", busId);
				res.put("busNumber", "BUS-" + busId);
				res.put("routeName", "Active Route");
				return res;
			}
		}

		return null;
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
