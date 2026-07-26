package com.backend.smarttransithub.services;

import java.util.List;

import com.backend.smarttransithub.dtos.request.NotificationTokenDto;
import com.backend.smarttransithub.dtos.response.ApiResponse;
import com.backend.smarttransithub.dtos.response.StudentResponse;
import com.backend.smarttransithub.dtos.response.TripDataResponse;

public interface ParentService {
	List<StudentResponse> getStudents(Long id);
	TripDataResponse getLatestTripData(Long tripId);
	ApiResponse registerNotificationToken(Long userId, NotificationTokenDto request);
	ApiResponse removeNotificationToken(Long userId, NotificationTokenDto request);
}
