package com.example.backend.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Column;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductRegistry {

    @Id
    @Column(length = 50)
    private String skuId;

    @Column(nullable = false, length = 100)
    private String productName;

    @Column(nullable = false, length = 50)
    private String batchNumber;

    @Column(nullable = false)
    private LocalDateTime manufacturingDate;

    @Column(nullable = false)
    private LocalDateTime expiryDate;

    @Column(nullable = false, length = 100)
    private String intendedRegion;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String manufacturerSignature;
}
