package com.example.backend.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class VerificationDTO {
    private String skuId;
    private String pharmacistId;
    private Double latitude;
    private Double longitude;
    private LocalDateTime scanTimestamp;
    private String clientDeviceId;
    private Boolean isSyncedOffline;
    private String imageBase64; 
}
