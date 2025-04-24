package com.postgresql.jwt.repository;

import com.postgresql.jwt.model.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<Employee, Long> {
    Optional<Employee> findByName(String name);
    boolean existsByName(String name);
    List<Employee> findByNameContainingIgnoreCase(String name);
    boolean existsByEmail(String email);
}