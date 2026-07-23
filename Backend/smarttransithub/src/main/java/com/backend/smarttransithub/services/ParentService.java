package com.backend.smarttransithub.services;

import java.util.List;

import com.backend.smarttransithub.dtos.response.StudentResponse;

public interface ParentService {
	List<StudentResponse> getStudents();
}
