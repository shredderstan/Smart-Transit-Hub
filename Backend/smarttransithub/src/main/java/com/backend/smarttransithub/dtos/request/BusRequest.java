package com.backend.smarttransithub.dtos.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BusRequest {

    private String busNumber;

    private String plateNumber;

    private Integer capacity;

    private Long driverUserId;

    private Long routeId;

}