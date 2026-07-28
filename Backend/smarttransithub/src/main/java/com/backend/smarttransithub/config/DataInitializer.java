package com.backend.smarttransithub.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.backend.smarttransithub.entities.User;
import com.backend.smarttransithub.enums.Role;
import com.backend.smarttransithub.repositories.UserRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Automatically pre-seed the Super Administrator if not present in the database
        if (userRepository.findByUsername("admin").isEmpty()) {
            User admin = new User();
            admin.setUsername("admin");
            // Encrypt default password using BCrypt
            admin.setPasswordHash(passwordEncoder.encode("admin123"));
            admin.setFullName("Super Administrator");
            admin.setPhoneNumber("+15010-1001");
            admin.setRole(Role.ROLE_ADMIN);
            admin.setIsActive(true);

            userRepository.save(admin);
            System.out.println("========================================================================");
            System.out.println(">>> DATABASE INITIALIZED: Super Admin seeded ('admin' / 'admin123')");
            System.out.println("========================================================================");
        }
    }

}
