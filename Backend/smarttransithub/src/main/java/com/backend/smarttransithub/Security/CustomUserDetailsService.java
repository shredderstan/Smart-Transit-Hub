package com.backend.smarttransithub.Security;


import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.backend.smarttransithub.entities.User;
import com.backend.smarttransithub.exceptions.ResourceNotFoundException;
import com.backend.smarttransithub.repositories.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {
	private final UserRepository userRepo;
	@Override
	public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
		log.info("********* in load user by user name ");
		User user = userRepo.findByEmail(username).orElseThrow(()-> new ResourceNotFoundException("Email not found"));
		
		return new CustomUserDetailsImpl(user.getId(), user.getFullName(), user.getUsername(), user.getPasswordHash(), user.getRole());	
	}

}
