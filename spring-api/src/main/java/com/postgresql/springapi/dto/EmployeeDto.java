package com.postgresql.springapi.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Date;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class EmployeeDto {

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

    private Date createdAt;

    private Boolean enabled;


}
