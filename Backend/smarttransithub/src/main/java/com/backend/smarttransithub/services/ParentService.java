package com.backend.smarttransithub.services;

import java.util.List;
import java.util.Map;

import com.backend.smarttransithub.dtos.request.NotificationTokenDto;
import com.backend.smarttransithub.dtos.response.ApiResponse;
import com.backend.smarttransithub.dtos.response.StopResponse;
import com.backend.smarttransithub.dtos.response.StudentResponse;
import com.backend.smarttransithub.dtos.response.TripDataResponse;

public interface ParentService {
	List<StudentResponse> getStudents(Long id);
	TripDataResponse getLatestTripData(Long tripId);
	List<StopResponse> getTripStops(Long tripId);
	List<StopResponse> getRouteStops(Long routeId);
	Map<String, Object> getActiveTripForParent(Long parentUserId);
	ApiResponse registerNotificationToken(Long userId, NotificationTokenDto request);
	ApiResponse removeNotificationToken(Long userId, NotificationTokenDto request);
}
