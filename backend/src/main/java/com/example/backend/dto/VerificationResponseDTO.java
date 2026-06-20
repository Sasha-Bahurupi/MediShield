package com.example.backend.dto;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class VerificationResponseDTO {
    private String skuId;
    private Integer systemRiskScore;
    private Double aiConfidenceScore;
    private String statusVerdict;
    private String message;
}
