package com.backend.smarttransithub.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.backend.smarttransithub.entities.Student;

public interface StudentRepository extends JpaRepository<Student, Long> {
	

}
