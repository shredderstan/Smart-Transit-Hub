package com.backend.smarttransithub.exceptions;

public class DuplicateUsernameException extends RuntimeException{
	private String message;
	public DuplicateUsernameException(String message) {
		super(message);
	}
}
