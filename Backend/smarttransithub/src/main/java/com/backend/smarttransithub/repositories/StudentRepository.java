package com.backend.smarttransithub.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import com.backend.smarttransithub.entities.Student;

public interface StudentRepository extends JpaRepository<Student, Long> {

    @Override
    @EntityGraph(attributePaths = {"parent", "stop"})
    public List<Student> findAll();

    @EntityGraph(attributePaths = {"parent", "stop"})
    public List<Student> findByParentId(Long parentId);
    public List<Student> findByStopId(Long stopId);
	
}
