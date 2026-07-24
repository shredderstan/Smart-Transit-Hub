package com.backend.smarttransithub.exceptions_handler;



import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.backend.smarttransithub.dtos.response.ApiResponse;
import com.backend.smarttransithub.exceptions.ResourceNotFoundException;

@RestControllerAdvice
public class GlobalExceptionHandler {
	
	@ExceptionHandler(ResourceNotFoundException.class)
	public ResponseEntity<?> handleResourceNotFoundException(ResourceNotFoundException e) {
		System.out.println("in resource not found exc");
		return ResponseEntity.status(HttpStatus.NOT_FOUND) // SC 404
				.body(new ApiResponse("Failed", e.getMessage()));
	}

	@ExceptionHandler(AuthenticationException.class)
	public ResponseEntity<?> handleAuthenticationFailedException(AuthenticationException e) {
		System.out.println("in auth failed exc");
		return ResponseEntity.status(HttpStatus.UNAUTHORIZED) // SC 401
				.body(new ApiResponse("Failed", e.getMessage()));
	}


	// handle all remaining excs - catch all
	@ExceptionHandler(RuntimeException.class)
	public ResponseEntity<?> handleRuntimeException(RuntimeException e) {
		System.out.println("in catch-all  exc");
		return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR) // SC 500
				.body(new ApiResponse("Failed", e.getMessage()));
	}

}
