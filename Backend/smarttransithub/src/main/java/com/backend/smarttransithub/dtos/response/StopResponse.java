package com.backend.smarttransithub.dtos.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class StopResponse {

    private Long id;

    private String stopName;

    private Double latitude;

    private Double longitude;

    private Integer sequenceOrder;

}