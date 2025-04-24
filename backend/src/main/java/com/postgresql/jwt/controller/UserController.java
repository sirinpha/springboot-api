package com.postgresql.jwt.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/user")
public class UserController {

    @GetMapping("/profile")
    public ResponseEntity<?> getUserProfile(Authentication authentication) {
        // authentication.getName() จะให้ username ของผู้ใช้ที่ล็อกอินแล้ว
        return ResponseEntity.ok("Profile of user: " + authentication.getName());
    }
}