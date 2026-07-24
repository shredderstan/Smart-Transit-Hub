package com.backend.smarttransithub.services;

import java.util.List;

import com.backend.smarttransithub.dtos.response.StudentResponse;
import com.backend.smarttransithub.dtos.response.TripDataResponse;

public interface ParentService {
	List<StudentResponse> getStudents(Long id);
	TripDataResponse getLatestTripData(Long tripId);
}
