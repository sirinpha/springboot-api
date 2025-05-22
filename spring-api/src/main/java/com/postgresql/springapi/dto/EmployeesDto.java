package com.postgresql.springapi.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import lombok.Data;


@Data
public class EmployeesDto {
//Get Employee (Output)
    private Long id;

    private String name;

    private String email;

    private String position;

    private String department;

    private LocalDate joinDate;

    private BigDecimal salary;

    private String phone;

    private String address;

    private String role = "USER";

    private boolean enabled = true;


}
