package com.backend.smarttransithub.services;

import java.util.List;

import javax.management.RuntimeErrorException;
import org.springframework.security.crypto.password.PasswordEncoder;
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

    private final PasswordEncoder passwordEncoder;

	private final UserRepository userRepo;

    AdminServiceImpl(PasswordEncoder passwordEncoder) {
        this.passwordEncoder = passwordEncoder;
    }

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
		
		if(!userRepo.findByUsername(request.getUsername()).isEmpty())
			throw new RuntimeException("Username already exists");
		
		user.setUsername(request.getUsername());
		user.setPasswordHash(request.getPassword());
		user.setFullName(request.getFullName());
		user.setPhoneNumber(request.getPhoneNumber());
		user.setRole(request.getRole());
		user.setIsActive(true);
		
		return userRepo.save(user);
	}

	@Override
	public User updateUser(Long id, UserRequest request) {
		
		User user = userRepo.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
		
		user.setUsername(request.getUsername());
	    user.setFullName(request.getFullName());
	    user.setPhoneNumber(request.getPhoneNumber());
	    user.setRole(request.getRole());		// this means only admin can update, should change
	    
	    if(request.getPassword() != null && request.getPassword() != "")
	    	user.setPasswordHash(passwordEncoder.encode(request.getPassword()));	
	    
	    // can create a different dto for update only where password can be null idk
	    
	    return userRepo.save(user);
	    
	}

	@Override
	public void deleteUser(Long id) {
		
		User user = userRepo.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
		
		user.setIsActive(false);
		
		userRepo.save(user);
		
	}

}
