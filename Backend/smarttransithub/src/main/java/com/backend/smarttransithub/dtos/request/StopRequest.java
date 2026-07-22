package com.backend.smarttransithub.dtos.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class StopRequest {

    private String stopName;

    private Double latitude;

    private Double longitude;

    private Integer sequenceOrder;

}