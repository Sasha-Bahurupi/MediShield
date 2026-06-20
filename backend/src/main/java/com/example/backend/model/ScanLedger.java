package com.example.backend.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Column;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.JoinColumn;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ScanLedger {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long scanId;

    @ManyToOne
    @JoinColumn(name = "sku_id", referencedColumnName = "skuId", nullable = false)
    private ProductRegistry productRegistry;

    @Column(nullable = false, length = 50)
    private String pharmacistId;

    @Column(nullable = false)
    private Double latitude;

    @Column(nullable = false)
    private Double longitude;

    @Column(nullable = false)
    private LocalDateTime scanTimestamp;

    @Column(length = 100)
    private String clientDeviceId;

    @Column(nullable = false)
    private Boolean isSyncedOffline = false;

    @Column(nullable = false)
    private Integer systemRiskScore;

    @Column(nullable = false)
    private Double aiConfidenceScore;

    @Column(nullable = false, length = 20)
    private String statusVerdict;
}
