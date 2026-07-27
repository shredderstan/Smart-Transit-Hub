package com.backend.smarttransithub.dtos.response;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TelemetryResponseDto {
    private String nextStopName;
    private Double distanceToNextStop;
    private Integer nextStopIndex;
    private String statusMessage;
}