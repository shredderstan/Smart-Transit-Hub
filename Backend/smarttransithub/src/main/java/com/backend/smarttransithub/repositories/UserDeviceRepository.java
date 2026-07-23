package com.backend.smarttransithub.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.backend.smarttransithub.entities.UserDevice;

public interface UserDeviceRepository extends JpaRepository<UserDevice, Long> {

    public List<UserDevice> findByUserId(Long userId);
}
