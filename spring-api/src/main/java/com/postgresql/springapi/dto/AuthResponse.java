package com.postgresql.springapi.dto;

import lombok.Data;

@Data
public class AuthResponse {

    private String token;
    private String message;
    private String role;

    // Constructor ที่รับทั้ง token, message และ role
    public AuthResponse(String token, String message, String role) {
        this.token = token;
        this.message = message;
        this.role = role; // กำหนด role ที่นี่
    }

}

