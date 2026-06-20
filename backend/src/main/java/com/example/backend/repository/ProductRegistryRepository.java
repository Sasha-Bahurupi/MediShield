package com.example.backend.repository;

import com.example.backend.model.ProductRegistry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductRegistryRepository extends JpaRepository<ProductRegistry, String> {
}
