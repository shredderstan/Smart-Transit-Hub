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
public class TripDataResponse {
	private Double latitude;
	private Double longitude;
	private Double speed;
	private LocalDateTime timestamp;
	private Long nextStopId;
	private String nextStopName;
	private Double distanceToNextStop;
}
