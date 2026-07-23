package com.backend.smarttransithub.dtos.request;


import lombok.Data;

@Data
public class TelemetryDataDto {

    private String tripId;
    private Double latitude;
    private Double longitude;
    private Double speed;
}
