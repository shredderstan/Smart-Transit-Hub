package com.backend.smarttransithub.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.backend.smarttransithub.entities.Student;
import java.util.List;


public interface StudentRepository extends JpaRepository<Student, Long> {

    public List<Student> findByParentId(Long parentId);
    public List<Student> findByStopId(Long stopId);

}
