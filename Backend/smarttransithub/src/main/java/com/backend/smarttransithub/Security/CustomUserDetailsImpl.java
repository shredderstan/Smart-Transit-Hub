package com.backend.smarttransithub.Security;

import java.util.Collection;
import java.util.List;

import org.jspecify.annotations.Nullable;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.backend.smarttransithub.enums.Role;

import lombok.AllArgsConstructor;
import lombok.Getter;




@AllArgsConstructor
@Getter
public class CustomUserDetailsImpl implements UserDetails{

	private Long userId;
	private String userName;
	private String email;
	private String password;	
	private Role role;
	
	@Override
	public Collection<? extends GrantedAuthority> getAuthorities() {
		return List.of(new SimpleGrantedAuthority(this.role.name()));
	}

	@Override
	public @Nullable String getPassword() {
		return this.password;
	}

	@Override
	public String getUsername() {
		return this.email;
	}

}
