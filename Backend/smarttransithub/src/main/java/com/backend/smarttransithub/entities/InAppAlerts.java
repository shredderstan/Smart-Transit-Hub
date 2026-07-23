package com.backend.smarttransithub.entities;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "in_app_alerts")
@Getter
@Setter
@NoArgsConstructor
public class InAppAlerts {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "in_app_alert_id")
    private Long id;
    private String message;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    @GeneratedValue
    private Instant timestamp;

    private Boolean isRead;

    public InAppAlerts(User user, String message) {
        this.user = user;
        this.message = message;
        this.isRead = false;
    }

}
