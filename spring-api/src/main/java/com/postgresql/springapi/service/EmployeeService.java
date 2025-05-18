package com.postgresql.springapi.service;

import com.postgresql.springapi.config.PasswordEncoderConfig;
import com.postgresql.springapi.dto.RegisterRequest;
import com.postgresql.springapi.entity.Employee;
import com.postgresql.springapi.repository.EmployeeRepository;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.ResponseStatus;

import java.security.Key;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
@ResponseStatus(HttpStatus.NOT_FOUND)
public class EmployeeService implements UserDetailsService {

    private final EmployeeRepository employeeRepository;
    private PasswordEncoderConfig passwordEncoder;
    private final Key secretKey;

    @Autowired
    public EmployeeService(
            PasswordEncoderConfig passwordEncoder,
            EmployeeRepository employeeRepository,
            @Value("${jwt.secret}") String secret) {
        this.passwordEncoder = passwordEncoder;
        this.employeeRepository = employeeRepository;
        // Convert the string secret to a secure key
        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes());
    }

    @Autowired
    public void setPasswordEncoder(PasswordEncoderConfig passwordEncoder) {
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
        return employeeRepository.existsByName(name);
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        System.out.println("Attempting to find user with username: " + username);

        Optional<Employee> userOpt = employeeRepository.findByName(username);
        System.out.println("User found: " + userOpt.isPresent());

        Employee user = userOpt.orElseThrow(() -> {
            System.out.println("User not found!");
            return new UsernameNotFoundException("User not found with username: " + username);
        });
        // สร้างออบเจ็คที่ใช้คืนข้อมูลจริง
        return new org.springframework.security.core.userdetails.User(
                user.getName(),
                user.getPassword(),
                user.getEnabled(),
                true, // accountNonExpired
                true, // credentialsNonExpired
                true, // accountNonLocked
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + user.getRole()))
        );
    }

    public Employee createUser(RegisterRequest registerRequest) {
        if (employeeRepository.existsByName(registerRequest.getName())) {
            throw new RuntimeException("Username is already taken!");
        }
        if (employeeRepository.existsByEmail(registerRequest.getEmail())) {
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

        return employeeRepository.save(user);
    }

    public List<Employee> findAll() {
        return employeeRepository.findAll(Sort.by(Sort.Direction.ASC, "id"));
    }

    public Optional<Employee> findById(Long id) {
        return employeeRepository.findById(id);
    }

    public Employee save(Employee employee) {
        return employeeRepository.save(employee);
    }


    public void deleteById(Long id) {
        employeeRepository.deleteById(id);
    }

    public List<Employee> searchEmployees(String query) {
        String searchTerm = "%" + query.toLowerCase() + "%";
        return employeeRepository.findBySearchTerm(searchTerm);
    }
}