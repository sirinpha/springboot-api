package com.postgresql.springapi.repository;

import com.postgresql.springapi.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    Optional<Employee> findByName(String name);

    boolean existsByName(String name);

    boolean existsByEmail(String email);

    @Query("SELECT e FROM Employee e WHERE " +
            "CAST(e.id AS string) LIKE :searchTerm OR " +
            "LOWER(e.email) LIKE :searchTerm OR " +
            "LOWER(e.name) LIKE :searchTerm")
    List<Employee> findBySearch(@Param("searchTerm") String searchTerm);
}
