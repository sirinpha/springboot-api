package com.postgresql.jwt.config;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class ViewController {

    @GetMapping("/login-page")
    public String showLoginPage() {
        return "login";
    }

    @GetMapping("/register-page")
    public String showRegisterPage() {
        return "register";
    }

    @GetMapping("/dashboard")
    public String showDashboard() {
        return "dashboard";
    }
}
