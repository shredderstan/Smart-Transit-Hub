package com.backend.smarttransithub.dtos.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BusResponse {

    private Long id;

    private String busNumber;

    private String plateNumber;

    private Integer capacity;

    private Long driverId;

    private String driverName;

    private Long routeId;

    private String routeName;

}