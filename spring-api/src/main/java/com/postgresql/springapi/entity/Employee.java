package com.postgresql.springapi.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Date;

@Data
@Entity
@Table(name = "employees")
public class Employee {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String position;

    @Column(nullable = false)
    private String department;

    @Column(name = "join_date", nullable = false)
    private LocalDate joinDate;

    private BigDecimal salary;

    private String phone;

    private String address;

    @Column(nullable = false)
    private String role = "USER";

    @Column(name = "created_at")
    private Date createdAt;

    @Column(name = "enabled")
    private Boolean enabled;

    @PrePersist
    public void prePersist() {
        if (this.joinDate == null) {
            this.joinDate = LocalDate.now(); // กำหนดค่าเป็นวันที่ปัจจุบันหากไม่ถูกกำหนด
        }
    }


}
