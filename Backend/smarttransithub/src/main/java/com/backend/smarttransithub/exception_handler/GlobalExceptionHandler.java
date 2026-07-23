package com.backend.smarttransithub.exception_handler;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.backend.smarttransithub.dtos.response.ApiResp;
import com.backend.smarttransithub.exceptions.ResourceNotFoundException;

import lombok.extern.slf4j.Slf4j;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

	@ExceptionHandler(ResourceNotFoundException.class)
	public ResponseEntity<?>  handleResourceNotFoundException(ResourceNotFoundException e){
		System.out.println("in ResourceNotFoundException handler");
		return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ApiResp("failed", e.getMessage()));
	}
	
	@ExceptionHandler(AuthenticationException.class)
	public ResponseEntity<?> handleAuthenticationFailedException(AuthenticationException e) {
		log.info("in auth failed exc");
		return ResponseEntity.status(HttpStatus.UNAUTHORIZED) // SC 401
				.body(new ApiResp("Failed", e.getMessage()));
	}
	
	
	@ExceptionHandler(RuntimeException.class)
	public ResponseEntity<?> handleRuntimeException(RuntimeException e) {
		System.out.println("in catch-all  exc");
		return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR) // SC 500
				.body(new ApiResp("Failed", e.getMessage()));
	}
}
