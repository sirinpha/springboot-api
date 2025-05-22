package com.postgresql.springapi.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;


@Data
public class EmployeeCreateDto {
//Create Employee (Input)
    private String password;

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
