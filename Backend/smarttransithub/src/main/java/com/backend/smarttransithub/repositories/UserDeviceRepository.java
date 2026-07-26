package com.backend.smarttransithub.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import com.backend.smarttransithub.entities.User;
import com.backend.smarttransithub.entities.UserDevice;
import com.backend.smarttransithub.enums.DevicePlatform;

public interface UserDeviceRepository extends JpaRepository<UserDevice, Long> {

    public List<UserDevice> findByUserId(Long userId);

    public List<UserDevice> findByFcmToken(String fcmToken);

    public Optional<UserDevice> findByFcmTokenAndUser(String fcmToken, User user);

    public Optional<UserDevice> findByFcmTokenAndUserAndDeviceType(String fcmToken, User user, DevicePlatform devicePlatform);
}
