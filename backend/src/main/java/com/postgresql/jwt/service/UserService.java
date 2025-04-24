package com.postgresql.jwt.service;

import com.postgresql.jwt.model.Employee;
import com.postgresql.jwt.dto.RegisterRequest;
import com.postgresql.jwt.repository.UserRepository;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.security.Key;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
public class UserService implements UserDetailsService {

    private final UserRepository userRepository;
    private PasswordEncoder passwordEncoder;
    private final Key secretKey;

    @Autowired
    public UserService(
            PasswordEncoder passwordEncoder,
            UserRepository userRepository,
            @Value("${jwt.secret}") String secret) {
        this.passwordEncoder = passwordEncoder;
        this.userRepository = userRepository;
        // Convert the string secret to a secure key
        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes());
    }

    @Autowired
    public void setPasswordEncoder(PasswordEncoder passwordEncoder) {
        this.passwordEncoder = passwordEncoder;
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(secretKey)
                    .build()
                    .parseClaimsJws(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public boolean existsByUsername(String name) {
        return userRepository.existsByName(name);
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        System.out.println("Attempting to find user with username: " + username);

        Optional<Employee> userOpt = userRepository.findByName(username);
        System.out.println("User found: " + userOpt.isPresent());

        Employee user = userOpt.orElseThrow(() -> {
            System.out.println("User not found!");
            return new UsernameNotFoundException("User not found with username: " + username);
        });

        System.out.println("Found user: " + user.getName() + ", password: " + user.getPassword());
        // เพิ่ม logging เพื่อดีบัก
        System.out.println("Found user: " + user.getName());
        System.out.println("Stored password: " + user.getPassword());

        // สร้างออบเจ็คที่ใช้คืนข้อมูลจริง
        return new org.springframework.security.core.userdetails.User(
                user.getName(),
                user.getPassword(), // ดีเจด password มีเว้าวลเลอร์
                user.getEnabled(),
                true, // accountNonExpired
                true, // credentialsNonExpired
                true, // accountNonLocked
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + user.getRole()))
        );
    }

    public Employee createUser(RegisterRequest registerRequest) {
        if (userRepository.existsByName(registerRequest.getName())) {
            throw new RuntimeException("Username is already taken!");
        }
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new RuntimeException("Email already exists");
        }
        Employee user = new Employee();
        user.setName(registerRequest.getName());
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        user.setEmail(registerRequest.getEmail());
        user.setPosition(registerRequest.getPosition());
        user.setDepartment(registerRequest.getDepartment());
        user.setJoinDate(LocalDate.from(LocalDateTime.now()));
        user.setCreatedAt(new Date());
        user.setEnabled(true);
        user.setRole("USER");

        return userRepository.save(user);
    }

    public List<Employee> findAll() {
        return userRepository.findAll();
    }

    public Optional<Employee> findById(Long id) {
        return userRepository.findById(id);
    }

    public Employee save(Employee employee) {
        return userRepository.save(employee);
    }

    public List<Employee> searchByName(String query) {
        return userRepository.findByNameContainingIgnoreCase(query);
    }

    public void deleteById(Long id) {
        userRepository.deleteById(id);
    }

}