package com.postgresql.jwt.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.NoOpPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class PasswordEncoderConfig {
//    @Bean
//    public PasswordEncoder passwordEncoder() {
////        return new BCryptPasswordEncoder();
//        // ใช้ NoOpPasswordEncoder แทน BCryptPasswordEncoder
//        return NoOpPasswordEncoder.getInstance();
//    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    public String encode(String password) {
        return passwordEncoder().encode(password);
    }
}
