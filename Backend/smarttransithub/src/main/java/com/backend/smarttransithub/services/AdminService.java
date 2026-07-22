package com.backend.smarttransithub.services;

import java.util.List;

import com.backend.smarttransithub.dtos.request.UserRequest;
import com.backend.smarttransithub.entities.User;
import com.backend.smarttransithub.enums.Role;



public interface AdminService {
	List<User> getUsers(Role role);
	User createUser(UserRequest request);
	User updateUser(Long id, UserRequest request);
	void deleteUser(Long id);
	
}
