package com.backend.smarttransithub.services;

import java.util.List;

import org.springframework.stereotype.Service;

import com.backend.smarttransithub.dtos.response.StudentResponse;
import com.backend.smarttransithub.repositories.UserRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@Transactional
@RequiredArgsConstructor
public class ParentServiceImpl implements ParentService {

	private final UserRepository userRepo;
	
	@Override
	public List<StudentResponse> getStudents() {
		
	}

}
