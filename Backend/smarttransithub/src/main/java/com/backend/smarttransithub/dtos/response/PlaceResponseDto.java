package com.backend.smarttransithub.dtos.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PlaceResponseDto {
    private String name;
    private String address;
    private double latitude;
    private double longitude;
}
