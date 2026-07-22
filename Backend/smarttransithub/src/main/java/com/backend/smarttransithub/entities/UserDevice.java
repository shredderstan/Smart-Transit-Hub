package com.backend.smarttransithub.entities;

import java.time.LocalDateTime;

import org.hibernate.annotations.UpdateTimestamp;

import com.backend.smarttransithub.enums.DevicePlatform;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "user_devices", uniqueConstraints = {@UniqueConstraint(columnNames = "fcm_token")})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserDevice extends BaseEntity{
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "user_device_id")
	private Long id;
	
	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "user_id", nullable = false, foreignKey = @ForeignKey(name = "fk_user_device_user"))
	private User user;
	
	@Column(name = "fcm_token", nullable = false, length = 255)
	private String fcmToken;
	
	@Enumerated(EnumType.STRING)
	@Column(name = "device_type", nullable = false, length = 20)
	private DevicePlatform deviceType;
	
	@UpdateTimestamp
	@Column(name = "last_updated", nullable = false)
	private LocalDateTime lastUpdated;
	
}
