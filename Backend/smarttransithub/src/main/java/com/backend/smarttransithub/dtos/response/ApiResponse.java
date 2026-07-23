package com.backend.smarttransithub.dtos.response;



import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ApiResponse {
	private String status;
	private LocalDateTime timeStamp;
	private String message;

	public ApiResponse(String status, String message) {
		super();
		this.status = status;
		this.message = message;
		this.timeStamp = LocalDateTime.now();
	}

}

