package com.backend.smarttransithub.dtos.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class StudentRequest {

    private String firstName;

    private String lastName;

    private String rollNumber;

    private Long parentId;

    private Long stopId;

}