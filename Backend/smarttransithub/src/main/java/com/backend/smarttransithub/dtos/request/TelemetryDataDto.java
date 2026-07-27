package com.backend.smarttransithub.dtos.request;

import lombok.Data;

@Data
public class TelemetryDataDto {

    private Long tripId;
    private String busNumber;
    private Double latitude;
    private Double longitude;
    private Double speed;
}
