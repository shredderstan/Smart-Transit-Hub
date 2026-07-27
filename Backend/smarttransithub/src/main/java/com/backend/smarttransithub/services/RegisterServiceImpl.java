package com.backend.smarttransithub.services;

import org.modelmapper.ModelMapper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.backend.smarttransithub.dtos.request.RegisterDto;
import com.backend.smarttransithub.dtos.response.ApiResponse;
import com.backend.smarttransithub.entities.User;
import com.backend.smarttransithub.exceptions.DuplicateUsernameException;
import com.backend.smarttransithub.repositories.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@Transactional
@RequiredArgsConstructor
public class RegisterServiceImpl implements RegisterService {
	private final UserRepository userRepository;
	private final ModelMapper mapper;
	private final PasswordEncoder passwordEncoder;
	
	@Override
	public ApiResponse addUser(RegisterDto request) {
		if(userRepository.existsByUsername(request.getUsername())) {
			return new ApiResponse("failed", "username already exists");
		}
		User user = mapper.map(request, User.class);
		String plainPassword = request.getPlainPassword();
		String hashedPassword = passwordEncoder.encode(plainPassword);
		user.setPasswordHash(hashedPassword);
		
		userRepository.save(user);
		return new ApiResponse("success", "user created");
	}

}
