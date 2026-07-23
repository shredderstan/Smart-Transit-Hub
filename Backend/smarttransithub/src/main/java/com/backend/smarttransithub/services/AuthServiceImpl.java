package com.backend.smarttransithub.services;

import org.modelmapper.ModelMapper;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import com.backend.smarttransithub.Security.CustomUserDetailsImpl;
import com.backend.smarttransithub.Security.CustomUserDetailsService;
import com.backend.smarttransithub.Security.JwtUtils;
import com.backend.smarttransithub.dtos.request.LoginDto;
import com.backend.smarttransithub.dtos.response.AuthResp;
import com.backend.smarttransithub.repositories.UserRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;


@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class AuthServiceImpl implements AuthService{
	
	private final UserRepository userRepo;
	private final ModelMapper mapper;

    private final JwtUtils jwtUtils;

    private final CustomUserDetailsService customUserDetailsService;

	private final AuthenticationManager manager;

  
	
	@Override
	public AuthResp authenticateUser(LoginDto request) {
		UsernamePasswordAuthenticationToken token = new UsernamePasswordAuthenticationToken(request.getUserName(), request.getPassword());
		log.info("************** before authentication : " + token.isAuthenticated());
		Authentication fullyAuthenticatedAuthentication = manager.authenticate(token);
		log.info("************** after authentication : " + token.isAuthenticated());
		
		CustomUserDetailsImpl userDetails = (CustomUserDetailsImpl) fullyAuthenticatedAuthentication.getPrincipal();
		
		return new AuthResp(userDetails.getUserId(), jwtUtils.generateJwt(userDetails));
	}

}

















