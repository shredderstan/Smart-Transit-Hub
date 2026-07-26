package com.backend.smarttransithub.dtos.request;

import com.backend.smarttransithub.enums.DevicePlatform;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class NotificationTokenDto {
    private String fcmToken;
    private DevicePlatform platform;
}
