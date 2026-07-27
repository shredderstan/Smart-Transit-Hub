package com.backend.smarttransithub.dtos.request;

import com.backend.smarttransithub.enums.Role;

import jakarta.persistence.Column;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class RegisterDto {
	private String username;
	private String plainPassword;
	private String fullName;
	private String phoneNumber;
	private Role role;
}
