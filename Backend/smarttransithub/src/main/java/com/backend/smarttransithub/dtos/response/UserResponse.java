package com.backend.smarttransithub.dtos.response;



import com.backend.smarttransithub.enums.Role;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class UserResponse {

    private Long id;

    private String username;

    private String fullName;

    private String phoneNumber;

    private Role role;

    private Boolean isActive;

}