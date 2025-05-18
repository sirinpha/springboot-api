package com.postgresql.springapi.controller;


import com.postgresql.springapi.dto.AuthRequest;
import com.postgresql.springapi.dto.AuthResponse;
import com.postgresql.springapi.dto.RegisterRequest;
import com.postgresql.springapi.jwt.JwtTokenUtil;
import com.postgresql.springapi.model.Employee;
import com.postgresql.springapi.repository.EmployeeRepository;
import com.postgresql.springapi.services.EmployeeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;



import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserDetailsService userDetailsService;

    @Autowired
    private JwtTokenUtil jwtTokenUtil;

    @Autowired
    private EmployeeService userService;

    @Autowired
    private EmployeeRepository userRepository;

    @PostMapping("/login")
    public ResponseEntity<?> createAuthenticationToken(@RequestBody AuthRequest authRequest) {
        try {
            // Authenticate user
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            authRequest.getName(),
                            authRequest.getPassword()
                    )
            );

            // Get user details
            UserDetails userDetails = userDetailsService.loadUserByUsername(authRequest.getName());

            // Get user role from database
            Employee user = userRepository.findByName(authRequest.getName())
                    .orElseThrow(() -> new UsernameNotFoundException("User not found"));

            String role = user.getRole(); // ดึงค่า role จาก User model

            // Generate token
            final String token = jwtTokenUtil.generateToken(userDetails);

            // Return response with token and role
            return ResponseEntity.ok(new AuthResponse(token, "Authentication successful", role));
        } catch (BadCredentialsException e) {
            return ResponseEntity.badRequest()
                    .body(new AuthResponse(null, "Invalid username or password", null));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest registerRequest) {
        // Check if username already exists
        if (userService.existsByUsername(registerRequest.getName())) {
            return ResponseEntity.badRequest()
                    .body(new AuthResponse(null, "Username is already taken", registerRequest.getRole()));
        }

        if (registerRequest.getEmail() == null || registerRequest.getEmail().isEmpty()) {
            return ResponseEntity.badRequest().body(new AuthResponse(null, "Email is required", null));
        }

        // Create new user account
        userService.createUser(registerRequest);

        return ResponseEntity.ok(new AuthResponse(null, "User registered successfully", registerRequest.getRole()));
    }
}