package com.backend.smarttransithub.dtos.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class TripInitializationDto {
    private String busId;
    private String routeId;
    private String tripType; // Must be "PICKUP" or "DROP"
}