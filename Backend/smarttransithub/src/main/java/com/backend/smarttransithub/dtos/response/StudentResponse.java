package com.backend.smarttransithub.dtos.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class StudentResponse {

    private Long id;

    private String firstName;

    private String lastName;

    private String rollNumber;

    private Long parentId;


    private Long stopId;

    private String stopName;

}