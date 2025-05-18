package com.postgresql.springapi.dto;

public class AuthResponse {

    private String token;
    private String message;
    private String role;

    // Constructor ที่รับแค่ token
    public AuthResponse(String token) {
        this.token = token;
        this.message = "Authentication successful";
        this.role = null;  // ไม่มีการใช้งาน role
    }

    // Constructor ที่รับทั้ง token, message และ role
    public AuthResponse(String token, String message, String role) {
        this.token = token;
        this.message = message;
        this.role = role; // กำหนด role ที่นี่
    }

    public String getToken() {
        return token;
    }

    public String getMessage() {
        return message;
    }

    public String getRole() {
        return role;
    }
}

