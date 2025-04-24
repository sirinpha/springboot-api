package com.postgresql.jwt.controller;

import ch.qos.logback.classic.encoder.JsonEncoder;
import com.postgresql.jwt.config.PasswordEncoderConfig;
import com.postgresql.jwt.model.Employee;
import com.postgresql.jwt.repository.UserRepository;
import com.postgresql.jwt.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/api/employees")
public class EmployeeController {

    @Autowired
    private UserService employeeService;
    private final PasswordEncoderConfig passwordEncoder;

    public EmployeeController(PasswordEncoderConfig passwordEncoder) {
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping
    public ResponseEntity<List<Employee>> getAllEmployees() {
        List<Employee> employees = employeeService.findAll();
        return ResponseEntity.ok(employees);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Employee> getEmployeeById(@PathVariable Long id) {
        Employee employee = employeeService.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + id));
        return ResponseEntity.ok(employee);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteEmployee(@PathVariable Long id) {
        try {
            employeeService.deleteById(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error deleting employee: " + e.getMessage());
        }
    }

    @PostMapping
    public ResponseEntity<Employee> createEmployee(@RequestBody Employee employee) {
        employee.setPassword(passwordEncoder.encode(employee.getPassword()));
        Employee savedEmployee = employeeService.save(employee);
        return new ResponseEntity<>(savedEmployee, HttpStatus.CREATED);
    }

    @GetMapping("/search")
    public ResponseEntity<List<Employee>> searchEmployees(@RequestParam String query) {
//        return ResponseEntity.ok(employeeService.search(query));
        return ResponseEntity.ok(employeeService.searchByName(query));
    }



    @PutMapping("/{id}")
    public ResponseEntity<?> updateEmployee(@PathVariable Long id, @RequestBody Employee employeeDetails) {
        try {
            Employee employee = employeeService.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + id));

            // อัปเดตข้อมูลพนักงาน
            employee.setName(employeeDetails.getName());
            employee.setEmail(employeeDetails.getEmail());
            employee.setPosition(employeeDetails.getPosition());
            // อัปเดตฟิลด์อื่นๆ ตามที่จำเป็น

            Employee updatedEmployee = employeeService.save(employee);
            return ResponseEntity.ok(updatedEmployee);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error updating employee: " + e.getMessage());
        }
    }

}