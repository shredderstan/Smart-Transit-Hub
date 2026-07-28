package com.backend.smarttransithub.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.backend.smarttransithub.entities.User;
import com.backend.smarttransithub.enums.Role;




public interface UserRepository extends JpaRepository<User, Long>{
	
	Optional<User> findByUsername(String username);
	
	List<User> findByRole(Role role);

	boolean existsByUsername(String username);

}
