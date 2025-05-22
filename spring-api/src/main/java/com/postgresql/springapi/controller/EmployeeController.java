package com.postgresql.springapi.controller;

import com.postgresql.springapi.config.PasswordEncoderConfig;
import com.postgresql.springapi.dto.*;
import com.postgresql.springapi.exception.ResourceNotFoundException;
import com.postgresql.springapi.entity.Employee;
import com.postgresql.springapi.service.EmployeeService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import static org.springframework.data.jpa.domain.AbstractPersistable_.id;

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
    public ResponseEntity<ApiResponse<PagedResponse<EmployeesDto>>> getAllEmployees(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int pageSize) {

        List<Employee> allEmployees = employeeService.findAll();
        int totalItems = allEmployees.size();
        int totalPages = (int) Math.ceil((double) totalItems / pageSize);
        int fromIndex = Math.min((page - 1) * pageSize, totalItems);
        int toIndex = Math.min(fromIndex + pageSize, totalItems);

        List<EmployeesDto> pagedItems = allEmployees.subList(fromIndex, toIndex)
                .stream().map(employee -> {
                    EmployeesDto dto = new EmployeesDto();
                    dto.setId(employee.getId());
                    dto.setName(employee.getName());
                    dto.setPosition(employee.getPosition());
                    dto.setEmail(employee.getEmail());
                    dto.setDepartment(employee.getDepartment());
                    dto.setSalary(employee.getSalary());
                    dto.setPhone(employee.getPhone());
                    dto.setAddress(employee.getAddress());
                    dto.setJoinDate(employee.getJoinDate());
                    dto.setEnabled(employee.isEnabled());
                    return dto;
                }).collect(Collectors.toList());

        //constructed response
        PagedResponse<EmployeesDto> pagedResponse = new PagedResponse<>();
        pagedResponse.setPage(page);
        pagedResponse.setPageSize(pageSize);
        pagedResponse.setTotalItems(totalItems);
        pagedResponse.setTotalPages(totalPages);
        pagedResponse.setItems(pagedItems);

        ApiResponse<PagedResponse<EmployeesDto>> response = new ApiResponse<>(
                "0000",
                "Operation completed successfully.",
                pagedResponse
        );

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<EmployeesDto>> getEmployeeById(@PathVariable Long id) {
        Employee employee = employeeService.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + id));

        EmployeesDto dto = convertToEmployeesDto(employee);

        ApiResponse<EmployeesDto> response = new ApiResponse<>(
                "0000",
                "Employee found successfully",
                dto
        );

        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<MessageResponse> deleteEmployee(@PathVariable Long id) {
        employeeService.findById(id).orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + id));
        employeeService.deleteById(id);
        employeeService.deleteById(id);

        MessageResponse response = new MessageResponse("0000", "Employee deleted successfully.");
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<ApiResponse<EmployeesDto>> createEmployee(@Valid @RequestBody EmployeeCreateDto createDto) {
        try {
            // แปลง DTO เป็น Entity
            Employee employee = convertToEntity(createDto);

            // เข้ารหัสรหัสผ่าน
            employee.setPassword(passwordEncoder.encode(createDto.getPassword()));

            // บันทึกข้อมูล
            Employee savedEmployee = employeeService.save(employee);

            // แปลง Entity เป็น Response DTO
            EmployeesDto responseDto = convertToEmployeesDto(savedEmployee);

            // สร้าง consistent response format
            ApiResponse<EmployeesDto> response = new ApiResponse<>(
                    "0000",
                    "Employee created successfully",
                    responseDto
            );

            return new ResponseEntity<>(response, HttpStatus.CREATED);

        } catch (DataIntegrityViolationException e) {
            ApiResponse<EmployeesDto> response = new ApiResponse<>(
                    "1002",
                    "Email already exists or data conflict",
                    null
            );
            return ResponseEntity.status(HttpStatus.CONFLICT).body(response);

        } catch (Exception e) {
            System.err.println("Error creating employee: " + e.getMessage());
            ApiResponse<EmployeesDto> response = new ApiResponse<>(
                    "9999",
                    "Error creating employee",
                    null
            );
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<EmployeesDto>>> searchEmployees(@RequestParam @NotBlank(message = "Search query is required") String query) {
        try {
            if (query == null || query.trim().isEmpty()) {
                ApiResponse<List<EmployeesDto>> response = new ApiResponse<>(
                        "1001",
                        "Search query cannot be empty",
                        new ArrayList<>()
                );
                return ResponseEntity.badRequest().body(response);
            }

            String trimmedQuery = query.trim();

            // ใช้ method ที่ค้นหาจากชื่อเท่านั้น
            List<Employee> results = employeeService.searchEmployeesByName(trimmedQuery);

            List<EmployeesDto> searchResults = results.stream()
                    .map(this::convertToEmployeesDto)
                    .collect(Collectors.toList());

            String message = searchResults.isEmpty()
                    ? String.format("No employees found matching '%s'", trimmedQuery)
                    : String.format("Found %d employee%s matching '%s'",
                    searchResults.size(),
                    searchResults.size() > 1 ? "s" : "",
                    trimmedQuery);

            ApiResponse<List<EmployeesDto>> response = new ApiResponse<>(
                    "0000",
                    message,
                    searchResults
            );

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.err.println("Error searching employees by name: " + e.getMessage());

            ApiResponse<List<EmployeesDto>> response = new ApiResponse<>(
                    "9999",
                    "An error occurred while searching employees by name",
                    new ArrayList<>()
            );
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<EmployeesDto>> updateEmployee(
            @PathVariable Long id,
            @RequestBody Employee updateDto) {

        try {
            Employee employee = employeeService.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + id));

            // อัปเดตเฉพาะฟิลด์ที่ไม่เป็น null (Partial Update)
            if (updateDto.getName() != null) {
                employee.setName(updateDto.getName());
            }

            if (updateDto.getEmail() != null) {
                employee.setEmail(updateDto.getEmail());
            }

            if (updateDto.getPosition() != null) {
                employee.setPosition(updateDto.getPosition());
            }

            if (updateDto.getDepartment() != null) {
                employee.setDepartment(updateDto.getDepartment());
            }

            if (updateDto.getAddress() != null) {
                employee.setAddress(updateDto.getAddress());
            }

            if (updateDto.getSalary() != null) {
                employee.setSalary(updateDto.getSalary());
            }

            if (updateDto.getPhone() != null) {
                employee.setPhone(updateDto.getPhone());
            }

            if (updateDto.getRole() != null) {
                employee.setRole(updateDto.getRole());
            }

            if (updateDto.getJoinDate() != null) {
                employee.setJoinDate(updateDto.getJoinDate());
            }

            // จัดการรหัสผ่าน - เข้ารหัสใหม่เสมอ
            if (updateDto.getPassword() != null && !updateDto.getPassword().trim().isEmpty()) {
                employee.setPassword(passwordEncoder.encode(updateDto.getPassword()));
            }

            // จัดการ enabled field - ไม่ต้องเช็ค null สำหรับ boolean primitive
            employee.setEnabled(updateDto.isEnabled());

            Employee updatedEmployee = employeeService.save(employee);
            EmployeesDto responseDto = convertToEmployeesDto(updatedEmployee);

            ApiResponse<EmployeesDto> response = new ApiResponse<>(
                    "0000",
                    "Employee updated successfully",
                    responseDto
            );

            return ResponseEntity.ok(response);

        } catch (ResourceNotFoundException e) {
            ApiResponse<EmployeesDto> response = new ApiResponse<>(
                    "1001",
                    e.getMessage(),
                    null
            );
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);

        } catch (DataIntegrityViolationException e) {
            ApiResponse<EmployeesDto> response = new ApiResponse<>(
                    "1002",
                    "Data conflict: Email might already exist",
                    null
            );
            return ResponseEntity.status(HttpStatus.CONFLICT).body(response);

        } catch (Exception e) {
            System.err.println("Error updating employee with id: " + id + ", error: " + e.getMessage());
            ApiResponse<EmployeesDto> response = new ApiResponse<>(
                    "9999",
                    "Error updating employee",
                    null
            );
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // Helper methods
    private Employee convertToEntity(EmployeeCreateDto createDto) {
        Employee employee = new Employee();
        employee.setName(createDto.getName());
        employee.setEmail(createDto.getEmail());
        employee.setPosition(createDto.getPosition());
        employee.setDepartment(createDto.getDepartment());
        employee.setJoinDate(createDto.getJoinDate() != null ? createDto.getJoinDate() : LocalDate.now());
        employee.setSalary(createDto.getSalary());
        employee.setPhone(createDto.getPhone());
        employee.setAddress(createDto.getAddress());
        employee.setRole(createDto.getRole() != null ? createDto.getRole() : "USER");
        employee.setEnabled(createDto.isEnabled());
        return employee;
    }

    private EmployeesDto convertToEmployeesDto(Employee employee) {
        EmployeesDto dto = new EmployeesDto();
        dto.setId(employee.getId());
        dto.setName(employee.getName());
        dto.setPosition(employee.getPosition());
        dto.setEmail(employee.getEmail());
        dto.setDepartment(employee.getDepartment());
        dto.setSalary(employee.getSalary());
        dto.setPhone(employee.getPhone());
        dto.setAddress(employee.getAddress());
        dto.setJoinDate(employee.getJoinDate());
        dto.setEnabled(employee.isEnabled());
        return dto;
    }
}

