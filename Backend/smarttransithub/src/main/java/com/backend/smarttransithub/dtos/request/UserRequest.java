package com.backend.smarttransithub.dtos.request;



import com.backend.smarttransithub.enums.Role;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class UserRequest {

    private String username;

    private String password;

    private String fullName;

    private String phoneNumber;

    private Role role;

}