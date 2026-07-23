package com.backend.smarttransithub.services;

import java.util.List;

import org.springframework.security.crypto.password.PasswordEncoder;
//import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.backend.smarttransithub.dtos.request.UserRequest;
import com.backend.smarttransithub.entities.User;
import com.backend.smarttransithub.enums.Role;
import com.backend.smarttransithub.repositories.UserRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminServiceImpl implements AdminService{

	private final UserRepository userRepo;
	private final PasswordEncoder passwordEncoder;

	@Override
	public List<User> getUsers(Role role) {
		
		if(role == null)
			return userRepo.findAll();
		else
			return userRepo.findByRole(role);
	}

	@Override
	public User createUser(UserRequest request) {
		User user = new User();
		
		user.setUsername(request.getUsername());
		String hashedPassword = passwordEncoder.encode(request.getPassword());
		user.setPasswordHash(hashedPassword);
		user.setFullName(request.getFullName());
		user.setPhoneNumber(request.getPhoneNumber());
		user.setRole(request.getRole());
		user.setIsActive(true);
		
		return userRepo.save(user);
	}

}
