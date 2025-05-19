package com.postgresql.springapi.controller;

import com.postgresql.springapi.config.PasswordEncoderConfig;
import com.postgresql.springapi.dto.ApiResponse;
import com.postgresql.springapi.dto.EmployeeDto;
import com.postgresql.springapi.dto.PagedResponse;
import com.postgresql.springapi.exception.ResourceNotFoundException;
import com.postgresql.springapi.entity.Employee;
import com.postgresql.springapi.service.EmployeeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/employees")
public class EmployeeController {

    @Autowired
    private EmployeeService employeeService;
    private final PasswordEncoderConfig passwordEncoder;

    public EmployeeController(PasswordEncoderConfig passwordEncoder) {
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<EmployeeDto>>> getAllEmployees(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int pageSize) {

        List<Employee> allEmployees = employeeService.findAll();

        int totalItems = allEmployees.size();
        int totalPages = (int) Math.ceil((double) totalItems / pageSize);
        int fromIndex = Math.min((page - 1) * pageSize, totalItems);
        int toIndex = Math.min(fromIndex + pageSize, totalItems);

        List<EmployeeDto> pagedItems = allEmployees.subList(fromIndex, toIndex)
                .stream().map(employee -> {
                    EmployeeDto dto = new EmployeeDto();
                    dto.setId(employee.getId());
                    dto.setName(employee.getName());
                    dto.setPosition(employee.getPosition());
                    dto.setEmail(employee.getEmail());
                    dto.setDepartment(employee.getDepartment());
                    dto.setSalary(employee.getSalary());
                    dto.setPhone(employee.getPhone());
                    dto.setAddress(employee.getAddress());
                    dto.setJoinDate(employee.getJoinDate());
                    return dto;
                }).collect(Collectors.toList());

        PagedResponse<EmployeeDto> pagedResponse = new PagedResponse<>();
        pagedResponse.setPage(page);
        pagedResponse.setPageSize(pageSize);
        pagedResponse.setTotalItems(totalItems);
        pagedResponse.setTotalPages(totalPages);
        pagedResponse.setItems(pagedItems);

        ApiResponse<PagedResponse<EmployeeDto>> response = new ApiResponse<>(
                "0000",
                "Operation completed successfully.",
                pagedResponse
        );

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Employee> getEmployeeById(@PathVariable Long id) {
        Employee employee = employeeService.findById(id).orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + id));
        return ResponseEntity.ok(employee);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteEmployee(@PathVariable Long id) {
        employeeService.findById(id).orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + id));
        employeeService.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping
    public ResponseEntity<Employee> createEmployee(@RequestBody Employee employee) {
        employee.setPassword(passwordEncoder.encode(employee.getPassword()));
        Employee savedEmployee = employeeService.save(employee);
        return new ResponseEntity<>(savedEmployee, HttpStatus.CREATED);
    }


    @GetMapping("/search")
    public ResponseEntity<List<Employee>> searchEmployees(@RequestParam String query) {
        List<Employee> results = employeeService.searchEmployees(query);
        return ResponseEntity.ok(results);
    }


    @PutMapping("/{id}")
    public ResponseEntity<?> updateEmployee(@PathVariable Long id, @RequestBody Employee employeeDetails) {
        try {
            Employee employee = employeeService.findById(id).orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + id));

            // อัปเดตข้อมูล
            employee.setName(employeeDetails.getName());

            // ตรวจสอบรหัสผ่าน - ถ้าเป็นรหัสที่ถูกเข้ารหัสแล้ว ไม่ต้องเข้ารหัสอีก
            if (employeeDetails.getPassword() != null) {
                if (!employeeDetails.getPassword().startsWith("$2a$")) {
                    // เข้ารหัสเฉพาะรหัสผ่านที่ยังไม่ได้เข้ารหัส
                    employee.setPassword(passwordEncoder.encode(employeeDetails.getPassword()));
                } else {
                    // ใช้รหัสผ่านที่เข้ารหัสแล้วโดยตรง
                    employee.setPassword(employeeDetails.getPassword());
                }
            }

            employee.setEmail(employeeDetails.getEmail());
            employee.setPosition(employeeDetails.getPosition());
            employee.setDepartment(employeeDetails.getDepartment());
            employee.setAddress(employeeDetails.getAddress());
            employee.setSalary(employeeDetails.getSalary());
            employee.setPhone(employeeDetails.getPhone());
            employee.setRole(employeeDetails.getRole());
            employee.setJoinDate(employeeDetails.getJoinDate());

            // รักษาค่า createdAt และ enabled ถ้ามีอยู่แล้ว
            if (employee.getCreatedAt() != null && employeeDetails.getCreatedAt() == null) {
                // ไม่เปลี่ยนค่าที่มีอยู่แล้ว
            } else {
                employee.setCreatedAt(employeeDetails.getCreatedAt());
            }

            if (employee.getEnabled() != null && employeeDetails.getEnabled() == null) {
                // ไม่เปลี่ยนค่าที่มีอยู่แล้ว
            } else {
                employee.setEnabled(employeeDetails.getEnabled());
            }

            Employee updatedEmployee = employeeService.save(employee);
            return ResponseEntity.ok(updatedEmployee);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error updating employee: " + e.getMessage());
        }
    }
}

