package com.backend.smarttransithub.services;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.backend.smarttransithub.Security.CustomUserDetailsImpl;
import com.backend.smarttransithub.Security.JwtUtils;
import com.backend.smarttransithub.dtos.request.LoginDto;
import com.backend.smarttransithub.dtos.response.AuthResp;
import com.backend.smarttransithub.repositories.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;



@Service
@Transactional
@Slf4j
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

	private final UserRepository userRepository;
	
	
	private final PasswordEncoder encoder;
	private final AuthenticationManager manager;
	private final JwtUtils jwtUtils;

	@Override
	public AuthResp authenticateUser(LoginDto request) {
		
		UsernamePasswordAuthenticationToken token=new UsernamePasswordAuthenticationToken(request.getUserName(), request.getPassword());
		
		log.info("******** Before auth {} ",token.isAuthenticated()); 
		Authentication fullyAutheticated = manager.authenticate(token);
		log.info("******** After succesful  auth {}" ,fullyAutheticated.isAuthenticated()); //true
		log.info("******** Contents of auth {} ", fullyAutheticated.getPrincipal());//custom user details
		CustomUserDetailsImpl userDetails =(CustomUserDetailsImpl) fullyAutheticated.getPrincipal();
		
		return new AuthResp(userDetails.getUserId(), jwtUtils.generateJwt(userDetails));
		
	}
}










